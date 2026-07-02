import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api/types";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Eye, EyeOff } from "lucide-react";

type Mode = "signin" | "signup" | "verify-phone";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: Mode;
};

export const AuthDialog = ({ open, onOpenChange, defaultMode = "signin" }: Props) => {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const { login, register, sendOtp, verifyOtp, user } = useAuth();
  const { toast } = useToast();

  const [showSigninPassword, setShowSigninPassword] = useState(false);

const [showSignupPassword, setShowSignupPassword] = useState(false);

const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  const [verifyPhone, setVerifyPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [changingPhone, setChangingPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setSignupName("");
    setSignupEmail("");
    setSignupPhone("");
    setSignupPassword("");
    setSignupConfirmPassword("");
    setSigninEmail("");
    setSigninPassword("");
    setVerifyPhone("");
    setOtp("");
    setOtpSent(false);
    setChangingPhone(false);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      resetForm();
    }
  }, [open, defaultMode]);

  useEffect(() => {
    if (mode === "verify-phone" && !changingPhone) {
      if (user?.phone) setVerifyPhone(user.phone);
      else if (signupPhone) setVerifyPhone(signupPhone);
    }
  }, [mode, user, signupPhone, changingPhone]);

  const normalizePhone = (value: string) => value.replace(/\D/g, "").slice(0, 10);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(signupName, signupEmail, signupPassword, signupConfirmPassword, signupPhone);
      setMode("verify-phone");
      toast({
        title: "Account created",
        description: "Please verify your phone number to continue.",
      });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not create account."));
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(signinEmail, signinPassword);

      if (result.requires_phone_verification) {
        setMode("verify-phone");
        toast({
          title: "Phone not verified",
          description: "Please verify your phone number to continue.",
        });
      } else {
        toast({
          title: "Welcome back",
          description: "Signed in successfully.",
        });
        onOpenChange(false);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (verifyPhone.length < 10) {
      setError("Enter a valid phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (user?.phone && verifyPhone !== user.phone) {
        await customerDashboardApi.updateProfile({ phone: verifyPhone });
      }

      await sendOtp(verifyPhone);
      setOtpSent(true);
      setChangingPhone(false);
      toast({
        title: "OTP sent",
        description: "Check your phone for the OTP.",
      });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not send OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpSent) {
      await handleSendOtp();
      return;
    }

    if (otp.length !== 6) {
      setError("Enter the 6 digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyOtp(verifyPhone, otp);
      toast({
        title: "Phone verified",
        description: "Your phone number has been verified.",
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Invalid or expired OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      await sendOtp(verifyPhone);
      setOtp("");
      toast({
        title: "OTP resent",
        description: "Check your phone for the new OTP.",
      });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not resend OTP."));
    } finally {
      setLoading(false);
    }
  };

  const switchToSignin = () => {
    setMode("signin");
    setError(null);
  };

  const handleChangePhone = () => {
    setOtp("");
    setOtpSent(false);
    setChangingPhone(true);
    setError(null);
  };

  const switchToSignup = () => {
    setMode("signup");
    setError(null);
  };

  const title =
    mode === "signin"
      ? "Welcome back"
      : mode === "signup"
        ? "Create account"
        : "Verify your phone";

  const description =
    mode === "signin"
      ? "Sign in to your OJAS account."
      : mode === "signup"
        ? "Start your wellness journey with OJAS."
        : "We need to verify your phone number before you can continue.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-border bg-card p-0 shadow-2xl">
        <div className="sticky top-0 z-10 bg-card px-5 pt-6 pb-4 sm:px-8 sm:pt-8 border-b border-border/50">
          <DialogHeader className="text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
              {mode === "verify-phone" ? "Verification" : "OJAS Account"}
            </p>

            <DialogTitle className="font-display text-2xl sm:text-3xl font-semibold leading-tight">
              {title}
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          {mode !== "verify-phone" && (
            <div className="flex rounded-full bg-secondary p-1 mt-5">
              <button
                type="button"
                onClick={switchToSignin}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
                  mode === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={switchToSignup}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="signup_name">Full name</Label>
                <Input
                  id="signup_name"
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="John Doe"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup_email">Email</Label>
                <Input
                  id="signup_email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup_phone">Phone number</Label>
                <Input
                  id="signup_phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(normalizePhone(e.target.value))}
                  placeholder="9876543210"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
  <Label htmlFor="signup_password">Password</Label>

  <div className="relative">
    <Input
      id="signup_password"
      type={showSignupPassword ? "text" : "password"}
      value={signupPassword}
      onChange={(e) => setSignupPassword(e.target.value)}
      placeholder="Min. 8 characters"
      className="h-11 rounded-xl pr-11"
      minLength={8}
      required
    />

    <button
      type="button"
      onClick={() => setShowSignupPassword((v) => !v)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {showSignupPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>
</div>

              <div className="space-y-1.5">
                <Label htmlFor="signup_confirm_password">Confirm password</Label>
                <Input
                  id="signup_confirm_password"
                  type="password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="h-11 rounded-xl"
                  minLength={8}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={
                  loading ||
                  !signupName ||
                  !signupEmail ||
                  !signupPhone ||
                  !signupPassword ||
                  !signupConfirmPassword
                }
                className="mt-2 h-12 w-full rounded-full bg-primary text-base font-medium hover:bg-primary-glow"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
            </form>
          )}

          {mode === "signin" && (
            <form onSubmit={handleSignin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin_email">Email</Label>
                <Input
                  id="signin_email"
                  type="email"
                  value={signinEmail}
                  onChange={(e) => setSigninEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
  <Label htmlFor="signin_password">Password</Label>

  <div className="relative">
    <Input
      id="signin_password"
      type={showSigninPassword ? "text" : "password"}
      value={signinPassword}
      onChange={(e) => setSigninPassword(e.target.value)}
      placeholder="Enter your password"
      className="h-11 rounded-xl pr-11"
      required
    />

    <button
      type="button"
      onClick={() => setShowSigninPassword((v) => !v)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {showSigninPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>
</div>

              <Button
                type="submit"
                disabled={loading || !signinEmail || !signinPassword}
                className="h-12 w-full rounded-full bg-primary text-base font-medium hover:bg-primary-glow"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>
            </form>
          )}

          {mode === "verify-phone" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="verify_phone">Phone number</Label>
                <Input
                  id="verify_phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={verifyPhone}
                  onChange={(e) => {
                    const nextPhone = normalizePhone(e.target.value);
                    setVerifyPhone(nextPhone);
                    setChangingPhone(!!user?.phone && nextPhone !== user.phone);
                    setOtp("");
                    setOtpSent(false);
                  }}
                  placeholder="9876543210"
                  className="h-11 rounded-xl"
                  disabled={loading}
                />

                {user?.phone && !otpSent && !changingPhone && (
                  <button
                    type="button"
                    onClick={handleChangePhone}
                    disabled={loading}
                    className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                  >
                    Change phone number
                  </button>
                )}
              </div>

              {!otpSent ? (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || verifyPhone.length < 10}
                  className="h-12 w-full rounded-full bg-primary text-base font-medium hover:bg-primary-glow"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="block text-center">Enter OTP</Label>

                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup className="mx-auto gap-1 sm:gap-2">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>

                    <p className="text-center text-xs text-muted-foreground">
                      OTP sent to {verifyPhone}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="h-12 w-full rounded-full bg-primary text-base font-medium hover:bg-primary-glow"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
                  </Button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="mx-auto block text-xs font-medium text-accent hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>

                  <button
                    type="button"
                    onClick={handleChangePhone}
                    disabled={loading}
                    className="mx-auto block text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    Change phone number
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={switchToSignin}
                className="mx-auto block text-xs text-muted-foreground hover:text-foreground"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
