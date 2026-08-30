import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  ShieldCheck,
  QrCode,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Store,
  Users,
  CheckCircle2,
  BookOpen,
  Cpu,
  ShoppingBag
} from "lucide-react";

const AboutPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const exhibitions = [
    {
      id: 1,
      name: "Colombo International Book Fair 2026",
      tagline: "Connecting Publishers, Authors & Millions of Readers",
      category: "Literature & Education",
      date: "Sep 18 - Sep 27, 2026",
      venue: "BMICH, Colombo 07",
      stalls: "400+ Stalls",
      icon: BookOpen,
      color: "from-blue-600 to-indigo-600",
      accent: "bg-blue-50 text-blue-700 border-blue-200",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop",
      description: "Sri Lanka's flagship cultural phenomenon, uniting publishers, distributors, and readers for over 22 editions."
    },
    {
      id: 2,
      name: "National Consumer Expo 2026",
      tagline: "Premier Marketplace for Retail, Lifestyle & F&B",
      category: "Consumer Goods & F&B",
      date: "Oct 10 - Oct 15, 2026",
      venue: "BMICH, Colombo 07",
      stalls: "250+ Stalls",
      icon: ShoppingBag,
      color: "from-amber-600 to-orange-600",
      accent: "bg-amber-50 text-amber-700 border-amber-200",
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop",
      description: "A massive expo celebrating consumer electronics, apparel, handicrafts, and artisanal food vendors."
    },
    {
      id: 3,
      name: "Tech & Innovation Summit 2026",
      tagline: "The Future of Digital Enterprise & Startups",
      category: "Technology & Software",
      date: "Nov 05 - Nov 08, 2026",
      venue: "BMICH, Colombo 07",
      stalls: "180+ Stalls",
      icon: Cpu,
      color: "from-emerald-600 to-teal-600",
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
      description: "Showcasing next-generation software, IoT advancements, digital services, and startup innovations."
    }
  ];

  const faqs = [
    {
      q: "What is ReserveX and how does the multi-event system work?",
      a: "ReserveX is an enterprise stall reservation and event management platform. Vendors can explore current and upcoming exhibitions, compare venues and dates, then choose an event before viewing its available stalls."
    },
    {
      q: "How do I reserve a stall for an exhibition?",
      a: "Open the Exhibitions page, use the filters to find your event, view the event details, then select available stalls for that specific exhibition."
    },
    {
      q: "What authentication methods does ReserveX support?",
      a: "ReserveX features enterprise-grade Single Sign-On (SSO) powered by Auth0 / OpenID Connect (supporting Google, Microsoft, and GitHub), in addition to standard manual email & password registration with BCrypt hashing."
    },
    {
      q: "How does QR-Code verification work for approved reservations?",
      a: "Once an organizer or employee approves your stall reservation, a unique cryptographically-hashed QR code and confirmation receipt are generated and made available on your Home page for fast on-site check-in."
    },
    {
      q: "Can I manage genre categories for each booked stall?",
      a: "Yes! From your vendor Home page (/home), you can customize the specific literary or commercial genres displayed in each of your reserved stalls to maximize footfall and customer engagement."
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-800">

      {/* ── 1. Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white py-20 lg:py-28">
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/10 filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-500/10 filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Multi-Event Reservation Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
              Empowering the <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">Commercial &amp; Cultural Future</span> of Sri Lanka
            </h1>

            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              ReserveX is the all-in-one stall management platform connecting exhibition organizers, 
              publishers, and commercial vendors across major national expos — featuring real-time grid allocation, 
              instant OIDC authentication, and QR verification.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/exhibitions")}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Store className="w-4 h-4" />
                <span>Explore Exhibitions</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/contact")}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm transition-all"
              >
                Get In Touch
              </button>
            </div>

            {/* Quick trust badges */}
            <div className="mt-10 pt-8 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OIDC &amp; Social SSO Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real-Time Grid Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant QR Invoicing</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop"
                alt="Exhibition Hall"
                className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-duration-500 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Featured Anchor Event</p>
                <h4 className="text-white font-bold text-base mt-1">Colombo International Book Fair 2026</h4>
                <p className="text-slate-300 text-xs mt-1">BMICH • Halls A, B, C &amp; Outdoor Clusters</p>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ── 2. Platform Stats ── */}
      <section className="py-12 -mt-8 relative z-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-5">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow text-center">
            <h3 className="text-3xl lg:text-4xl font-extrabold text-blue-600">3+</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">Major Annual Expos</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow text-center">
            <h3 className="text-3xl lg:text-4xl font-extrabold text-indigo-600">800+</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">Allocated Stalls</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow text-center">
            <h3 className="text-3xl lg:text-4xl font-extrabold text-emerald-600">100K+</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">Projected Visitors</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow text-center">
            <h3 className="text-3xl lg:text-4xl font-extrabold text-amber-600">100%</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">OIDC &amp; QR Verified</p>
          </div>

        </div>
      </section>


      {/* ── 3. Featured Exhibitions Section (Multi-Event Upgrade) ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Active Expos &amp; Summits
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Explore Hosted Exhibitions
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Reserve your organization's physical stall across diverse industries and venues.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {exhibitions.map((expo) => {
              const Icon = expo.icon;
              return (
                <div
                  key={expo.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={expo.image}
                      alt={expo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${expo.accent}`}>
                        {expo.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-blue-200">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{expo.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 text-blue-600">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">{expo.stalls}</span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {expo.name}
                      </h3>

                      <p className="text-slate-500 text-xs mt-1.5 font-medium">{expo.tagline}</p>
                      <p className="text-slate-600 text-xs mt-3 leading-relaxed">{expo.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{expo.venue}</span>
                      </div>

                      <button
                        onClick={() => navigate("/exhibitions")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Explore events</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ── 4. Platform Capabilities & Venue Infrastructure ── */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Enterprise Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Designed for Scale, Security &amp; Ease
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              From interactive grid visualization to automated QR check-in, ReserveX streamlines every stage of exhibition management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              
              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-blue-200 transition-colors">
                <div className="p-3 rounded-xl bg-blue-100/80 text-blue-600 flex-shrink-0 h-fit">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Interactive Stall Grid Mapping</h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                    Select small, medium, or large stalls (Standard, Premium, Corner) arranged in a real-time coordinate grid with clear pricing and instant reservation locks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-indigo-200 transition-colors">
                <div className="p-3 rounded-xl bg-indigo-100/80 text-indigo-600 flex-shrink-0 h-fit">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">OIDC &amp; Multi-Tenant Auth0 SSO</h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                    Secure vendor access with Google, Microsoft, GitHub, or custom email/password authentication backed by cryptographic RS256 token verification.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-emerald-200 transition-colors">
                <div className="p-3 rounded-xl bg-emerald-100/80 text-emerald-600 flex-shrink-0 h-fit">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Instant QR Invoices &amp; Verification</h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                    Every approved booking generates an encrypted QR pass sent to your email, enabling seamless on-site validation at BMICH or expo reception desks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-amber-200 transition-colors">
                <div className="p-3 rounded-xl bg-amber-100/80 text-amber-600 flex-shrink-0 h-fit">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Category &amp; Genre Personalization</h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                    Tag each stall with relevant business categories (F&amp;B, Literature, Electronics, Crafts) and book genres to help attendees locate your stall effortlessly.
                  </p>
                </div>
              </div>

            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200"
                  alt="Modern Convention Centre"
                  className="w-full h-[450px] object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -left-6 p-5 rounded-2xl bg-white shadow-xl border border-slate-100 max-w-xs hidden sm:block">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live System Active</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Real-time synchronization across database clusters ensures zero double-booking conflicts.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ── 5. Frequently Asked Questions (FAQ Accordion) ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm mt-2">Everything you need to know about reserving stalls with ReserveX.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="text-slate-800 font-bold text-sm sm:text-base pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                      size={20}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ── 6. Bottom Call to Action Banner ── */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Exhibit Your Business?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Join hundreds of leading publishers, manufacturers, and technology innovators. Reserve your stall before quotas fill up!
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/exhibitions")}
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-blue-700 bg-white hover:bg-blue-50 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Explore Exhibitions
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-700/60 hover:bg-blue-700 border border-white/20 transition-all"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
