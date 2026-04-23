"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowLeft, Store, DollarSign, CreditCard, RefreshCcw, Sparkles } from "lucide-react";
import { formatUnits, isHex, parseAbiItem, parseUnits } from "viem";
import { DATA_MARKETPLACE_ADDRESS, dataMarketplaceAbi } from "@/lib/contracts";
import { useApiAuth } from "@/lib/useApiAuth";
import { withAuthHeaders } from "@/lib/apiAuth";
import { useToast } from "@/app/toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const MARKETPLACE_LS_KEY = "pde-marketplace-address";

const CATEGORIES = ["HEALTH", "SHOPPING", "FITNESS", "LOCATION", "SOCIAL"] as const;
type CategoryKey = (typeof CATEGORIES)[number];

const CATEGORY_TO_ENUM: Record<CategoryKey, number> = {
  HEALTH: 0,
  SHOPPING: 1,
  FITNESS: 2,
  LOCATION: 3,
  SOCIAL: 4,
};

function shortenHex(value: string, length = 6) {
  if (!value) return "";
  if (!isHex(value)) return value;
  return `${value.slice(0, 2 + length)}...${value.slice(-length)}`;
}

export default function MarketplacePage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { token, ensureAuth } = useApiAuth();
  const toast = useToast();

  const [marketplaceAddress, setMarketplaceAddress] = useState<string>(DATA_MARKETPLACE_ADDRESS);

  const [requestOwner, setRequestOwner] = useState("");
  const [requestCategory, setRequestCategory] = useState<CategoryKey>("FITNESS");
  const [offerAmount, setOfferAmount] = useState("5");
  const [requestIdInput, setRequestIdInput] = useState("");
  const [fulfillCid, setFulfillCid] = useState("");
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [myRequests, setMyRequests] = useState<
    {
      requestId: `0x${string}`;
      requester: `0x${string}`;
      dataOwner: `0x${string}`;
      category: number;
      offeredAmount: bigint;
      status: number;
      insightCid: string;
      createdAt: bigint;
      blockNumber: bigint;
    }[]
  >([]);
  const [bulkRequests, setBulkRequests] = useState<any[]>([]);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ tags: string; estimatedValue: string } | null>(null);

  const { data: earningsRaw, refetch: refetchEarnings } = useReadContract({
    address: marketplaceAddress as `0x${string}`,
    abi: dataMarketplaceAbi,
    functionName: "userEarnings",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && marketplaceAddress && isHex(marketplaceAddress)),
    },
  });

  const earnings = useMemo(() => {
    if (!earningsRaw) return "0";
    try {
      return formatUnits(earningsRaw as bigint, 18);
    } catch {
      return "0";
    }
  }, [earningsRaw]);

  const { data: permission } = useReadContract({
    address: marketplaceAddress as `0x${string}`,
    abi: dataMarketplaceAbi,
    functionName: "getPermission",
    args: address ? [address, CATEGORY_TO_ENUM[requestCategory]] : undefined,
    query: {
      enabled: Boolean(address && marketplaceAddress && isHex(marketplaceAddress)),
    },
  });

  const { data: txHash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isBusy = isPending || isConfirming;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (DATA_MARKETPLACE_ADDRESS) return;
    const saved = localStorage.getItem(MARKETPLACE_LS_KEY);
    if (saved && isHex(saved)) setMarketplaceAddress(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (marketplaceAddress && isHex(marketplaceAddress)) {
      localStorage.setItem(MARKETPLACE_LS_KEY, marketplaceAddress);
    }
  }, [marketplaceAddress]);

  const refreshVault = async () => {
    if (!address) return;
    const t = token ?? (await ensureAuth());
    if (!t) return;
    setLoadingVault(true);
    try {
      const res = await fetch(`${API}/api/data/vault/${address}`, { headers: withAuthHeaders(t) });
      const data = await res.json();
      if (Array.isArray(data)) setVaultItems(data.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVault(false);
    }
  };

  const analyzeSelectedImage = async () => {
    if (!fulfillCid) return;
    setAnalysisLoading(true);
    try {
      // For demo purposes, we simulate the analysis if it's not a real public URL
      // In production, we'd fetch the CID content first.
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" }) // Mock URL for demo
      });
      const data = await res.json();
      setAiAnalysis(data);
      toast.push({ kind: "success", title: "AI Scan Complete", message: `Detected: ${data.tags}` });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Load vault CIDs so the data owner can fulfill with a real CID.
  useEffect(() => {
    if (address && isConnected) void refreshVault();
  }, [address, isConnected]);

  const refreshMyRequests = async () => {
    if (!publicClient) return;
    if (!address) return;
    if (!marketplaceAddress || !isHex(marketplaceAddress)) return;

    setLoadingRequests(true);
    try {
      const latest = await publicClient.getBlockNumber();
      const lookback = BigInt(20000);
      const fromBlock = latest > lookback ? latest - lookback : BigInt(0);

      const requestCreated = parseAbiItem(
        "event RequestCreated(bytes32 indexed requestId, address requester, address dataOwner, uint8 category, uint256 amount)"
      );

      const logs = await publicClient.getLogs({
        address: marketplaceAddress as `0x${string}`,
        event: requestCreated,
        fromBlock,
        toBlock: latest,
      });

      const mine = logs
        .map((l) => ({
          requestId: l.args.requestId as `0x${string}`,
          requester: l.args.requester as `0x${string}`,
          dataOwner: l.args.dataOwner as `0x${string}`,
          category: Number(l.args.category),
          offeredAmount: l.args.amount as bigint,
          blockNumber: l.blockNumber ?? BigInt(0),
        }))
        .filter((l) => l.dataOwner?.toLowerCase?.() === address.toLowerCase());

      const uniqueById = new Map<string, typeof mine[number]>();
      for (const r of mine) uniqueById.set(r.requestId, r);
      const unique = Array.from(uniqueById.values()).sort((a, b) => Number(b.blockNumber - a.blockNumber));

      const hydrated = await Promise.all(
        unique.map(async (r) => {
          const req = (await publicClient.readContract({
            address: marketplaceAddress as `0x${string}`,
            abi: dataMarketplaceAbi,
            functionName: "getRequest",
            args: [r.requestId],
          })) as any;

          return {
            ...r,
            dataOwner: req.dataOwner as `0x${string}`,
            requester: req.requester as `0x${string}`,
            category: Number(req.category),
            offeredAmount: req.offeredAmount as bigint,
            status: Number(req.status),
            createdAt: req.createdAt as bigint,
            insightCid: req.insightCid as string,
          };
        })
      );

      setMyRequests(hydrated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRequests(false);
    }
  };

  const refreshBulkRequests = async () => {
    setLoadingBulk(true);
    try {
      const res = await fetch(`${API}/api/requests`);
      const data = await res.json();
      setBulkRequests(data.filter((r: any) => r.status === "open"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBulk(false);
    }
  };

  const contributeToBounty = async (requestId: string) => {
    if (!fulfillCid) {
      toast.push({ kind: "error", title: "Select Data First", message: "Pick an item from your vault to contribute." });
      return;
    }
    const t = token ?? (await ensureAuth());
    try {
      const res = await fetch(`${API}/api/requests/${requestId}/contribute`, {
        method: "POST",
        headers: {
          ...withAuthHeaders(t),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cid: fulfillCid }),
      });
      if (res.ok) {
        toast.push({ kind: "success", title: "Contribution Sent", message: "You've successfully joined the aggregation request!" });
        refreshBulkRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isConnected && address && marketplaceAddress && isHex(marketplaceAddress)) {
      void refreshMyRequests();
      void refreshBulkRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, marketplaceAddress]);

  const handleCreateRequest = () => {
    setLocalError(null);

    if (!marketplaceAddress || !isHex(marketplaceAddress)) {
      setLocalError("Marketplace contract not configured. Paste the contract address above.");
      return;
    }
    if (!requestOwner) {
      setLocalError("Enter the data owner's wallet address.");
      return;
    }

    try {
      const amount = parseUnits(offerAmount || "0", 18);
      const categoryId = CATEGORY_TO_ENUM[requestCategory];
      writeContract({
        address: marketplaceAddress as `0x${string}`,
        abi: dataMarketplaceAbi,
        functionName: "createRequest",
        args: [requestOwner as `0x${string}`, categoryId, amount],
      });
    } catch (err: any) {
      setLocalError(err.message ?? "Failed to create request.");
    }
  };

  const handleApproveRequest = (requestId?: `0x${string}`) => {
    setLocalError(null);

    if (!marketplaceAddress || !isHex(marketplaceAddress)) {
      setLocalError("Marketplace contract not configured. Paste the contract address above.");
      return;
    }
    const id = requestId ?? (requestIdInput as `0x${string}`);
    if (!id || !isHex(id)) {
      setLocalError("Enter a valid requestId (0x-prefixed bytes32).");
      return;
    }

    try {
      writeContract({
        address: marketplaceAddress as `0x${string}`,
        abi: dataMarketplaceAbi,
        functionName: "approveRequest",
        args: [id],
      });
      toast.push({ kind: "info", title: "Approval sent", message: "Confirm the transaction in your wallet." });
    } catch (err: any) {
      setLocalError(err.message ?? "Failed to approve request.");
      toast.push({ kind: "error", title: "Approval failed", message: err.message ?? "Transaction failed" });
    }
  };

  const handleWithdraw = () => {
    setLocalError(null);

    if (!marketplaceAddress || !isHex(marketplaceAddress)) {
      setLocalError("Marketplace contract not configured. Paste the contract address above.");
      return;
    }

    try {
      writeContract({
        address: marketplaceAddress as `0x${string}`,
        abi: dataMarketplaceAbi,
        functionName: "withdrawEarnings",
        args: [],
      });
      void refetchEarnings();
      toast.push({ kind: "info", title: "Withdraw sent", message: "Confirm the transaction in your wallet." });
    } catch (err: any) {
      setLocalError(err.message ?? "Failed to withdraw earnings.");
      toast.push({ kind: "error", title: "Withdraw failed", message: err.message ?? "Transaction failed" });
    }
  };

  const handleFulfillRequest = (requestId?: `0x${string}`) => {
    setLocalError(null);

    if (!marketplaceAddress || !isHex(marketplaceAddress)) {
      setLocalError("Marketplace contract not configured. Paste the contract address above.");
      return;
    }
    const id = requestId ?? (requestIdInput as `0x${string}`);
    if (!id || !isHex(id)) {
      setLocalError("Enter a valid requestId (0x-prefixed bytes32).");
      return;
    }
    if (!fulfillCid) {
      setLocalError("Select or paste an insight CID to fulfill the request.");
      return;
    }

    try {
      writeContract({
        address: marketplaceAddress as `0x${string}`,
        abi: dataMarketplaceAbi,
        functionName: "fulfillRequest",
        args: [id, fulfillCid],
      });
      toast.push({ kind: "info", title: "Fulfillment sent", message: "Confirm the transaction in your wallet." });
    } catch (err: any) {
      setLocalError(err.message ?? "Failed to fulfill request.");
      toast.push({ kind: "error", title: "Fulfillment failed", message: err.message ?? "Transaction failed" });
    }
  };

  const statusLabel = (s: number) => {
    switch (s) {
      case 0:
        return "Pending";
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      case 3:
        return "Fulfilled";
      default:
        return `Unknown(${s})`;
    }
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
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-800 animate-fade-in-up">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Store className="w-5 h-5 text-white" />
          </span>
          Data Marketplace
        </h1>
        <p className="text-slate-600 mb-8">
          Companies request access to anonymized insights. You approve and set price. Smart contracts handle payments.
        </p>

        {!isConnected ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm animate-fade-in-up">
            <p className="text-slate-600 mb-4">Connect your wallet to create permissions and see requests.</p>
            <ConnectButton />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 stagger-children">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-2">Marketplace contract</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Paste your deployed `DataMarketplace` address once. We’ll save it locally in this browser.
                </p>
                <input
                  value={marketplaceAddress}
                  onChange={(e) => setMarketplaceAddress(e.target.value.trim())}
                  placeholder="0x..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  aria-label="Marketplace contract address"
                />
                {!marketplaceAddress && (
                  <p className="text-xs text-amber-700 mt-2">
                    Not set. Deploy your contracts, then paste the marketplace address here.
                  </p>
                )}
              </div>

              <div id="bounties" className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Data Bounties (Aggregation)
                    </h3>
                    <button 
                      onClick={refreshBulkRequests}
                      className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                    >
                      Refresh
                    </button>
                  </div>
                  <p className="text-xs text-indigo-700 mb-4 font-medium italic">
                    Companies are looking for bulk datasets. Contribute your data to earn higher rewards and reputation.
                  </p>

                  <div className="space-y-4">
                    {loadingBulk ? (
                      <div className="py-4 text-center">
                        <RefreshCcw className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
                      </div>
                    ) : bulkRequests.length === 0 ? (
                      <p className="text-xs text-indigo-400 font-medium py-4 text-center italic">No active bounties at the moment.</p>
                    ) : (
                      bulkRequests.map(req => (
                        <div key={req.id} className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm hover:border-indigo-300 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                              {req.industry}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">by {req.companyName}</span>
                          </div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{req.title}</h4>
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black shrink-0">
                              {req.budget}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-3 line-clamp-2 leading-relaxed">{req.description}</p>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full transition-all duration-1000" 
                              style={{ width: `${Math.min((req.count / req.targetCount) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-3">
                            <span>{req.count} / {req.targetCount} Items</span>
                            <span>{Math.round((req.count / req.targetCount) * 100)}% Complete</span>
                          </div>
                          <button 
                            onClick={() => contributeToBounty(req.id)}
                            disabled={!fulfillCid}
                            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-black text-[11px] hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {fulfillCid ? "Contribute Selected Data" : "Select from Vault to Join"}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-4 shadow-sm hover-lift">
                <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                  <DollarSign className="w-6 h-6 text-white" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-800">Data Pricing Engine</h3>
                  <p className="text-slate-600 text-sm">
                    Health ≈ $8, Shopping ≈ $5, Fitness ≈ $4, Location ≈ $2, Social ≈ $3 (base). Reputation increases payouts.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-4 shadow-sm hover-lift">
                <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                  <CreditCard className="w-6 h-6 text-white" />
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Receive payouts your way</h3>
                  <p className="text-slate-600 text-sm">
                    Crypto (wallet), Google Pay, PayPal, Apple Pay, or bank transfer. Set your preferred method and get paid when companies buy your data.
                  </p>
                </div>
                <Link
                  href="/dashboard/payments"
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2 font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
                >
                  Payment options
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover-lift">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-slate-800">Your incoming requests</h3>
                  <button
                    type="button"
                    onClick={refreshMyRequests}
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-800"
                    disabled={loadingRequests || !marketplaceAddress || !isHex(marketplaceAddress)}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {loadingRequests ? "Refreshing…" : "Refresh"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Auto-discovered from on-chain `RequestCreated` events (recent blocks) and hydrated via `getRequest(...)`.
                </p>

                {myRequests.length === 0 ? (
                  <p className="text-sm text-slate-600">No requests found for your address yet.</p>
                ) : (
                  <div className="space-y-2">
                    {myRequests.map((r) => (
                      <div key={r.requestId} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{shortenHex(r.requestId)}</p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              From <span className="font-medium">{shortenHex(r.requester)}</span> • Status{" "}
                              <span className="font-medium">{statusLabel(r.status)}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Offered: <span className="font-medium">{formatUnits(r.offeredAmount, 18)}</span> DATA
                            </p>
                            {r.insightCid ? <p className="text-xs text-slate-500 mt-0.5 break-all">CID: {r.insightCid}</p> : null}
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setRequestIdInput(r.requestId);
                                if (r.status === 0) handleApproveRequest(r.requestId);
                              }}
                              disabled={isBusy || r.status !== 0}
                              className="rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRequestIdInput(r.requestId);
                                if (r.status === 1) handleFulfillRequest(r.requestId);
                              }}
                              disabled={isBusy || r.status !== 1 || !fulfillCid}
                              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              Fulfill
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover-lift">
                <h3 className="font-semibold text-slate-800 mb-3">Create a data request</h3>
                <p className="text-xs text-slate-500 mb-3">
                  As a company, request access to a user's anonymized insights. You’ll need to have approved DATA token allowance set for the marketplace contract.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Data owner wallet</label>
                    <input
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      placeholder="0x..."
                      value={requestOwner}
                      onChange={(e) => setRequestOwner(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Category</label>
                    <select
                      value={requestCategory}
                      onChange={(e) => setRequestCategory(e.target.value as CategoryKey)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      aria-label="Request category"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Offer amount (DATA tokens)</label>
                    <input
                      type="number"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="5"
                      aria-label="Offer amount in DATA tokens"
                    />
                  </div>
                  <button
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2.5 font-medium w-full shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleCreateRequest}
                    disabled={isBusy}
                  >
                    Create request
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover-lift">
                <h3 className="font-semibold text-slate-800 mb-3">Approve request & withdraw</h3>
                <p className="text-xs text-slate-500 mb-3">
                  As a data owner, approve a pending request (by requestId bytes32) and withdraw accumulated earnings from previous approvals.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Request ID (bytes32)</label>
                    <input
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      placeholder="0x..."
                      value={requestIdInput}
                      onChange={(e) => setRequestIdInput(e.target.value)}
                      aria-label="Request ID"
                    />
                    {requestIdInput && (
                      <p className="text-xs text-slate-500 mt-1">Short: {shortenHex(requestIdInput)}</p>
                    )}
                  </div>
                  <button
                    className="rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium w-full shadow-sm hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => handleApproveRequest()}
                    disabled={isBusy}
                  >
                    Approve request (escrow payment)
                  </button>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-slate-800">Fulfill request</p>
                      <button
                        type="button"
                        onClick={refreshVault}
                        className="text-xs font-medium text-indigo-700 hover:text-indigo-800"
                        disabled={loadingVault}
                      >
                        {loadingVault ? "Refreshing…" : "Refresh vault"}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Pick a vault CID (anonymized JSON or uploaded media) and submit it on-chain as the delivered insight.
                    </p>
                    <label className="block text-sm text-slate-600 mb-1">Insight CID</label>
                    <select
                      value={fulfillCid}
                      onChange={(e) => setFulfillCid(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      aria-label="Insight CID"
                    >
                      <option value="">Select a CID from your vault</option>
                      {vaultItems.map((v) => (
                        <option key={v.cid} value={v.cid}>
                          {v.category} • {v.data?.kind === "media" ? v.data?.mime : "insight"} • {String(v.cid).slice(0, 24)}...
                        </option>
                      ))}
                    </select>
                    <input
                      className="mt-2 w-full rounded-xl bg-white border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      placeholder="...or paste a CID (ipfs://...)"
                      value={fulfillCid}
                      onChange={(e) => setFulfillCid(e.target.value)}
                      aria-label="Paste insight CID"
                    />
                    <button
                      className="mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 font-medium w-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleFulfillRequest()}
                      disabled={isBusy || !fulfillCid || !requestIdInput}
                    >
                      Fulfill request (on-chain)
                    </button>

                    {/* AI Smart Scanner UI */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-indigo-600" /> AI Data Scanner
                      </h4>
                      <button
                        onClick={analyzeSelectedImage}
                        disabled={!fulfillCid || analysisLoading}
                        className="w-full py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl font-bold text-xs hover:bg-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {analysisLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {analysisLoading ? "Analyzing..." : "Scan Data with DataKart AI"}
                      </button>
                      
                      {aiAnalysis && (
                        <div className="mt-4 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl animate-fade-in-up">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">AI Insight</span>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold">Estimated Value: {aiAnalysis.estimatedValue}</span>
                          </div>
                          <p className="text-xs font-medium leading-relaxed italic">"Our AI detected: {aiAnalysis.tags}. This high-quality data is prioritized for aggregation."</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 mt-2">
                    <p className="text-sm text-slate-600 mb-2">
                      Current on-chain earnings: <span className="font-semibold">{earnings}</span> DATA
                    </p>
                    <button
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 font-medium w-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleWithdraw}
                      disabled={isBusy || earnings === "0"}
                    >
                      Withdraw earnings
                    </button>
                  </div>
                </div>
              </div>

              {permission && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
                  <p className="font-semibold text-slate-800 mb-1">Your active permission (for selected request category)</p>
                  <p>
                    Category: <span className="font-medium">{requestCategory}</span> • Price:{" "}
                    <span className="font-medium">
                      {(() => {
                        try {
                          return formatUnits((permission as any).pricePerAccess as bigint, 18);
                        } catch {
                          return "—";
                        }
                      })()}{" "}
                      DATA
                    </span>
                  </p>
                </div>
              )}

              {(localError || !marketplaceAddress) && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {localError ||
                    "Marketplace contract address is not set. Deploy the contracts and paste the address above."}
                </p>
              )}

              {marketplaceAddress && (
                <p className="text-xs text-slate-500 break-all">
                  Using marketplace contract at <code className="bg-slate-100 px-1.5 py-0.5 rounded">{marketplaceAddress}</code>
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
