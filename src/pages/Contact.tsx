import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactPage = () => {
  const [sent, setSent] = useState(false);

  return (
    <PageLayout title="Contact — OJAS" description="Talk to the OJAS team — questions, partnerships, press, or just to say hello.">
      <PageHero
        eyebrow="Get in touch"
        title={<>Let's <span className="italic text-gold text-accent-glow">talk</span>.</>}
        subtitle="Whether you're a curious eater, a clinic, or a brand we'd love to partner with — we read every message."
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />

      <section className="pb-24">
        <div className="container grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl glass shadow-soft">
              <Mail className="w-5 h-5 text-accent mb-3" />
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Email</div>
              <div className="font-medium mt-1">hello@ojas.health</div>
            </div>
            <div className="p-6 rounded-3xl glass shadow-soft">
              <Phone className="w-5 h-5 text-accent mb-3" />
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Phone</div>
              <div className="font-medium mt-1">+91 96403 64031</div>
            </div>
            <div className="p-6 rounded-3xl glass shadow-soft">
              <MapPin className="w-5 h-5 text-accent mb-3" />
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Kitchen</div>
              <div className="font-medium mt-1">Indiranagar · Bengaluru · India</div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="p-8 md:p-10 rounded-[2rem] bg-card shadow-elegant"
            >
              {!sent ? (
                <>
                  <h2 className="font-display text-3xl font-semibold">Send a note</h2>
                  <p className="text-sm text-muted-foreground mt-2">We reply within one business day.</p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-8">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">Name</label>
                      <Input required placeholder="Your name" className="mt-2 h-12 rounded-full px-5" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
                      <Input required type="email" placeholder="you@email.com" className="mt-2 h-12 rounded-full px-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
                    <Textarea required rows={5} placeholder="What's on your mind?" className="mt-2 rounded-2xl px-5 py-4" />
                  </div>
                  <Button type="submit" size="lg" className="mt-6 rounded-full h-12 px-8 bg-primary hover:bg-primary-glow gap-2">
                    Send message <Send className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-accent/15 grid place-items-center text-accent">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-3xl mt-5">Message sent</h3>
                  <p className="text-muted-foreground mt-3">We'll get back to you within a day.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ContactPage;
