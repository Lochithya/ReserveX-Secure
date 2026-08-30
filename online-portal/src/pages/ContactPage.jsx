import React, { useState } from "react";
import toast from "react-hot-toast";
import { submitContactForm } from "../services/contactService";
import { Mail, MapPin, Clock, Send, ArrowRight } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all fields.");
      return;
    }
    setIsSending(true);
    try {
      await submitContactForm(formData);
      toast.success("Message sent! We'll get back to you shortly.");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }

        .contact-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #f1f5f9;
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .contact-input::placeholder { color: rgba(255,255,255,0.3); }
        .contact-input:focus {
          border-color: rgba(96,165,250,0.7);
          background: rgba(255,255,255,0.10);
          box-shadow: 0 0 0 3px rgba(96,165,250,0.12);
        }
      `}</style>

      <div className="min-h-[calc(100vh-80px)] bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-8">
        <div className="max-w-5xl w-full">

          {/* ── Pill label ── */}
          <div className="flex justify-center mb-8 fade-up" style={{ animationDelay: "0ms" }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-600 text-xs font-bold uppercase tracking-widest">
              <Mail size={12} /> Support &amp; Enquiries
            </span>
          </div>

          {/* ── Main card ── */}
          <div
            className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/15 flex flex-col lg:flex-row fade-up"
            style={{ animationDelay: "60ms" }}
          >

            {/* ════ LEFT DARK PANEL ════ */}
            <div
              className="lg:w-[42%] relative flex flex-col justify-between p-10 sm:p-12 overflow-hidden"
              style={{ background: "linear-gradient(150deg, #153264 0%, #1a3d78 60%, #1e4585 100%)" }}
            >
              {/* Decorative blobs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }} />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />

              <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                  Let's Talk
                </h1>
                <p className="text-blue-100 text-sm leading-relaxed mb-10 max-w-xs">
                  Have a question about stall reservations or exhibitions? Our team is happy to help.
                </p>

                {/* Contact details */}
                <div className="space-y-7">
                  {[
                    {
                      icon: Mail,
                      title: "Email Us",
                      line1: "reservexprojects@gmail.com",
                      href: "mailto:reservexprojects@gmail.com",
                      line2: "We reply within 24 hours",
                      delay: "120ms"
                    },
                    {
                      icon: MapPin,
                      title: "Location",
                      line1: "BMICH, Colombo 07",
                      href: null,
                      line2: "Bandaranaike Memorial International Conference Hall",
                      delay: "180ms"
                    },
                    {
                      icon: Clock,
                      title: "Support Hours",
                      line1: "Mon – Fri · 8:00 AM – 5:00 PM",
                      href: null,
                      line2: "Sri Lanka Standard Time (SLST)",
                      delay: "240ms"
                    }
                  ].map(({ icon: Icon, title, line1, line2, href, delay }) => (
                    <div key={title} className="flex items-start gap-4 fade-up" style={{ animationDelay: delay }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                        <Icon size={17} className="text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200 mb-0.5">{title}</p>
                        {href
                          ? <a href={href} className="text-sm font-semibold text-white hover:text-blue-200 transition-colors">{line1}</a>
                          : <p className="text-sm font-semibold text-white">{line1}</p>
                        }
                        <p className="text-xs text-blue-200/70 mt-0.5 leading-relaxed">{line2}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom separator + stall map CTA */}
              <div className="relative z-10 mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-white/20" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Quick Access</span>
                  <div className="flex-1 h-px bg-white/20" />
                </div>

                <a
                  href="/stallMap"
                  className="flex items-center justify-between group px-5 py-3.5 rounded-2xl border border-white/20 hover:border-blue-300/50 transition-colors"
                  style={{ background: "rgba(255,255,255,0.10)" }}
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">Browse Stall Map</p>
                    <p className="text-xs text-blue-200/80 mt-0.5">Reserve your exhibition stall</p>
                  </div>
                  <ArrowRight size={16} className="text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>

            {/* ════ RIGHT FORM PANEL ════ */}
            <div className="lg:w-[58%] bg-white flex flex-col justify-center p-10 sm:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Send a Message</h2>
                <p className="text-slate-400 text-sm">Fill out the form and we'll respond within one business day.</p>
                <div className="mt-5 h-px w-full bg-slate-100" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Message <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Describe your enquiry or question..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>

                {/* Inline separator before CTA */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">Ready to send?</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none"
                >
                  <Send size={15} />
                  <span>{isSending ? "Sending…" : "Send Message"}</span>
                </button>

                <p className="text-center text-[11px] text-slate-400">
                  Your message is sent securely to our team. We do not share your information.
                </p>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;