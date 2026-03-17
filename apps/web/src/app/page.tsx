"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, Database, Store, Shield, Sparkles, Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <header className="border-b border-slate-200/80 sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-semibold text-lg flex items-center gap-2 text-slate-800 hover:text-cyan-600 transition"
          >
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Database className="w-5 h-5 text-white" />
            </span>
            Data Wallet
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-16">
        {/* Hero with gradient background */}
        <section className="relative text-center mb-24 -mx-4 px-4 py-20 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-90 hero-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%230891b2\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
          <div className="relative stagger-children">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" /> Like UPI, but for your data
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 text-slate-800 animate-fade-in-up">
              Your data. Your asset.{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Your income.
              </span>
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-10 animate-fade-in-up animate-delay-1">
              Connect your wallet, upload data, set permissions. Companies pay you in tokens for
              anonymized insights.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animate-delay-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-6 py-3 font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Wallet className="w-5 h-5" />
                Open Dashboard
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-700 border-2 border-slate-200 px-6 py-3 font-semibold hover:border-cyan-300 hover:bg-cyan-50/50 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Store className="w-5 h-5" />
                Marketplace
              </Link>
              <Link
                href="/company"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-6 py-3 font-semibold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <Building2 className="w-5 h-5" />
                Company Portal
              </Link>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 stagger-children">
          {[
            {
              icon: Wallet,
              title: "Connect & Create DID",
              desc: "Sign in with your Web3 wallet. Get a decentralized identity (DID) tied to your address.",
              color: "from-cyan-500 to-cyan-600",
              bg: "bg-cyan-50",
            },
            {
              icon: Database,
              title: "Upload & Encrypt",
              desc: "Health, fitness, shopping, location—encrypted and stored on decentralized storage (IPFS).",
              color: "from-teal-500 to-teal-600",
              bg: "bg-teal-50",
            },
            {
              icon: Shield,
              title: "AI Privacy Layer",
              desc: "Companies get insights, not raw data. AI anonymizes so you stay in control.",
              color: "from-emerald-500 to-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover-lift ${bg} hover:shadow-lg transition-shadow`}
            >
              <span
                className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${color} items-center justify-center shadow-lg mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </span>
              <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
