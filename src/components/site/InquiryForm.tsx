import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  destination: z.string().trim().max(120).optional().or(z.literal("")),
  travel_dates: z.string().trim().max(80).optional().or(z.literal("")),
  travelers: z.string().trim().max(40).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

type InquiryValues = z.infer<typeof inquirySchema>;

const InquiryForm = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<InquiryValues>({ resolver: zodResolver(inquirySchema) });

  const onSubmit = async (values: InquiryValues) => {
    setSubmitting(true);
    const destinationName = values.destination?.trim() || "";
    const destinationSlug = destinationName
      ? destinationName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : "general";

    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      destination_slug: destinationSlug,
      destination_name: destinationName || null,
      travel_dates: values.travel_dates || null,
      travellers: values.travelers || null,
      budget_per_person: values.budget || null,
      itinerary_title: values.message ? `Message: ${values.message}` : null,
    };

    const { error } = await supabase.from("enquiries").insert(payload);

    // Mirror to Google Sheets (non-blocking — never block UX on this)
    try {
      await supabase.functions.invoke("enquiry-to-sheet", {
        body: { ...payload, message: values.message || null },
      });
    } catch (_) {
      /* sheet sync failures don't affect the user */
    }

    setSubmitting(false);

    if (error) {
      toast({
        title: "Could not send your enquiry",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Enquiry received",
      description: "Our travel curator will reach out within a few hours.",
    });
    reset();
  };

  const inputCls =
    "w-full bg-transparent border-b border-border/60 focus:border-gold outline-none px-0 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors";
  const labelCls =
    "text-[10px] uppercase tracking-luxe text-muted-foreground";
  const errCls = "text-xs text-destructive mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <div className="grid md:grid-cols-2 gap-7">
        <div>
          <label className={labelCls} htmlFor="name">Full Name</label>
          <input id="name" {...register("name")} className={inputCls} placeholder="Your name" />
          {errors.name && <p className={errCls}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="phone">Phone</label>
          <input id="phone" type="tel" {...register("phone")} className={inputCls} placeholder="+91 ..." />
          {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} className={inputCls} placeholder="you@email.com" />
        {errors.email && <p className={errCls}>{errors.email.message}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-7">
        <div>
          <label className={labelCls} htmlFor="destination">Destination of Interest</label>
          <input id="destination" {...register("destination")} className={inputCls} placeholder="Maldives, Europe..." />
        </div>
        <div>
          <label className={labelCls} htmlFor="travel_dates">Travel Dates</label>
          <input id="travel_dates" {...register("travel_dates")} className={inputCls} placeholder="Approx. month / year" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-7">
        <div>
          <label className={labelCls} htmlFor="travelers">Travellers</label>
          <input id="travelers" {...register("travelers")} className={inputCls} placeholder="2 adults, 1 child" />
        </div>
        <div>
          <label className={labelCls} htmlFor="budget">Budget Range</label>
          <input id="budget" {...register("budget")} className={inputCls} placeholder="₹ per person / total" />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="message">Tell us about your dream trip</label>
        <textarea
          id="message"
          {...register("message")}
          rows={4}
          className={`${inputCls} resize-none`}
          placeholder="Anything we should know..."
        />
        {errors.message && <p className={errCls}>{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-3 px-9 py-4 bg-gold text-primary-foreground text-xs uppercase tracking-luxe hover:bg-gold/90 transition disabled:opacity-60"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? "Sending..." : "Send Enquiry"}
      </button>
    </form>
  );
};

export default InquiryForm;
