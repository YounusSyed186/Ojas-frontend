import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Star, Calendar, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { doctorApi } from "@/lib/api/doctorApi";
import { consultationApi } from "@/lib/api/consultationApi";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage, type Doctor } from "@/lib/api/types";
import doc1 from "@/assets/doc-1.jpg";
import doc2 from "@/assets/doc-2.jpg";
import doc3 from "@/assets/doc-3.jpg";

const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayCheckoutOptions = {
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

type RazorpayWindow = Window & {
  Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
};

const imageMap: Record<string, string> = {
  "aarti-mehta": doc1,
  "rohan-iyer": doc2,
  "priya-nair": doc3,
};

const timeSlots = ["10:00", "11:30", "14:00", "16:30", "18:00"];

const loadRazorpayCheckout = () =>
  new Promise<void>((resolve, reject) => {
    const razorpayWindow = window as RazorpayWindow;
    if (razorpayWindow.Razorpay) {
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

const ExpertDetail = () => {
  const { slug = "" } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorApi.getAll(),
  });
  const [slot, setSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const { data: feeData } = useQuery({
    queryKey: ["consultation-fee"],
    queryFn: () => consultationApi.getFee(),
    enabled: isAuthenticated,
  });

  const fee = feeData?.fee;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    if (!slot) return;
    setBooking(true);
    setError(null);
    try {
      const consultationResponse = await consultationApi.create({
        doctor_id: doc.id,
        preferred_slot_at: `${new Date().toISOString().split("T")[0]}T${slot}:00`,
        request_notes: `Booked via ${doc.name} profile`,
      });
      const consultationId = consultationResponse.consultation?.id;
      if (!consultationId) {
        throw new Error("Consultation was created without an id.");
      }

      const orderData = await consultationApi.createRazorpayOrder(consultationId);
      await loadRazorpayCheckout();

      const razorpayWindow = window as RazorpayWindow;
      if (!razorpayWindow.Razorpay) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      const checkout = new razorpayWindow.Razorpay({
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "OJAS",
        description: `${doc.name} consultation`,
        order_id: orderData.order.id,
        prefill: {
          name: user?.name,
          email: user?.email ?? undefined,
          contact: user?.phone ?? undefined,
        },
        theme: {
          color: "#315C4D",
        },
        handler: async (response) => {
          try {
            await consultationApi.verifyRazorpayPayment(consultationId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setDone(true);
            toast({
              title: "Consultation paid and booked",
              description: `Your consult with ${doc.name} is confirmed for ${slot}.`,
            });
          } catch (err: unknown) {
            setError(getApiErrorMessage(err, "Payment verification failed. Please contact support."));
          } finally {
            setBooking(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBooking(false);
            toast({
              title: "Payment pending",
              description: "Your consultation is created, but payment is not complete yet.",
            });
          },
        },
      });

      checkout.on?.("payment.failed", (response) => {
        setBooking(false);
        setError(response.error?.description || "Razorpay could not complete this payment.");
      });
      checkout.open();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not start consultation payment. Please try again."));
      setBooking(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Loading... — OJAS" description="">
        <div className="flex justify-center py-40"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      </PageLayout>
    );
  }

  const doctors: Doctor[] = data?.doctors ?? [];
  const doc = doctors.find((d) => d.slug === slug);
  if (!doc) return <Navigate to="/experts" replace />;

  return (
    <PageLayout title={`${doc.name} — OJAS`} description={doc.bio}>
      <section className="pt-28 md:pt-36 pb-24">
        <div className="container max-w-5xl">
          <Link to="/experts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> All experts
          </Link>

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-elegant">
                <img src={imageMap[doc.slug] || doc1} alt={doc.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 glass-dark text-primary-foreground text-xs px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Star className="w-3 h-3 fill-accent text-accent" /> {doc.rating}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">{doc.spec}</p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3">{doc.name}</h1>
              <div className="text-sm text-muted-foreground mt-2">{doc.exp} experience</div>
              <p className="text-lg text-muted-foreground mt-6 leading-relaxed">{doc.bio}</p>

              <div className="mt-6">
                <div className="text-sm font-medium mb-3">Areas of focus</div>
                <div className="flex flex-wrap gap-2">
                  {doc.focus.map((f: string) => (
                    <span key={f} className="text-xs px-3 py-1.5 rounded-full bg-accent/15 text-foreground border border-accent/30">{f}</span>
                  ))}
                </div>
              </div>

              <div className="mt-10 p-6 rounded-3xl glass shadow-soft">
                {!done ? (
                  <>
                    <div className="flex items-center gap-2 text-sm font-medium mb-4">
                      <Calendar className="w-4 h-4 text-accent" /> Book a 30-min consult
                    </div>
                    {fee && (
                      <div className="text-xs text-muted-foreground mb-3">
                        Consultation fee: ₹{fee.amount}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSlot(s)}
                          className={`px-4 py-2 rounded-full text-sm border transition-all ${
                            slot === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {error && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    <Button
                      disabled={!slot || booking}
                      onClick={handleBooking}
                      className="mt-6 rounded-full h-12 px-8 bg-primary hover:bg-primary-glow"
                    >
                      {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : isAuthenticated ? "Confirm booking" : "Sign in to book"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-accent/15 grid place-items-center text-accent">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="font-display text-2xl mt-4">Consultation booked!</h3>
                    <p className="text-muted-foreground mt-2 text-sm">Your consult with {doc.name} is confirmed for {slot}.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </PageLayout>
  );
};

export default ExpertDetail;
