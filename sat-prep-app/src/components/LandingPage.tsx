"use client";

import { useEffect, useRef, useState } from "react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import {
  Leaf,
  Target,
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  BarChart,
  CheckCircle2,
} from "lucide-react";
import {
  captureEvent,
  getFeatureFlagVariant,
  onFeatureFlagsLoaded,
} from "@/lib/analytics";

interface LandingPageProps {
  onStartPractice?: () => void;
}

export default function LandingPage({ onStartPractice }: LandingPageProps) {
  const { user } = useUser();
  const authState = user ? "signed_in" : "signed_out";
  const [heroCtaLabel, setHeroCtaLabel] = useState("Unlock Access");
  const trackedVariantRef = useRef<string | null>(null);

  const trackLandingCta = (
    ctaId: string,
    destination: string,
    authState: "signed_in" | "signed_out"
  ) => {
    captureEvent("cta_clicked", {
      page: "landing",
      cta_id: ctaId,
      destination,
      auth_state: authState,
    });
  };

  useEffect(() => {
    const updateCtaFromExperiment = () => {
      const variant = getFeatureFlagVariant("landing_hero_cta_copy");
      const normalizedVariant =
        variant === "start_now"
          ? "start_now"
          : variant === "join_club"
            ? "join_club"
            : "control";

      if (trackedVariantRef.current !== normalizedVariant) {
        trackedVariantRef.current = normalizedVariant;

        captureEvent("experiment_exposed", {
          experiment: "landing_hero_cta_copy",
          variant: normalizedVariant,
        });
      }

      if (normalizedVariant === "start_now") {
        setHeroCtaLabel("Start Raising My Score");
        return;
      }

      if (normalizedVariant === "join_club") {
        setHeroCtaLabel("Join the Club");
        return;
      }

      setHeroCtaLabel("Unlock Access");
    };

    updateCtaFromExperiment();
    const unsubscribe = onFeatureFlagsLoaded(updateCtaFromExperiment);

    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center selection:bg-[var(--grass-light)] selection:text-[var(--forest)]">
      {/* ═══════════════════════════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--paper-cream)]/80 backdrop-blur-md border-b border-[var(--paper-lines)]/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--forest)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--forest)]/20">
              <Leaf className="w-5 h-5 text-[var(--paper-cream)]" />
            </div>
            <span className="font-display text-2xl font-bold text-[var(--ink-black)] tracking-tight">
              the1600club<span className="text-[var(--grass-dark)]">.</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/pricing"
              onClick={() => {
                trackLandingCta("nav_membership", "/pricing", authState);
              }}
              className="font-body text-[var(--ink-faded)] hover:text-[var(--ink-black)] transition-colors text-sm font-medium tracking-wide uppercase"
            >
              Membership
            </Link>
            <Link
              href="/articles"
              onClick={() => {
                trackLandingCta("nav_manifesto", "/articles", authState);
              }}
              className="font-body text-[var(--ink-faded)] hover:text-[var(--ink-black)] transition-colors text-sm font-medium tracking-wide uppercase"
            >
              Manifesto
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  onClick={() => {
                    trackLandingCta("nav_log_in", "sign_in_modal", "signed_out");
                  }}
                  className="font-body text-sm font-semibold text-[var(--ink-black)] hover:text-[var(--grass-dark)] transition-colors px-4 py-2"
                >
                  Log In
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button
                  type="button"
                  onClick={() => {
                    trackLandingCta("nav_join_club", "sign_in_modal", "signed_out");
                  }}
                  className="btn-grass text-sm px-6 py-2.5 shadow-none hover:shadow-lg transition-all duration-300"
                >
                  Join the Club
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                onClick={() => {
                  trackLandingCta("nav_dashboard", "/dashboard", "signed_in");
                }}
                className="font-body text-sm font-semibold text-[var(--ink-black)] hover:text-[var(--grass-dark)] transition-colors px-4 py-2 mr-2"
              >
                Dashboard
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "w-10 h-10 rounded-xl" } }} />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          HERO & VALUE PROP (Single screen layout)
          ═══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full flex flex-col justify-center items-center pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center w-full mt-8 lg:mt-16">

          {/* Left Column: Copy */}
          <div className="flex flex-col items-start max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[var(--paper-warm)] border border-[var(--paper-lines)] rounded-full px-4 py-2 mb-8 fade-in-up" style={{ animationDelay: '0ms' }}>
              <Sparkles className="w-4 h-4 text-[var(--grass-dark)]" />
              <span className="font-body text-xs text-[var(--ink-black)] font-semibold tracking-widest uppercase">
                The New Standard in SAT Prep
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-[var(--ink-black)] leading-[1.1] mb-6 fade-in-up tracking-tight" style={{ animationDelay: '100ms' }}>
              Tasteful prep. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--forest)] to-[var(--grass-light)]">
                Relentless results.
              </span>
            </h1>

            <p className="font-body text-xl text-[var(--ink-faded)] mb-10 leading-relaxed fade-in-up max-w-lg" style={{ animationDelay: '200ms' }}>
              We stripped away the noise, the expensive tutors, and the clunky platforms. What's left is a beautifully engineered system designed for one thing: getting you to 1600.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto fade-in-up" style={{ animationDelay: '300ms' }}>
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    onClick={() => {
                      onStartPractice?.();
                      trackLandingCta("hero_primary", "sign_in_modal", "signed_out");
                    }}
                    className="btn-grass text-lg px-8 py-4 flex items-center justify-center gap-3 w-full sm:w-auto hover:scale-105 transition-transform"
                  >
                    <span>{heroCtaLabel}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  onClick={() => {
                    trackLandingCta("hero_dashboard", "/dashboard", "signed_in");
                  }}
                  className="btn-grass text-lg px-8 py-4 flex items-center justify-center gap-3 w-full sm:w-auto hover:scale-105 transition-transform"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </SignedIn>

              <div className="flex items-center gap-3 text-[var(--ink-faded)] text-sm font-medium">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--paper-warm)] border border-[var(--paper-lines)] shadow-sm">
                  <Zap className="w-4 h-4 text-[var(--sunflower)] fill-[var(--sunflower)]" />
                </span>
                <span>Unlimited practice. <br />$199 for 3 months.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bento Box Value Display */}
          <div className="grid grid-cols-2 gap-4 lg:pl-10 fade-in-up w-full" style={{ animationDelay: '400ms' }}>

            {/* Bento 1: Adaptive Learning */}
            <div className="col-span-2 sm:col-span-1 bg-white p-6 rounded-3xl border border-[var(--paper-lines)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--grass-light)]/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
              <Brain className="w-8 h-8 text-[var(--grass-dark)] mb-4 relative z-10" />
              <h3 className="font-display text-xl font-bold text-[var(--ink-black)] mb-2 relative z-10">Smart Adaptive</h3>
              <p className="font-body text-[var(--ink-faded)] text-sm relative z-10">Our algorithm learns your weaknesses and ruthlessly drills them until they become strengths.</p>
            </div>

            {/* Bento 2: Analytics */}
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[var(--forest)] to-[var(--grass-dark)] p-6 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                <BarChart className="w-32 h-32 text-white" />
              </div>
              <BarChart className="w-8 h-8 text-white mb-4 relative z-10" />
              <h3 className="font-display text-xl font-bold text-white mb-2 relative z-10">Granular Tracking</h3>
              <p className="font-body text-white/80 text-sm relative z-10">Every question is logged. Watch your score rise with beautiful, actionable insights.</p>
            </div>

            {/* Bento 3: Unlimited & Infinite */}
            <div className="col-span-2 bg-[var(--paper-warm)] p-6 rounded-3xl border border-[var(--paper-lines)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-[var(--ink-black)]" />
                  <h3 className="font-display text-xl font-bold text-[var(--ink-black)]">Infinite Question Bank</h3>
                </div>
                <p className="font-body text-[var(--ink-faded)] text-sm max-w-sm">Never see the same question twice. Real SAT simulation, anytime, anywhere. Your pace, your schedule.</p>
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl border border-[var(--paper-lines)] flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--grass-dark)]" />
                  <span className="font-body text-xs font-bold text-[var(--ink-black)]">Reading & Writing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--grass-dark)]" />
                  <span className="font-body text-xs font-bold text-[var(--ink-black)]">Math (Calc & No Calc)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          MINIMAL FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="w-full py-8 border-t border-[var(--paper-lines)] bg-[var(--paper-cream)] mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[var(--grass-dark)]" />
            <span className="font-display text-lg font-bold text-[var(--ink-black)]">the1600club.</span>
          </div>
          <p className="font-body text-[var(--ink-faded)] text-xs font-medium uppercase tracking-widest">
            © {new Date().getFullYear()} No Tutors. Just Results.
          </p>
        </div>
      </footer>
    </div>
  );
}
