"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowLeft, Database, Store, Settings, CreditCard, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-80 hero-gradient bg-gradient-to-br from-fuchsia-100 via-rose-50 to-amber-100 -z-10" />
        <Sparkles className="w-12 h-12 text-fuchsia-400 animate-bounce-soft" />
        <p className="text-slate-700 text-xl font-medium text-center max-w-sm">Connect your wallet to enter your magical dashboard! ✨</p>
        <div className="scale-110">
          <ConnectButton />
        </div>
        <Link href="/" className="text-fuchsia-600 hover:text-rose-500 hover:underline flex items-center gap-1 font-bold mt-4 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Go Back Home
        </Link>
      </div>
    );
  }

  const cards = [
    { href: "/dashboard/vault", icon: Database, title: "Data Vault", desc: "Upload and manage your data gracefully", color: "from-fuchsia-400 to-fuchsia-600", shadow: "shadow-fuchsia-500/30" },
    { href: "/marketplace", icon: Store, title: "Marketplace", desc: "Permissions & requests", color: "from-amber-400 to-amber-500", shadow: "shadow-amber-500/30" },
    { href: "/marketplace#bounties", icon: Sparkles, title: "Data Bounties", desc: "Earn big by joining bulk requests", color: "from-indigo-400 to-indigo-600", shadow: "shadow-indigo-500/30" },
    { href: "/dashboard/permissions", icon: Settings, title: "Permissions", desc: "Who can access what", color: "from-emerald-400 to-emerald-500", shadow: "shadow-emerald-500/30" },
    { href: "/dashboard/payments", icon: CreditCard, title: "Payments", desc: "Watch the tokens flow", color: "from-sky-400 to-blue-500", shadow: "shadow-blue-500/30" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/40 sticky top-0 z-10 bg-white/60 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-slate-600 hover:text-fuchsia-600 flex items-center gap-1 font-bold transition">
            <ArrowLeft className="w-5 h-5" /> Home
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold text-slate-800">Your Dashboard</h1>
          <Sparkles className="w-8 h-8 text-amber-500 animate-wiggle" />
        </div>
        <p className="text-slate-600 text-lg mb-10 font-medium">
          DID: <code className="text-fuchsia-700 bg-fuchsia-100/80 px-2 py-1 rounded-lg border border-fuchsia-200 shadow-sm font-bold">did:pde:{address?.slice(0, 10)}...</code>
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
          {cards.map(({ href, icon: Icon, title, desc, color, shadow }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-5 rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-md p-6 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group"
            >
              <span className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-fuchsia-600 transition-colors">{title}</h2>
                <p className="text-slate-600 font-medium">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
