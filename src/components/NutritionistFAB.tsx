import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Check, Sparkles, ArrowRight } from "lucide-react";

const CATEGORIES = [
  "Weight Loss",
  "Weight Gain",
  "Diabetes Management",
  "Fitness",
  "Detox",
  "Healthy Lifestyle",
  "Custom Plan",
];

// TODO: replace with the brand's real WhatsApp number (international format, no +)
const WHATSAPP_NUMBER = "919640364031";

export const NutritionistFAB = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState<string>("");

  const canSubmit = name.trim().length > 1 && goal.trim().length > 1 && category;

  const submit = () => {
    if (!canSubmit) return;
    setStep(2);
    const msg =
      `Hi OJAS team! I'd like to speak to a nutritionist.%0A%0A` +
      `*Name:* ${encodeURIComponent(name)}%0A` +
      `*Category:* ${encodeURIComponent(category)}%0A` +
      `*Goal / Requirement:* ${encodeURIComponent(goal)}`;
    setTimeout(() => {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank", "noopener,noreferrer");
    }, 1600);
  };

  const reset = () => {
    setOpen(false);
    setTimeout(() => {
      setStep(1);
      setName("");
      setGoal("");
      setCategory("");
    }, 300);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-[60] flex items-center gap-2">
        <AnimatePresence>
          {!open && (
            <motion.button
              key="fab"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setOpen(true)}
              className="group relative inline-flex items-center gap-2.5 rounded-full bg-primary text-primary-foreground pl-4 pr-5 py-3.5 shadow-elegant hover:bg-primary-glow transition-colors"
              aria-label="Speak to our nutritionist"
            >
              <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping opacity-60" aria-hidden />
              <span className="relative w-8 h-8 rounded-full bg-accent text-accent-foreground grid place-items-center shadow-gold">
                <MessageCircle className="w-4 h-4" />
              </span>
              <span className="relative text-sm font-medium hidden sm:inline">Speak to our nutritionist</span>
              <span className="relative text-sm font-medium sm:hidden">Nutritionist</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6 bg-foreground/30 backdrop-blur-sm"
            onClick={reset}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass relative w-full sm:max-w-md rounded-t-[2rem] sm:rounded-3xl overflow-hidden shadow-elegant"
            >
              {/* Header */}
              <div className="bg-primary text-primary-foreground p-5 pr-14 relative">
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 grid place-items-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground grid place-items-center shadow-gold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-display text-lg leading-tight">Speak to a nutritionist</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] opacity-70 mt-0.5">Personal · Free · Confidential</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">Your name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        maxLength={80}
                        className="mt-1.5 w-full rounded-2xl bg-background/60 border border-border px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">Goal / requirement</label>
                      <textarea
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Tell us briefly what you'd like help with"
                        rows={2}
                        maxLength={400}
                        className="mt-1.5 w-full rounded-2xl bg-background/60 border border-border px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">Pick a category</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => {
                          const active = category === c;
                          return (
                            <button
                              key={c}
                              onClick={() => setCategory(c)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs border transition-all ${
                                active
                                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                                  : "bg-background/60 border-border hover:border-primary/40"
                              }`}
                            >
                              {active && <Check className="w-3 h-3" />}
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      disabled={!canSubmit}
                      onClick={submit}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full h-12 bg-primary text-primary-foreground hover:bg-primary-glow disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-soft"
                    >
                      Continue on WhatsApp <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-center text-muted-foreground">
                      We'll connect you with our nutrition team shortly.
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-6 text-center"
                  >
                    <div className="mx-auto w-14 h-14 rounded-full bg-accent/15 text-accent grid place-items-center">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="font-display text-2xl mt-4">Thanks, {name.split(" ")[0]}!</div>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                      Our nutrition team will assist you shortly. Opening WhatsApp…
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      Connecting securely
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};