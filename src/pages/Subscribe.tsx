import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  Loader2,
  LockKeyhole,
  MapPin,
  ShoppingBag,
  Sparkles,
  Utensils,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { plansApi } from "@/lib/api/plansApi";
import { subscriptionApi } from "@/lib/api/subscriptionApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { mealTemplatesApi } from "@/lib/api/mealTemplatesApi";
import { pincodeApi } from "@/lib/api/pincodeApi";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/roles";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage, type ApiValidationError } from "@/lib/api/types";
import { AuthDialog } from "@/components/AuthDialog";

type Step = "plan" | "account" | "health" | "address" | "meals" | "payment" | "success";

type Plan = {
  id: number;
  name: string;
  description?: string | null;
  period: string;
  price?: number | string | null;
  meal_plan_template_id?: number | null;
};

type HealthDetails = {
  age: string;
  weight: string;
  height: string;
  goal: string;
  allergies: string;
  medical_conditions: string;
};

type MealOption = {
  id: number;
  meal_type: string;
  title: string;
  calories?: number | null;
};

type MealTemplate = {
  id: number;
  meal_options?: MealOption[];
};

type MealPref = {
  meal_type: string;
  meal_option_id: number;
};

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayCheckout = {
  open: () => void;
  on?: (event: "payment.failed", callback: (response: RazorpayFailureResponse) => void) => void;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

const STEPS = [
  { key: "plan", label: "Plan", icon: Sparkles },
  { key: "account", label: "Account", icon: LockKeyhole },
  { key: "health", label: "Health", icon: Heart },
  { key: "address", label: "Address", icon: MapPin },
  { key: "meals", label: "Meals", icon: Utensils },
  { key: "payment", label: "Payment", icon: CreditCard },
] as const;

const GOALS = ["Weight loss", "Weight gain", "Diabetes management", "Fitness", "Detox", "General wellness"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "shots"];
const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const initialHealth: HealthDetails = {
  age: "",
  weight: "",
  height: "",
  goal: "General wellness",
  allergies: "",
  medical_conditions: "",
};

const getApiError = (err: unknown, fallback: string) => getApiErrorMessage(err, fallback);

const formatPrice = (price?: number | string | null) => {
  const amount = Number(price ?? 0);

  if (!Number.isFinite(amount)) {
    return "Rs. -";
  }

  return `Rs. ${amount.toLocaleString("en-IN")}`;
};

const formatPeriod = (period?: string) => (period ? period.replace(/_/g, " ") : "-");

const loadRazorpayCheckout = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Razorpay Checkout failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay Checkout failed to load."));
    document.body.appendChild(script);
  });

const Subscribe = () => {
  const [params] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const dashboardPath = getDashboardPath(user?.role);
  const [step, setStep] = useState<Step>("plan");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(() => {
    const rawPlan = params.get("plan");
    const parsedPlan = rawPlan ? Number(rawPlan) : null;
    return parsedPlan && Number.isFinite(parsedPlan) ? parsedPlan : null;
  });
  const [health, setHealth] = useState(initialHealth);
  const [pincode, setPincode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [mealPrefs, setMealPrefs] = useState<MealPref[]>([]);
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansApi.getAll(),
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ["meal-templates"],
    queryFn: () => mealTemplatesApi.getAll(),
    enabled: step === "meals",
  });

  const plans: Plan[] = (plansData?.plans ?? []).filter((plan): plan is Plan => typeof plan.id === "number");
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const templates: MealTemplate[] = templatesData?.templates ?? [];
  const selectedTemplate =
    templates.find((template) => template.id === selectedPlan?.meal_plan_template_id) ?? templates[0];
  const mealOptions = useMemo(() => selectedTemplate?.meal_options ?? [], [selectedTemplate]);

  const optionsByType = useMemo(() => {
    return mealOptions.reduce<Record<string, MealOption[]>>((groups, option) => {
      groups[option.meal_type] = groups[option.meal_type] ?? [];
      groups[option.meal_type].push(option);
      return groups;
    }, {});
  }, [mealOptions]);

  const createSub = useMutation({
    mutationFn: subscriptionApi.create,
    onSuccess: (data) => {
      setSubscriptionId(data.subscription.id);
      setStep("payment");
    },
    onError: (err) => {
      toast({
        title: "Subscription not created",
        description: getApiError(err, "Failed to create subscription."),
        variant: "destructive",
      });
    },
  });

  const createOrder = useMutation({
    mutationFn: paymentApi.createOrder,
  });

  const verifyPayment = useMutation({
    mutationFn: paymentApi.verifyPayment,
    onSuccess: () => {
      setStep("success");
      toast({ title: "Subscription started", description: "Your Razorpay payment was verified." });
    },
    onError: (err) => {
      toast({
        title: "Payment verification failed",
        description: getApiError(err, "Please contact support if the amount was debited."),
        variant: "destructive",
      });
    },
  });

  const canProceed = () => {
    switch (step) {
      case "plan":
        return selectedPlanId !== null;
      case "account":
        return isAuthenticated && !!user?.phone_verified_at;
      case "health":
        return health.age !== "" && health.weight !== "" && health.goal !== "";
      case "address":
        return pincode.length === 6 && pincodeValid === true && addressLine1 !== "" && city !== "";
      case "meals":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!canProceed()) {
      return;
    }

    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1].key);
    }
  };

  const prevStep = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) {
      setStep(STEPS[idx - 1].key);
    }
  };


  const checkPincode = async () => {
    if (pincode.length !== 6) {
      return;
    }

    setPincodeChecking(true);
    try {
      const data = await pincodeApi.validate(pincode);
      setPincodeValid(data.is_valid);

      if (!data.is_valid) {
        toast({ title: "Not serviceable", description: data.message, variant: "destructive" });
      }
    } catch {
      setPincodeValid(false);
      toast({ title: "Validation failed", description: "Could not check pincode.", variant: "destructive" });
    } finally {
      setPincodeChecking(false);
    }
  };

  const toggleMealPref = (mealType: string, optionId: number) => {
    setMealPrefs((prev) => {
      const existing = prev.findIndex((pref) => pref.meal_type === mealType);

      if (existing >= 0 && prev[existing].meal_option_id === optionId) {
        return prev.filter((pref) => pref.meal_type !== mealType);
      }

      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { meal_type: mealType, meal_option_id: optionId };
        return next;
      }

      return [...prev, { meal_type: mealType, meal_option_id: optionId }];
    });
  };

  const getSelectedOptionId = (mealType: string) =>
    mealPrefs.find((pref) => pref.meal_type === mealType)?.meal_option_id;

  const handleComplete = () => {
    if (!selectedPlanId || !isAuthenticated) {
      setStep("account");
      return;
    }

    createSub.mutate({
      subscription_plan_id: selectedPlanId,
      delivery_pincode: pincode,
      delivery_address_line_1: addressLine1,
      delivery_address_line_2: addressLine2 || undefined,
      delivery_city: city,
      delivery_state: stateVal || undefined,
      health_details: {
        age: Number(health.age),
        weight: Number(health.weight),
        height: health.height ? Number(health.height) : undefined,
        goal: health.goal,
        allergies: health.allergies || undefined,
        medical_conditions: health.medical_conditions || undefined,
      },
      meal_preferences: mealPrefs.length > 0 ? mealPrefs : undefined,
    });
  };

  const handlePayment = async () => {
    if (!subscriptionId) {
      return;
    }

    try {
      const orderData = await createOrder.mutateAsync({ subscription_id: subscriptionId });
      await loadRazorpayCheckout();

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      const checkout = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "OJAS",
        description: selectedPlan ? `${selectedPlan.name} subscription` : "OJAS subscription",
        order_id: orderData.order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: "#1f5f43",
        },
        handler: async (response) => {
          await verifyPayment.mutateAsync({
            subscription_id: subscriptionId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => {
            toast({ title: "Payment pending", description: "You can reopen checkout whenever you are ready." });
          },
        },
      });

      checkout.on?.("payment.failed", (response) => {
        toast({
          title: "Payment failed",
          description: response?.error?.description || "Razorpay could not complete this payment.",
          variant: "destructive",
        });
      });

      checkout.open();
    } catch (err: unknown) {
      const apiError = err as ApiValidationError;
      toast({
        title: "Checkout unavailable",
        description: String(getApiError(err, apiError.message || "Could not start Razorpay Checkout.")),
        variant: "destructive",
      });
    }
  };

  const currentIdx = STEPS.findIndex((s) => s.key === step);
  const isSubmitting = createSub.isPending || createOrder.isPending || verifyPayment.isPending;

  return (
    <>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <PageLayout title="Subscribe - OJAS" description="Start your personalised wellness journey.">
      <section className="pt-28 md:pt-36 pb-24">
        <div className="container max-w-3xl">
          {step !== "success" && (
            <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon;

                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                    >
                      {i < currentIdx ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-xs hidden sm:inline ${i <= currentIdx ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                    >
                      {s.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className={`w-8 h-px ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === "plan" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">Step 1</p>
                <h1 className="font-display text-4xl font-semibold mt-2">Choose your plan</h1>
                <p className="text-muted-foreground mt-2">Pick the plan that fits your lifestyle.</p>
              </div>
              {plansLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No plans available yet.</div>
              ) : (
                <div className="grid gap-4">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`text-left w-full p-6 rounded-2xl border-2 transition-all lift ${selectedPlanId === plan.id
                        ? "border-primary bg-primary/5 shadow-soft"
                        : "border-border bg-card hover:border-primary/40"
                        }`}
                    >
                      <div className="flex justify-between gap-4 items-start">
                        <div>
                          <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                          {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-display text-2xl font-semibold">{formatPrice(plan.price)}</div>
                          <div className="text-xs text-muted-foreground capitalize">/{formatPeriod(plan.period)}</div>
                        </div>
                      </div>
                      {selectedPlanId === plan.id && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                          <Check className="w-4 h-4" /> Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button onClick={nextStep} disabled={!canProceed()} className="rounded-full h-12 px-8">
                  Continue <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "account" && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">
                  Step 2
                </p>
                <h2 className="font-display text-3xl font-semibold mt-2">
                  Account
                </h2>
                <p className="text-muted-foreground mt-2">
                  Sign in or create an account to continue.
                </p>
              </div>

              {authLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : isAuthenticated && user?.phone_verified_at ? (
                <div className="rounded-2xl border bg-card p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold mt-4">
                    Signed in as {user?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.phone || user?.email}
                  </p>
                </div>
              ) : isAuthenticated && !user?.phone_verified_at ? (
                <div className="rounded-2xl border bg-card p-6 text-center space-y-4">
                  <h3 className="font-display text-xl font-semibold">
                    Your phone number is not verified
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please verify your phone number to continue with checkout.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setAuthDialogOpen(true)}
                    className="rounded-full h-12 px-8"
                  >
                    Verify now
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border bg-card p-6 text-center space-y-4">
                  <h3 className="font-display text-xl font-semibold">
                    Sign in to continue
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create an account or sign in to start your subscription.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setAuthDialogOpen(true)}
                    className="rounded-full h-12 px-8"
                  >
                    Sign in / Sign up
                  </Button>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button onClick={prevStep} variant="outline" className="rounded-full h-12 px-6">
                  <ChevronLeft className="mr-1 w-4 h-4" /> Back
                </Button>

                <Button onClick={nextStep} disabled={!canProceed()} className="rounded-full h-12 px-8">
                  Continue <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "health" && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">Step 3</p>
                <h2 className="font-display text-3xl font-semibold mt-2">Health details</h2>
                <p className="text-muted-foreground mt-2">Help us personalise your meals.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="30"
                    value={health.age}
                    onChange={(e) => setHealth({ ...health, age: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="65"
                    value={health.weight}
                    onChange={(e) => setHealth({ ...health, weight: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="165"
                    value={health.height}
                    onChange={(e) => setHealth({ ...health, height: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="goal">Goal</Label>
                  <select
                    id="goal"
                    value={health.goal}
                    onChange={(e) => setHealth({ ...health, goal: e.target.value })}
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm w-full"
                  >
                    {GOALS.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="allergies">Allergies (optional)</Label>
                <Input
                  id="allergies"
                  placeholder="Nuts, dairy, gluten..."
                  value={health.allergies}
                  onChange={(e) => setHealth({ ...health, allergies: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="medical_conditions">Medical conditions (optional)</Label>
                <Input
                  id="medical_conditions"
                  placeholder="Diabetes, PCOS, thyroid..."
                  value={health.medical_conditions}
                  onChange={(e) => setHealth({ ...health, medical_conditions: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex justify-between pt-4">
                <Button onClick={prevStep} variant="outline" className="rounded-full h-12 px-6">
                  <ChevronLeft className="mr-1 w-4 h-4" /> Back
                </Button>
                <Button onClick={nextStep} disabled={!canProceed()} className="rounded-full h-12 px-8">
                  Continue <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "address" && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">Step 4</p>
                <h2 className="font-display text-3xl font-semibold mt-2">Delivery address</h2>
                <p className="text-muted-foreground mt-2">Where should we deliver your meals?</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pincode">Pincode</Label>
                <div className="flex gap-2">
                  <Input
                    id="pincode"
                    placeholder="560001"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ""));
                      setPincodeValid(null);
                    }}
                    className="h-11 rounded-xl flex-1"
                  />
                  <Button onClick={checkPincode} disabled={pincode.length !== 6 || pincodeChecking} className="rounded-full h-11 px-6">
                    {pincodeChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                  </Button>
                </div>
                {pincodeValid === true && <p className="text-sm text-green-600 mt-1">Serviceable area</p>}
                {pincodeValid === false && <p className="text-sm text-red-500 mt-1">Not serviceable</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address_line_1">Address line 1</Label>
                <Input
                  id="address_line_1"
                  placeholder="Flat / House number, Building"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address_line_2">Address line 2 (optional)</Label>
                <Input
                  id="address_line_2"
                  placeholder="Street, Locality"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button onClick={prevStep} variant="outline" className="rounded-full h-12 px-6">
                  <ChevronLeft className="mr-1 w-4 h-4" /> Back
                </Button>
                <Button onClick={nextStep} disabled={!canProceed()} className="rounded-full h-12 px-8">
                  Continue <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "meals" && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">Step 5</p>
                <h2 className="font-display text-3xl font-semibold mt-2">Meal preferences</h2>
                <p className="text-muted-foreground mt-2">Choose your preferred meals.</p>
              </div>
              {templatesLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : mealOptions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No meal options available yet.</div>
              ) : (
                <div className="space-y-6">
                  {MEAL_TYPES.map((mealType) => {
                    const options = optionsByType[mealType] || [];
                    if (options.length === 0) {
                      return null;
                    }

                    const selectedId = getSelectedOptionId(mealType);

                    return (
                      <div key={mealType}>
                        <h3 className="text-sm font-medium capitalize mb-3">{mealType.replace(/_/g, " ")}</h3>
                        <div className="flex flex-wrap gap-2">
                          {options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => toggleMealPref(mealType, option.id)}
                              className={`px-4 py-2.5 rounded-full text-sm border transition-all ${selectedId === option.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:border-primary/40"
                                }`}
                            >
                              {option.title}
                              {option.calories && <span className="text-xs ml-1 opacity-70">({option.calories} kcal)</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex justify-between pt-4">
                <Button onClick={prevStep} variant="outline" className="rounded-full h-12 px-6">
                  <ChevronLeft className="mr-1 w-4 h-4" /> Back
                </Button>
                <Button onClick={handleComplete} disabled={isSubmitting} className="rounded-full h-12 px-8">
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Review & Pay <ChevronRight className="ml-1 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">Step 6</p>
                <h2 className="font-display text-3xl font-semibold mt-2">Complete payment</h2>
                <p className="text-muted-foreground mt-2">Razorpay will securely process your payment.</p>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-soft space-y-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium text-right">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium capitalize">{formatPeriod(selectedPlan?.period)}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Delivery pincode</span>
                  <span className="font-medium">{pincode}</span>
                </div>
                <div className="border-t pt-3 flex justify-between gap-4">
                  <span className="font-medium">Total</span>
                  <span className="font-display text-2xl font-semibold">{formatPrice(selectedPlan?.price)}</span>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button onClick={prevStep} variant="outline" className="rounded-full h-12 px-6">
                  <ChevronLeft className="mr-1 w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isSubmitting || !subscriptionId}
                  className="rounded-full h-12 px-8 bg-accent text-accent-foreground hover:bg-accent-glow"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Pay {formatPrice(selectedPlan?.price)} <ShoppingBag className="ml-1 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/15 grid place-items-center text-accent">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="font-display text-4xl font-semibold mt-6">Welcome to OJAS!</h2>
              <p className="text-muted-foreground mt-3 text-lg max-w-md mx-auto">
                Your Razorpay payment is verified and your subscription is active.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <Button asChild className="rounded-full h-12 px-8">
                  <Link to={dashboardPath}>
                    Go to Dashboard <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full h-12 px-8">
                  <Link to="/plans">Browse Plans</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
    </>
  );
};

export default Subscribe;
