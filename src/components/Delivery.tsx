import { useState } from "react";
import { MapPin, Loader2, CheckCircle2, AlertCircle, CalendarClock, Leaf, HeartPulse } from "lucide-react";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";
import { pincodeApi } from "@/lib/api/pincodeApi";
import lifestyle from "@/assets/lifestyle.jpg";

export const Delivery = () => {
  const [state, setState] = useState<"idle" | "loading" | "in" | "out" | "invalid">("idle");
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState("");

  const check = async () => {
    if (!pincode) {
      setState("invalid");
      setMessage("Please enter your 6-digit pincode.");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setState("invalid");
      setMessage("Pincode must contain exactly 6 digits.");
      return;
    }
    setState("loading");
    setMessage("");
    try {
      const data = await pincodeApi.validate(pincode);
      if (data.is_valid) {
        setState("in");
        setMessage(data.message || "Your pincode is serviceable!");
      } else {
        setState("out");
        setMessage(data.message || "Sorry, we don't deliver to this pincode yet.");
      }
    } catch {
      setState("out");
      setMessage("Could not validate. Please try again later.");
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="relative rounded-[2rem] overflow-hidden shadow-elegant">
          <img src={lifestyle} alt="Healthy lifestyle" loading="lazy" width={1536} height={1024} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/30" />
          <div className="relative grid lg:grid-cols-2 gap-10 p-8 md:p-14 lg:p-20 text-primary-foreground">
            <Reveal>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent-glow font-medium mb-3">Subscription wellness plans</p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05]">
                  A daily <span className="italic text-gold text-accent-glow">health routine</span>, delivered on schedule.
                </h2>
                <p className="mt-5 opacity-80 max-w-md text-lg">
                  Curated meal programs built around your goals — arriving fresh at your fixed daily delivery slot.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="glass-dark rounded-3xl p-7">
                <div className="text-sm uppercase tracking-widest opacity-70 mb-4">Check serviceability</div>
                <div className="flex items-center gap-2 bg-background/10 rounded-full pl-5 pr-2 py-2 border border-foreground/10">
                  <MapPin className="w-4 h-4 opacity-70" />
                  <input
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setState("idle");
                      setMessage("");
                    }}
                    id="serviceability-pincode"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    aria-invalid={state === "invalid"}
                    aria-describedby="serviceability-result"
                    placeholder="Enter your pincode"
                    maxLength={6}
                    className="flex-1 bg-transparent outline-none placeholder:text-primary-foreground/50 text-sm py-1.5"
                  />
                  <Button type="button" onClick={check} disabled={state === "loading"} size="sm" className="rounded-full h-9 bg-accent text-accent-foreground hover:bg-accent-glow px-4">
                    {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                  </Button>
                </div>

                <div id="serviceability-result" className="mt-5 min-h-[60px]" aria-live="polite">
                  {state === "in" && (
                    <div className="flex items-start gap-3 animate-fade-up">
                      <div className="w-8 h-8 rounded-full bg-accent/20 grid place-items-center text-accent-glow shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">You're in our service zone</div>
                        <div className="text-sm opacity-70">{message}</div>
                      </div>
                    </div>
                  )}
                  {state === "invalid" && (
                    <div className="flex items-start gap-3 animate-fade-up" role="alert">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 grid place-items-center text-red-200 shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">Enter a valid pincode</div>
                        <div className="text-sm opacity-80">{message}</div>
                      </div>
                    </div>
                  )}
                  {state === "out" && (
                    <div className="flex items-start gap-3 animate-fade-up">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 grid place-items-center text-destructive-foreground shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">We don't deliver here yet</div>
                        <div className="text-sm opacity-70">{message}</div>
                      </div>
                    </div>
                  )}
                  {state === "idle" && (
                    <div className="text-sm opacity-60">We deliver on fixed daily schedules across select neighbourhoods.</div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-foreground/10">
                  <div>
                    <div className="font-display text-2xl font-semibold flex items-center gap-1"><CalendarClock className="w-5 h-5" /></div>
                    <div className="text-[10px] uppercase tracking-widest opacity-70 mt-1">Scheduled slots</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-semibold flex items-center gap-1"><HeartPulse className="w-5 h-5" /></div>
                    <div className="text-[10px] uppercase tracking-widest opacity-70 mt-1">Personalised nutrition</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-semibold flex items-center gap-1"><Leaf className="w-5 h-5" /></div>
                    <div className="text-[10px] uppercase tracking-widest opacity-70 mt-1">Eco packaging</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
