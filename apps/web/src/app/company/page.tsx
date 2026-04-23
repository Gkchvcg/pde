"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatUnits, isHex, parseAbiItem, parseUnits } from "viem";
import { ArrowLeft, Building2, ShoppingCart, Shield, RefreshCcw, Eye, Database, Sparkles } from "lucide-react";
import { dataMarketplaceAbi } from "@/lib/contracts";
import { ERC20_ABI } from "@/lib/erc20";
import { useApiAuth } from "@/lib/useApiAuth";
import { withAuthHeaders } from "@/lib/apiAuth";
import { useToast } from "@/app/toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const LS_MARKETPLACE = "pde-marketplace-address";
const LS_TOKEN = "pde-data-token-address";

const CATEGORY_LABEL: Record<number, string> = {
  0: "HEALTH",
  1: "SHOPPING",
  2: "FITNESS",
  3: "LOCATION",
  4: "SOCIAL",
};

function shortenHex(value: string, length = 6) {
  if (!value) return "";
  if (!isHex(value)) return value;
  return `${value.slice(0, 2 + length)}...${value.slice(-length)}`;
}

export default function CompanyPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { token, ensureAuth } = useApiAuth();
  const toast = useToast();

  const [marketplaceAddress, setMarketplaceAddress] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("");

  const [loadingMarket, setLoadingMarket] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);

  const [offerAmount, setOfferAmount] = useState("5");
  const [selectedPermissionKey, setSelectedPermissionKey] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [viewer, setViewer] = useState<any>(null);
  const [loadingViewer, setLoadingViewer] = useState(false);
  const [bulkRequests, setBulkRequests] = useState<any[]>([]);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  
  const [bulkForm, setBulkForm] = useState({
    title: "",
    category: "HEALTH",
    targetCount: "1000",
    budget: "1000 POL",
    description: "",
    companyName: "",
    industry: "AI Research"
  });

  const [companyProfile, setCompanyProfile] = useState({
    name: "DataKart Partner",
    industry: "Technology",
    website: "https://datakart.io",
    bio: "We are building the future of decentralized data aggregation.",
    regId: "REG-2026-X89",
    contactEmail: "data@company.com",
    location: "San Francisco, CA",
    isSaved: false
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = localStorage.getItem(LS_MARKETPLACE);
    const t = localStorage.getItem(LS_TOKEN);
    if (m && isHex(m)) setMarketplaceAddress(m);
    if (t && isHex(t)) setTokenAddress(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (marketplaceAddress && isHex(marketplaceAddress)) localStorage.setItem(LS_MARKETPLACE, marketplaceAddress);
  }, [marketplaceAddress]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (tokenAddress && isHex(tokenAddress)) localStorage.setItem(LS_TOKEN, tokenAddress);
  }, [tokenAddress]);

  const selectedPermission = useMemo(() => {
    if (!selectedPermissionKey) return null;
    const [user, category] = selectedPermissionKey.split(":");
    return permissions.find((p) => p.user.toLowerCase() === user && String(p.category) === category) ?? null;
  }, [permissions, selectedPermissionKey]);

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && marketplaceAddress ? [address, marketplaceAddress as `0x${string}`] : undefined,
    query: { enabled: Boolean(address && isHex(tokenAddress) && isHex(marketplaceAddress)) },
  });

  const allowance = useMemo(() => allowanceRaw ? (allowanceRaw as bigint) : BigInt(0), [allowanceRaw]);

  const { data: txHash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });
  const busy = isPending || isConfirming;

  const refreshMarketplace = async () => {
    if (!publicClient || !isHex(marketplaceAddress)) return;
    setLoadingMarket(true);
    try {
      const latest = await publicClient.getBlockNumber();
      const lookback = BigInt(40000);
      const fromBlock = latest > lookback ? latest - lookback : BigInt(0);
      const logs = await publicClient.getLogs({
        address: marketplaceAddress as `0x${string}`,
        event: parseAbiItem("event PermissionCreated(bytes32 indexed permissionId, address indexed user, uint8 category, uint256 price)"),
        fromBlock, toBlock: latest,
      });
      const hydrated = await Promise.all(logs.map(async (l) => {
        const perm = await publicClient.readContract({
          address: marketplaceAddress as `0x${string}`, abi: dataMarketplaceAbi,
          functionName: "getPermission", args: [l.args.user, l.args.category],
        }) as any;
        return { ...perm, blockNumber: l.blockNumber };
      }));
      setPermissions(hydrated.filter(p => p.active).sort((a,b) => Number(b.blockNumber - a.blockNumber)));
    } catch (e) { console.error(e); } finally { setLoadingMarket(false); }
  };

  const refreshMyRequests = async () => {
    if (!publicClient || !address || !isHex(marketplaceAddress)) return;
    setLoadingRequests(true);
    try {
      const latest = await publicClient.getBlockNumber();
      const fromBlock = latest > BigInt(40000) ? latest - BigInt(40000) : BigInt(0);
      const logs = await publicClient.getLogs({
        address: marketplaceAddress as `0x${string}`,
        event: parseAbiItem("event RequestCreated(bytes32 indexed requestId, address requester, address dataOwner, uint8 category, uint256 amount)"),
        fromBlock, toBlock: latest,
      });
      const hydrated = await Promise.all(logs.filter(l => (l.args.requester as string).toLowerCase() === address.toLowerCase()).map(async (l) => {
        const req = await publicClient.readContract({
          address: marketplaceAddress as `0x${string}`, abi: dataMarketplaceAbi,
          functionName: "getRequest", args: [l.args.requestId],
        }) as any;
        return { ...req, requestId: l.args.requestId };
      }));
      setMyRequests(hydrated);
    } catch (e) { console.error(e); } finally { setLoadingRequests(false); }
  };

  const refreshBulkRequests = async () => {
    setLoadingBulk(true);
    try {
      const res = await fetch(`${API}/api/requests`);
      const data = await res.json();
      setBulkRequests(data.reverse());
    } catch (e) { console.error(e); } finally { setLoadingBulk(false); }
  };

  const submitBulkRequest = async () => {
    if (!bulkForm.title || !bulkForm.targetCount) return;
    const t = token ?? (await ensureAuth());
    try {
      const res = await fetch(`${API}/api/requests`, {
        method: "POST", headers: { ...withAuthHeaders(t), "Content-Type": "application/json" },
        body: JSON.stringify(bulkForm),
      });
      if (res.ok) {
        toast.push({ kind: "success", title: "Bounty Posted", message: "Your bulk data request is now live." });
        setShowBulkForm(false); refreshBulkRequests();
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (isConnected && isHex(marketplaceAddress)) {
      refreshMarketplace(); refreshMyRequests(); refreshBulkRequests();
    }
  }, [isConnected, address, marketplaceAddress]);

  const openInsight = async (cid: string) => {
    setViewer(null); setLoadingViewer(true);
    const t = token ?? (await ensureAuth());
    try {
      const res = await fetch(`${API}/api/insights/${encodeURIComponent(cid)}`, { headers: withAuthHeaders(t) });
      if (res.ok) { setViewer({ cid, kind: "insight", content: await res.json() }); return; }
      const res2 = await fetch(`${API}/api/data/media/${encodeURIComponent(cid)}`, { headers: withAuthHeaders(t) });
      const data2 = await res2.json();
      if (data2?.base64) { setViewer({ cid, kind: "media", mime: data2.mime, content: data2.base64 }); return; }
    } catch (e) {} finally { setLoadingViewer(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/80 sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="md:col-span-1 space-y-4">
            <div className="rounded-[2rem] border border-fuchsia-100 bg-white p-6 shadow-sm relative overflow-hidden">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-fuchsia-600" /> Company Profile
              </h3>
              <div className="space-y-3">
                <input placeholder="Name" className="w-full text-sm p-2 rounded-lg border border-fuchsia-50 bg-fuchsia-50/30" value={companyProfile.name} onChange={e => setCompanyProfile({...companyProfile, name: e.target.value})} />
                <input placeholder="Website" className="w-full text-sm p-2 rounded-lg border border-fuchsia-50 bg-fuchsia-50/30" value={companyProfile.website} onChange={e => setCompanyProfile({...companyProfile, website: e.target.value})} />
                <input placeholder="Reg ID" className="w-full text-sm p-2 rounded-lg border border-fuchsia-50 bg-fuchsia-50/30" value={companyProfile.regId} onChange={e => setCompanyProfile({...companyProfile, regId: e.target.value})} />
                <textarea placeholder="Bio" className="w-full text-sm p-2 rounded-lg border border-fuchsia-50 bg-fuchsia-50/30 h-20" value={companyProfile.bio} onChange={e => setCompanyProfile({...companyProfile, bio: e.target.value})} />
                <button onClick={() => toast.push({kind:"success", title:"Saved"})} className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-xs">Save Profile</button>
              </div>
            </div>
            <div className="rounded-[2rem] border border-fuchsia-100 bg-gradient-to-br from-fuchsia-600 to-purple-700 p-6 text-white shadow-xl shadow-fuchsia-200">
              <h4 className="font-bold mb-2 flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4" /> Why verify?</h4>
              <p className="text-[11px] leading-relaxed opacity-90">Verified companies receive 3x more data contributions.</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3 text-slate-800 animate-fade-in-up">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center shadow-xl shadow-fuchsia-200">
                <Building2 className="w-6 h-6 text-white" />
              </span>
              Company Portal
            </h1>
            <p className="text-slate-500 font-medium max-w-xl">Manage bounties and access insights.</p>

            {!isConnected ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><ConnectButton /></div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-800 mb-2 text-sm">Marketplace listings</h3>
                    <div className="space-y-2">
                      {permissions.map(p => (
                        <button key={p.user} onClick={() => setSelectedPermissionKey(`${p.user.toLowerCase()}:${p.category}`)} className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs truncate">
                          {shortenHex(p.user)} - {CATEGORY_LABEL[p.category]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-indigo-900 flex items-center gap-2 text-sm"><Database className="w-4 h-4" /> Bulk Bounties</h3>
                      <button onClick={() => setShowBulkForm(!showBulkForm)} className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-lg">{showBulkForm ? "Cancel" : "+ New"}</button>
                    </div>
                    {showBulkForm && (
                      <div className="mb-6 p-4 bg-white rounded-xl border border-indigo-100 space-y-3">
                        <input placeholder="Title" className="w-full text-xs p-2 rounded-lg border border-indigo-50" value={bulkForm.title} onChange={e => setBulkForm({...bulkForm, title: e.target.value})} />
                        <button onClick={submitBulkRequest} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Post Bounty</button>
                      </div>
                    )}
                    <div className="space-y-3">
                      {bulkRequests.map(req => (
                        <div key={req.id} className="p-3 bg-white rounded-xl border border-indigo-100">
                          <h4 className="font-bold text-slate-800 text-xs truncate">{req.title}</h4>
                          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${(req.count/req.targetCount)*100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
