import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateInquiry } from "@workspace/api-client-react";
import { Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().regex(/^\+?[0-9().\-\s]{7,25}$/, "Enter a valid phone number, including country code when applicable"),
  organization: z.string().optional(),
  interest: z.string().min(1, "Please select an area of interest"),
  message: z.string().optional(),
  marketingConsent: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function Contact() {
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      organization: "",
      interest: "",
      message: "",
      marketingConsent: true,
    }
  });

  const createInquiry = useCreateInquiry();

  const onSubmit = (data: FormValues) => {
    createInquiry.mutate(
      { data },
      {
        onSuccess: () => {
          setIsSuccess(true);
          reset();
        }
      }
    );
  };

  return (
    <section id="contact" className="py-24 bg-background border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#F47E200a_1px,transparent_1px),linear-gradient(to_bottom,#1388080a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-primary font-mono text-sm tracking-widest uppercase mb-4">Secure Channel</h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">INITIATE DEPLOYMENT</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">Request technical specifications, arrange a demonstration, or speak with our aerospace engineers about your operational requirements.</p>
        </div>

        <div className="bg-card border border-white/10 p-8 clip-edges shadow-2xl shadow-primary/5">
          {isSuccess ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <CheckCircle className="w-16 h-16 text-primary" />
              <div>
                <h4 className="text-2xl font-display font-bold text-white mb-2">Transmission Received</h4>
                <p className="text-muted-foreground max-w-md mx-auto">Our operations team has received your inquiry. A specialist will establish contact shortly.</p>
              </div>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-4 px-6 py-3 border border-white/10 text-sm font-bold uppercase tracking-wider hover:bg-white/5 transition-colors clip-edges"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input
                    {...register("name")}
                    className="w-full bg-background border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors focus:bg-primary/5"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <input 
                    {...register("email")}
                    type="email"
                    className="w-full bg-background border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors focus:bg-primary/5"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="w-full bg-background border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors focus:bg-primary/5"
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Organization (Optional)</label>
                  <input 
                    {...register("organization")}
                    className="w-full bg-background border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors focus:bg-primary/5"
                    placeholder="Company or Agency"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Area of Interest</label>
                  <select 
                    {...register("interest")}
                    className="w-full bg-background border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors focus:bg-primary/5 appearance-none"
                  >
                    <option value="" className="text-muted-foreground bg-card">Select System</option>
                    <option value="defence" className="text-white bg-card">Defence & Security</option>
                    <option value="industrial" className="text-white bg-card">Industrial Inspection</option>
                    <option value="emergency" className="text-white bg-card">Emergency Response</option>
                    <option value="infrastructure" className="text-white bg-card">Intelligent Infrastructure</option>
                  </select>
                  {errors.interest && <p className="text-red-400 text-xs mt-1">{errors.interest.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Message</label>
                <textarea 
                  {...register("message")}
                  rows={4}
                  className="w-full bg-background border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors focus:bg-primary/5 resize-none"
                  placeholder="Operational requirements..."
                />
                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
              </div>

              <div className="flex items-start gap-3 p-4 border border-white/5 bg-white/5">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  {...register("marketingConsent")}
                  className="mt-1 w-4 h-4 accent-primary"
                />
                <label htmlFor="marketingConsent" className="text-xs text-muted-foreground leading-tight">
                  I agree to receive marketing communications from ASP Aero Tech by email, phone, SMS, or WhatsApp. I can unsubscribe at any time.
                </label>
              </div>

              {createInquiry.error && (
                <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
                  Failed to transmit data. Please try again or check connection.
                </div>
              )}

              <button 
                type="submit" 
                disabled={createInquiry.isPending}
                className="w-full py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest clip-edges hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createInquiry.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Transmitting...</>
                ) : (
                  "Submit Inquiry"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
