"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, Database, Store, Shield, Sparkles, Building2, PartyPopper, Coins } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <header className="border-b border-white/10 sticky top-0 z-10 bg-slate-900/60 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-xl flex items-center gap-2 text-slate-100 hover:text-fuchsia-400 transition"
          >
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-amber-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30 animate-bounce-soft">
              <Database className="w-5 h-5 text-white" />
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-amber-400">DataKart</span>
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-16">
        {/* Hero with gradient background */}
        <section className="relative text-center mb-24 -mx-4 px-4 py-24 rounded-[3rem] overflow-hidden shadow-sm border border-white/10">
          <div className="absolute inset-0 opacity-40 hero-gradient bg-gradient-to-br from-fuchsia-900 via-slate-900 to-amber-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d946ef\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30 animate-pulse" />
          <div className="relative stagger-children">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 backdrop-blur text-fuchsia-400 px-5 py-2 text-sm font-bold mb-8 shadow-sm animate-fade-in border border-fuchsia-900/50">
              <PartyPopper className="w-4 h-4 animate-wiggle" /> Yay! Like UPI, but for your data ✨
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-100 animate-fade-in-up">
              Your data. Your rules.<br/>
              <span className="bg-gradient-to-r from-fuchsia-600 via-rose-500 to-amber-500 bg-clip-text text-transparent inline-block animate-float-fast">
                Your income! 💰
              </span>
            </h1>
            <p className="text-slate-300 text-xl font-medium max-w-2xl mx-auto mb-12 animate-fade-in-up animate-delay-1 leading-relaxed">
              Connect your wallet, securely upload your data, and set the fun rules. Companies will pay you in crypto for anonymized insights!
            </p>
            <div className="flex flex-wrap justify-center gap-5 animate-fade-in-up animate-delay-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 hover:from-fuchsia-400 to-rose-500 hover:to-rose-400 text-white px-8 py-4 font-bold text-lg shadow-xl shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Wallet className="w-6 h-6 animate-wiggle" />
                Let's Go!
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 backdrop-blur text-fuchsia-400 border-2 border-fuchsia-900/50 px-8 py-4 font-bold text-lg shadow-lg hover:border-fuchsia-500 hover:bg-slate-800 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Store className="w-6 h-6" />
                Explore Market
              </Link>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 stagger-children">
          {[
            {
              icon: Wallet,
              title: "1. Create Your Identity",
              desc: "Sign in with your Web3 wallet and get a fun, secure DID (Decentralized Identity) instantly. Zero hassle!",
              color: "from-fuchsia-400 to-fuchsia-600",
              bg: "bg-slate-900/50 border-white/10",
              iconBg: "bg-fuchsia-500",
            },
            {
              icon: Shield,
              title: "2. Securely Encrypt",
              desc: "Lock away your health, fitness, & shopping data in an encrypted magical vault. Safe and sound! 🔒",
              color: "from-rose-400 to-rose-600",
              bg: "bg-slate-900/50 border-white/10",
              iconBg: "bg-rose-500",
            },
            {
              icon: Coins,
              title: "3. Earn Tokens!",
              desc: "Companies get anonymized AI insights, and YOU get paid! Watch the shiny tokens roll in! 🪙",
              color: "from-amber-400 to-amber-600",
              bg: "bg-slate-900/50 border-white/10",
              iconBg: "bg-amber-500",
            },
          ].map(({ icon: Icon, title, desc, color, bg, iconBg }) => (
            <div
              key={title}
              className={`rounded-[2rem] border backdrop-blur-md p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgb(217,70,239,0.1)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] ${bg}`}
            >
              <span
                className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${color} items-center justify-center shadow-lg shadow-${iconBg}/30 mb-6`}
              >
                <Icon className="w-8 h-8 text-white" />
              </span>
              <h3 className="text-xl font-bold text-slate-100 mb-3">{title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
