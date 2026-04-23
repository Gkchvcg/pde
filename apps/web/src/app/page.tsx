"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, Database, Store, Shield, Sparkles, Building2, PartyPopper, Coins, Info, Mail, MessageSquare, ShieldCheck, Scale, Globe, Github, Twitter, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import AIChatBot from "@/components/AIChatBot";

export default function Home() {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-600 to-sky-400 z-50 transition-all duration-100"
        style={{ width: `${(offset / (typeof document !== "undefined" ? document.documentElement.scrollHeight - window.innerHeight : 1)) * 100}%` }}
      />

      {/* Parallax Background Layers */}
      <div className="bg-fixed-layer bg-layer-nodes" style={{ transform: `translateY(${offset * 0.1}px)` }} />
      <div className="bg-fixed-layer bg-layer-grid" style={{ transform: `translateY(${offset * 0.05}px)` }} />
      
      {/* Background Blobs */}
      <div className="bg-blob blob-1" style={{ transform: `translateY(${offset * 0.2}px)` }} />
      <div className="bg-blob blob-2" style={{ transform: `translateY(${offset * 0.1}px)` }} />
      <div className="bg-blob blob-3" style={{ transform: `translateY(${offset * 0.15}px)` }} />

      <header className={`sticky top-0 z-40 transition-all duration-500 ${offset > 20 ? "bg-white/70 backdrop-blur-2xl py-3 border-b border-slate-200/50 shadow-lg" : "bg-transparent py-6"}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl flex items-center gap-2 text-slate-900 hover:text-indigo-600 transition">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-bounce-soft">
              <Database className="w-5 h-5 text-white" />
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500">DataKart</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="#home" className="text-base font-bold text-slate-700 hover:text-indigo-600 transition">Home</Link>
            <Link href="/marketplace" className="text-base font-bold text-slate-700 hover:text-indigo-600 transition">Marketplace</Link>
            <Link href="/dashboard" className="text-base font-bold text-slate-700 hover:text-indigo-600 transition">Dashboard</Link>
            <Link href="#about" className="text-base font-bold text-slate-700 hover:text-indigo-600 transition">About</Link>
            <Link href="#legal" className="text-base font-bold text-slate-700 hover:text-indigo-600 transition">Legal</Link>
            <Link href="#faq" className="text-base font-bold text-slate-700 hover:text-indigo-600 transition">FAQ</Link>
            <Link href="#contact" className="text-base font-bold text-slate-700 hover:text-indigo-600 transition">Contact</Link>
          </nav>

          <ConnectButton />
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div id="home">
          <section className="relative text-center mb-16 -mx-4 px-4 py-20 rounded-[4rem] overflow-hidden shadow-2xl border border-white/40 bg-white/10 backdrop-blur-3xl glass-premium">
            <div className="absolute inset-0 opacity-20 hero-gradient bg-gradient-to-br from-indigo-100 via-sky-50 to-purple-100" />
            <div className="relative stagger-children z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-600 px-5 py-2 text-sm font-bold mb-8 border border-indigo-200">
                <PartyPopper className="w-4 h-4 animate-wiggle" /> Yay! Like UPI, but for your data ✨
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.1]">
                The Global Data<br/>
                <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent inline-block animate-float-fast">
                  Aggregation Engine 🚀
                </span>
              </h1>
              <p className="text-slate-600 text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
                Companies request large-scale datasets. We source them securely from thousands of verified sellers. A seamless bridge between demand and supply.
              </p>
              
              <div className="mb-12 relative max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src="/hero_data_visualization_1776970394849.png" 
                  alt="Secure Data Vault Illustration" 
                  className="w-full h-auto transform hover:scale-105 transition duration-700"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-5">
                <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white px-8 py-4 font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <Wallet className="w-6 h-6" /> Let's Go!
                </Link>
                <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur text-indigo-600 border-2 border-indigo-200 px-8 py-4 font-bold text-lg shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <Store className="w-6 h-6" /> Explore Market
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/30 backdrop-blur-xl rounded-[2rem] p-10 border border-white/20 shadow-xl">
            {[
              { label: "Active Users", value: "12,400+", icon: Sparkles },
              { label: "Total Earned", value: "$2.4M", icon: Coins },
              { label: "Data Partners", value: "85+", icon: Building2 },
              { label: "Privacy Score", value: "99.9%", icon: Shield },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex p-4 rounded-2xl bg-indigo-50 mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-4xl font-black text-slate-900 mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </section>

          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 mb-4">Choose Your Portal</h2>
              <p className="text-slate-500 text-lg">We’ve separated the experience to keep things simple and powerful.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative p-10 bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white/40 shadow-2xl h-full flex flex-col">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-200">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">For Data Sellers</h3>
                  <p className="text-slate-600 text-lg mb-8 flex-1">Upload your images, health stats, or browsing data to your private vault. Contribute and earn tokens.</p>
                  <Link href="/dashboard" className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xl text-center hover:bg-indigo-700 transition shadow-xl">Seller Dashboard</Link>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative p-10 bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white/40 shadow-2xl h-full flex flex-col">
                  <div className="w-16 h-16 bg-fuchsia-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-fuchsia-200">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">For Companies</h3>
                  <p className="text-slate-600 text-lg mb-8 flex-1">Request large-scale datasets for AI training. We aggregate verified data from thousands of sources.</p>
                  <Link href="/company" className="w-full py-5 rounded-2xl bg-fuchsia-600 text-white font-black text-xl text-center hover:bg-fuchsia-700 transition shadow-xl">Company Portal</Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section id="about" className="py-16 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
              <Info className="w-8 h-8 text-indigo-600" /> About DataKart
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">We empower you to take control of your digital footprint and earn fairly.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-2">Our Mission</h3>
                <p className="text-indigo-800">To create a transparent data economy where users are partners, not products.</p>
              </div>
              <div className="p-6 rounded-2xl bg-sky-50 border border-sky-100">
                <h3 className="text-xl font-bold text-sky-900 mb-2">Privacy First</h3>
                <p className="text-sky-800">Your raw data never leaves your control. We only share anonymized insights.</p>
              </div>
            </div>
            <div className="relative h-96 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group">
              <img src="/privacy_security_shield_1776970414380.png" alt="Privacy Shield Security" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            </div>
          </div>
        </section>

        <section id="legal" className="py-16 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
              <Scale className="w-8 h-8 text-indigo-600" /> Legal & Compliance Framework
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Operating at the intersection of privacy laws and decentralized technology.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="p-8 rounded-3xl bg-white/40 border border-indigo-100 shadow-sm hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">EU GDPR Framework</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Implementation of <strong>Article 5 (Processing Principles)</strong> and <strong>Article 25 (Privacy by Design)</strong>.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/40 border border-sky-100 shadow-sm hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">CCPA / CPRA (USA)</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Compliance with the <strong>California Privacy Rights Act</strong> and automated decision-making opt-outs.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/40 border border-violet-100 shadow-sm hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">W3C DID Standards</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Adherence to <strong>Decentralized Identifiers v1.0</strong> for globally unique, verifiable IDs.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/40 border border-emerald-100 shadow-sm hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">HIPAA Compliance</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Strict standards for <strong>medical data anonymization</strong> and secure handling under US Federal law.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/40 border border-orange-100 shadow-sm hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Brazil LGPD</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Alignment with the <strong>Lei Geral de Proteção de Dados</strong> for data portability and user rights.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/40 border border-pink-100 shadow-sm hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Singapore PDPA</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Compliance with the <strong>Personal Data Protection Act</strong> regarding purpose and consent.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/40 border border-blue-100 shadow-sm hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">India DPDP 2023</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Ensuring clear consent frameworks and data fiduciary accountability in India.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/40 border border-slate-200 shadow-sm hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">APEC CBPR System</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Facilitating secure and trust-based cross-border data flows across the Asia-Pacific.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/40 border border-indigo-100 shadow-sm hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">ISO/IEC 27701</h3>
              <p className="text-slate-500 text-sm leading-relaxed">International standard for <strong>Privacy Information Management Systems (PIMS)</strong>.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="py-16 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">FAQ</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "Is my data really secure?", a: "Yes! We use industrial-grade encryption and Decentralized Identifiers (DIDs)." },
              { q: "How do I get paid?", a: "Payments are made automatically in crypto (POL/USDC) directly to your wallet." },
              { q: "Can I stop sharing?", a: "Absolutely. You have full control over your data permissions at all times." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="py-16 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
              <Mail className="w-8 h-8 text-indigo-600" /> Get in Touch
            </h2>
            <p className="text-slate-500 font-medium">Contact Maroof Husain directly for partnerships or support.</p>
          </div>
          <div className="max-w-3xl mx-auto p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl">
            <div className="mb-8 p-6 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">MH</div>
               <div>
                  <h4 className="font-bold text-indigo-900">Maroof Husain</h4>
                  <p className="text-indigo-600 text-sm font-medium">maroofhusain2006@gmail.com</p>
               </div>
            </div>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <input type="text" placeholder="Name" className="w-full p-3 rounded-xl border border-slate-200" />
              <input type="email" placeholder="Email" className="w-full p-3 rounded-xl border border-slate-200" />
              <textarea placeholder="Message" className="w-full p-3 rounded-xl border border-slate-200 h-32" />
              <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200">Send Message</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center md:text-left">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                <Database className="w-8 h-8 text-indigo-600" />
                <span className="text-2xl font-bold text-slate-900">DataKart</span>
              </div>
              <p className="text-slate-500 max-w-sm mx-auto md:mx-0">Empowering individuals to reclaim their digital value through secure data ownership.</p>
              <div className="mt-6 flex items-center gap-3 text-slate-400 justify-center md:justify-start">
                 <Link href="#" className="hover:text-indigo-600"><Github className="w-5 h-5" /></Link>
                 <Link href="#" className="hover:text-indigo-600"><Twitter className="w-5 h-5" /></Link>
                 <Link href="#" className="hover:text-indigo-600"><Linkedin className="w-5 h-5" /></Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Developer</h4>
              <p className="text-slate-900 font-bold mb-1">Maroof Husain</p>
              <p className="text-slate-500 text-xs">maroofhusain2006@gmail.com</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-3 text-slate-500 text-sm">
                <li><Link href="/marketplace" className="hover:text-indigo-600">Marketplace</Link></li>
                <li><Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
            © 2026 DataKart. Built with ❤️ by Maroof Husain. All rights reserved.
          </div>
        </div>
      </footer>
      <AIChatBot />
    </div>
  );
}
