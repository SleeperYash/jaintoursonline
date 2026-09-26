import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, waLink } from "@/lib/brand";

const steps = ["category", "destination", "date", "party", "people", "hotel", "style", "budget", "name", "phone", "email", "complete"] as const;
type Step = typeof steps[number];
type Answers = Partial<Record<"category" | "destination" | "date" | "party" | "people" | "hotel" | "style" | "budget" | "name" | "phone" | "email", string>>;

const india = ["Kashmir", "Himachal", "Kerala", "Rajasthan", "Goa", "North East", "Other Destination"];
const international = ["Thailand", "Vietnam", "Dubai", "Europe", "Sri Lanka", "Bali", "Other Destination"];
const options: Partial<Record<Step, string[]>> = {
  category: ["India", "International", "Cruise", "Flights", "Visa"],
  party: ["Solo", "Couple", "Family", "Friends", "Senior Citizens"],
  hotel: ["3★", "4★", "5★", "Luxury"],
  style: ["Relaxing", "Adventure", "Romantic", "Family", "Luxury"],
  budget: ["₹30–50K", "₹50K–1L", "₹1–2L", "₹2L+", "Enter Amount"],
};
const prompts: Record<Step, string> = {
  category: "Where would you like to travel?",
  destination: "Which destination is on your mind?",
  date: "When are you planning to travel?",
  party: "Who's travelling?",
  people: "How many travellers?",
  hotel: "Preferred hotel category?",
  style: "What kind of holiday would you like?",
  budget: "What's your approximate total budget?",
  name: "What should we call you?",
  phone: "Your WhatsApp / mobile number?",
  email: "What email can we reach you at?",
  complete: "Your journey starts here.",
};
const inputSteps: Partial<Record<Step, { type: string; placeholder: string; label: string }>> = {
  date: { type: "date", placeholder: "", label: "Travel date" },
  people: { type: "number", placeholder: "Total travellers", label: "Number of travellers" },
  name: { type: "text", placeholder: "Your name", label: "Full name" },
  phone: { type: "tel", placeholder: "10-digit mobile number", label: "Mobile number" },
  email: { type: "email", placeholder: "you@example.com", label: "Email address" },
};

const messageFor = (a: Answers) => [
  "New Travel Enquiry — Jain Tours & Travels",
  `Name: ${a.name}`,
  `Phone: ${a.phone}`,
  `Email: ${a.email}`,
  `Type: ${a.category}`,
  `Destination / Requirement: ${a.destination}`,
  `Travel date: ${a.date}`,
  `Travellers: ${a.people} (${a.party})`,
  `Hotel: ${a.hotel}`,
  `Style: ${a.style}`,
  `Total budget: ${a.budget}`,
  "Sent via Jain Tours Online Planner",
].join("\n");

async function saveEnquiry(a: Answers) {
  const destination = a.destination ?? "General";
  const payload = {
    name: a.name ?? "",
    phone: a.phone ?? "",
    email: a.email ?? "",
    destination_name: destination,
    destination_slug: destination.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "general",
    travel_dates: a.date ?? null,
    travellers: `${a.people} (${a.party})`,
    budget_per_person: a.budget ?? null,
    itinerary_title: `Planner: ${a.category}; hotel ${a.hotel}; style ${a.style}; total budget ${a.budget}`,
  };
  const { error } = await supabase.from("enquiries").insert(payload);
  if (error) {
    console.error("Planner enquiry could not be saved", error);
    return false;
  }
  try {
    await supabase.functions.invoke("enquiry-to-sheet", {
      body: { ...payload, message: `Category: ${a.category}; Party: ${a.party}; Hotel: ${a.hotel}; Style: ${a.style}; total budget: ${a.budget}` },
    });
  } catch (error) {
    console.error("Planner sheet sync failed", error);
  }
  return true;
}

const HolidayPlanner = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("category");
  const [answers, setAnswers] = useState<Answers>({});
  const [draft, setDraft] = useState("");
  const [custom, setCustom] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); triggerRef.current?.focus(); };
  }, [open]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [step, custom, error]);

  const advance = (key: keyof Answers, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setDraft(""); setCustom(false); setError("");
    const following = steps[steps.indexOf(step) + 1];
    if (following) setStep(following);
    if (following === "complete") {
      setSaved("saving");
      void saveEnquiry(next).then(ok => setSaved(ok ? "saved" : "failed")).catch(() => setSaved("failed"));
    }
  };

  const select = (value: string) => {
    if (value === "Other Destination" || value === "Enter Amount") {
      setCustom(true); setDraft(""); setError("");
    } else advance(step as keyof Answers, value);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value) { setError("Please enter a value to continue."); return; }
    if (step === "people" && (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 100)) { setError("Enter a number between 1 and 100."); return; }
    if (step === "phone" && value.replace(/\D/g, "").length < 10) { setError("Enter a valid mobile number."); return; }
    if (step === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError("Enter a valid email address."); return; }
    advance(step as keyof Answers, value);
  };

  const reset = () => { setStep("category"); setAnswers({}); setDraft(""); setCustom(false); setError(""); setSaved("idle"); };
  const goBack = () => {
    const previous = steps[steps.indexOf(step) - 1];
    if (previous) { setStep(previous); setCustom(false); setDraft(""); setError(""); }
  };
  const currentOptions = step === "destination" ? (answers.category === "India" ? india : answers.category === "International" ? international : []) : options[step] ?? [];
  const input = step === "destination" && currentOptions.length === 0
    ? { type: "text", placeholder: "Destination or requirement", label: "Destination or requirement" }
    : custom ? { type: step === "budget" ? "number" : "text", placeholder: step === "budget" ? "Amount in ₹" : "Tell us where", label: step === "budget" ? "Total budget in rupees" : "Your destination" }
    : inputSteps[step];
  const stepNumber = Math.min(steps.indexOf(step) + 1, steps.length - 1);

  return <>
    <Button ref={triggerRef} type="button" size="icon" aria-label="Open holiday planner" title="Plan your trip" onClick={() => setOpen(true)} className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary text-primary-foreground shadow-gold hover:bg-primary/90 focus-visible:ring-ring">
      <MessageCircle className="!h-6 !w-6 md:!h-7 md:!w-7" />
    </Button>
    {open && <>
      <div className="fixed inset-0 z-[70] bg-foreground/30 md:bg-foreground/20" onClick={() => setOpen(false)} aria-hidden="true" />
      <section role="dialog" aria-modal="true" aria-labelledby="planner-title" className="fixed inset-x-0 bottom-0 z-[71] flex h-[min(92dvh,740px)] flex-col overflow-hidden rounded-t-lg border border-border bg-background text-foreground shadow-gold md:inset-x-auto md:right-6 md:bottom-24 md:h-[min(660px,calc(100dvh-120px))] md:w-[390px] md:rounded-lg">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15"><MessageCircle className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><h2 id="planner-title" className="font-serif text-xl leading-tight">Jain Tours &amp; Travels</h2><p className="text-xs text-primary-foreground/80">Holiday Planner · India &amp; International</p></div>
          <Button ref={closeRef} type="button" size="icon" variant="ghost" aria-label="Close holiday planner" title="Close" onClick={() => setOpen(false)} className="shrink-0 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"><X /></Button>
        </header>
        <div className="h-1 shrink-0 bg-secondary"><div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${stepNumber / (steps.length - 1) * 100}%` }} /></div>
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
          <div className="mb-5 flex items-center justify-between text-xs text-muted-foreground"><span>YOUR JOURNEY</span><span>{step === "complete" ? "READY" : `${stepNumber} / ${steps.length - 1}`}</span></div>
          <div className="mb-5 flex items-start gap-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><MessageCircle className="h-4 w-4" /></span><p className="max-w-[85%] rounded-md rounded-tl-none bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground">{step === "category" ? "Welcome! " : ""}{prompts[step]}</p></div>
          {step === "complete" ? <div className="space-y-4">
            <div className="border border-border bg-card p-5 text-card-foreground"><div className="mb-3 flex items-center gap-2 text-primary"><Check className="h-5 w-5" /><strong className="font-serif text-xl">Thank you, {answers.name}!</strong></div><p className="text-sm text-muted-foreground">Your {answers.destination} enquiry is ready. Review it and send it to our travel team on WhatsApp.</p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-border pt-4 text-sm"><dt className="text-muted-foreground">Travel</dt><dd>{answers.destination} · {answers.date}</dd><dt className="text-muted-foreground">Guests</dt><dd>{answers.people} · {answers.party}</dd><dt className="text-muted-foreground">Hotel</dt><dd>{answers.hotel}</dd><dt className="text-muted-foreground">Budget</dt><dd>{answers.budget}</dd></dl>
            </div>
            <p aria-live="polite" className="text-xs text-muted-foreground">{saved === "saving" ? "Saving your enquiry…" : saved === "saved" ? "Your enquiry has been recorded." : saved === "failed" ? "We couldn't record your enquiry here. Please send it on WhatsApp." : ""}</p>
            <Button asChild className="w-full"><a href={waLink(messageFor(answers))} target="_blank" rel="noopener noreferrer"><Send /> Send Enquiry on WhatsApp</a></Button>
            <Button type="button" variant="ghost" className="w-full" onClick={reset}><RotateCcw /> Plan another trip</Button>
          </div> : <>
            {step !== "category" && <div className="mb-4 flex justify-end"><span className="max-w-[85%] rounded-md rounded-tr-none bg-primary px-4 py-2 text-sm text-primary-foreground">{step === "destination" ? answers.category : step === "date" ? answers.destination : step === "party" ? answers.date : step === "people" ? answers.party : step === "hotel" ? `${answers.people} travellers` : step === "style" ? answers.hotel : step === "budget" ? answers.style : step === "name" ? answers.budget : step === "phone" ? answers.name : answers.phone}</span></div>}
            {!custom && currentOptions.length > 0 && <div className="grid grid-cols-2 gap-2.5">{currentOptions.map((item) => <Button key={item} type="button" variant="outline" onClick={() => select(item)} className={`h-12 whitespace-normal border-border bg-card px-2 text-center text-sm text-card-foreground hover:border-primary hover:bg-secondary hover:text-primary ${item === "Other Destination" || item === "Enter Amount" ? "col-span-2" : ""}`}>{item}</Button>)}</div>}
            {input && <form onSubmit={submit} className="space-y-3"><label htmlFor="planner-input" className="block text-xs font-medium text-muted-foreground">{input.label}</label><input id="planner-input" autoFocus type={input.type} inputMode={step === "phone" ? "tel" : input.type === "number" ? "numeric" : undefined} min={input.type === "date" ? new Date().toISOString().slice(0, 10) : input.type === "number" ? "1" : undefined} max={step === "people" ? "100" : undefined} value={draft} onChange={(e) => { setDraft(e.target.value); setError(""); }} placeholder={input.placeholder} required className="h-12 w-full rounded-md border border-input bg-background px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /><Button type="submit" className="w-full">Continue <ArrowRight /></Button>{error && <p role="alert" className="text-xs text-destructive">{error}</p>}</form>}
            {step === "email" && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">By submitting, you authorize {BRAND.name} to contact you via Call/WhatsApp/Email about your enquiry. <Link to="/privacy" onClick={() => setOpen(false)} className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link></p>}
          </>}
        </div>
        {step !== "category" && step !== "complete" && <footer className="shrink-0 border-t border-border bg-background px-4 py-2"><Button type="button" variant="ghost" size="sm" onClick={goBack}><ArrowLeft /> Back</Button></footer>}
      </section>
    </>}
  </>;
};

export default HolidayPlanner;
