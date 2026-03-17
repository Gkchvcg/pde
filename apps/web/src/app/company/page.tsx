"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatUnits, isHex, parseAbiItem, parseUnits } from "viem";
import { ArrowLeft, Building2, ShoppingCart, Shield, RefreshCcw, Eye } from "lucide-react";
import { dataMarketplaceAbi } from "@/lib/contracts";
import { ERC20_ABI } from "@/lib/erc20";

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

function statusLabel(s: number) {
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
}

export default function CompanyPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [marketplaceAddress, setMarketplaceAddress] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("");

  const [loadingMarket, setLoadingMarket] = useState(false);
  const [permissions, setPermissions] = useState<
    {
      user: `0x${string}`;
      category: number;
      pricePerAccess: bigint;
      expiresAt: bigint;
      active: boolean;
      allowFitnessCompanies: boolean;
      allowHealthcareCompanies: boolean;
      allowMarketingCompanies: boolean;
      allowInsuranceCompanies: boolean;
      blockNumber: bigint;
    }[]
  >([]);

  const [offerAmount, setOfferAmount] = useState("5");
  const [selectedPermissionKey, setSelectedPermissionKey] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

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
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [viewer, setViewer] = useState<{ cid: string; kind: "insight" | "media"; mime?: string; content?: any } | null>(
    null
  );
  const [loadingViewer, setLoadingViewer] = useState(false);

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

  const allowance = useMemo(() => {
    if (!allowanceRaw) return BigInt(0);
    return allowanceRaw as bigint;
  }, [allowanceRaw]);

  const { data: txHash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });
  const busy = isPending || isConfirming;

  const refreshMarketplace = async () => {
    if (!publicClient) return;
    if (!marketplaceAddress || !isHex(marketplaceAddress)) return;
    setLoadingMarket(true);
    try {
      const latest = await publicClient.getBlockNumber();
      const lookback = BigInt(40000);
      const fromBlock = latest > lookback ? latest - lookback : BigInt(0);

      const permissionCreated = parseAbiItem(
        "event PermissionCreated(bytes32 indexed permissionId, address indexed user, uint8 category, uint256 price)"
      );

      const logs = await publicClient.getLogs({
        address: marketplaceAddress as `0x${string}`,
        event: permissionCreated,
        fromBlock,
        toBlock: latest,
      });

      // Unique by (user,category) because permissions are one-time in this contract.
      const seen = new Map<string, { user: `0x${string}`; category: number; blockNumber: bigint }>();
      for (const l of logs) {
        const user = l.args.user as `0x${string}`;
        const category = Number(l.args.category);
        const key = `${user.toLowerCase()}:${category}`;
        seen.set(key, { user, category, blockNumber: l.blockNumber ?? BigInt(0) });
      }

      const entries = Array.from(seen.values());
      const hydrated = await Promise.all(
        entries.map(async (e) => {
          const perm = (await publicClient.readContract({
            address: marketplaceAddress as `0x${string}`,
            abi: dataMarketplaceAbi,
            functionName: "getPermission",
            args: [e.user, e.category],
          })) as any;
          return {
            user: perm.user as `0x${string}`,
            category: Number(perm.category),
            pricePerAccess: perm.pricePerAccess as bigint,
            expiresAt: perm.expiresAt as bigint,
            active: Boolean(perm.active),
            allowFitnessCompanies: Boolean(perm.allowFitnessCompanies),
            allowHealthcareCompanies: Boolean(perm.allowHealthcareCompanies),
            allowMarketingCompanies: Boolean(perm.allowMarketingCompanies),
            allowInsuranceCompanies: Boolean(perm.allowInsuranceCompanies),
            blockNumber: e.blockNumber,
          };
        })
      );

      const now = BigInt(Math.floor(Date.now() / 1000));
      setPermissions(
        hydrated
          .filter((p) => p.active && p.expiresAt > now)
          .sort((a, b) => Number(b.blockNumber - a.blockNumber))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMarket(false);
    }
  };

  const refreshMyRequests = async () => {
    if (!publicClient) return;
    if (!address) return;
    if (!marketplaceAddress || !isHex(marketplaceAddress)) return;
    setLoadingRequests(true);
    try {
      const latest = await publicClient.getBlockNumber();
      const lookback = BigInt(40000);
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
        .filter((l) => l.requester.toLowerCase() === address.toLowerCase());

      const uniq = new Map<string, (typeof mine)[number]>();
      for (const r of mine) uniq.set(r.requestId, r);
      const unique = Array.from(uniq.values()).sort((a, b) => Number(b.blockNumber - a.blockNumber));

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
            requester: req.requester as `0x${string}`,
            dataOwner: req.dataOwner as `0x${string}`,
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

  useEffect(() => {
    if (!isConnected) return;
    if (!marketplaceAddress || !isHex(marketplaceAddress)) return;
    void refreshMarketplace();
    void refreshMyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, marketplaceAddress]);

  const neededAmount = useMemo(() => {
    try {
      return parseUnits(offerAmount || "0", 18);
    } catch {
      return BigInt(0);
    }
  }, [offerAmount]);

  const ensureAllowance = () => {
    setLocalError(null);
    if (!isHex(tokenAddress)) {
      setLocalError("Set DATA token address first.");
      return;
    }
    if (!isHex(marketplaceAddress)) {
      setLocalError("Set marketplace contract address first.");
      return;
    }
    // Approve max to avoid repeated approvals in demos
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [marketplaceAddress as `0x${string}`, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
    });
    void refetchAllowance();
  };

  const createRequest = () => {
    setLocalError(null);
    if (!selectedPermission) {
      setLocalError("Select a listing to request.");
      return;
    }
    if (!isHex(marketplaceAddress)) {
      setLocalError("Set marketplace contract address first.");
      return;
    }
    if (neededAmount < selectedPermission.pricePerAccess) {
      setLocalError("Offer must be >= the listing price.");
      return;
    }
    writeContract({
      address: marketplaceAddress as `0x${string}`,
      abi: dataMarketplaceAbi,
      functionName: "createRequest",
      args: [selectedPermission.user, selectedPermission.category, neededAmount],
    });
    void refreshMyRequests();
  };

  const openInsight = async (cid: string) => {
    setViewer(null);
    setLoadingViewer(true);
    try {
      // Try insights endpoint first (structured anonymized data).
      const res = await fetch(`${API}/api/insights/${encodeURIComponent(cid)}`);
      if (res.ok) {
        const data = await res.json();
        setViewer({ cid, kind: "insight", content: data });
        return;
      }
    } catch {}

    try {
      // Fallback to media.
      const res2 = await fetch(`${API}/api/data/media/${encodeURIComponent(cid)}`);
      const data2 = await res2.json();
      if (data2?.base64 && data2?.mime) {
        setViewer({ cid, kind: "media", mime: data2.mime, content: data2.base64 });
        return;
      }
    } catch {}

    setViewer({ cid, kind: "insight", content: { error: "Unable to load this CID from API." } });
    setLoadingViewer(false);
  };

  useEffect(() => {
    if (!loadingViewer) return;
    const t = setTimeout(() => setLoadingViewer(false), 500);
    return () => clearTimeout(t);
  }, [loadingViewer]);

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
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Building2 className="w-5 h-5 text-white" />
          </span>
          Company Portal
        </h1>
        <p className="text-slate-600 mb-8">
          Login with wallet, browse listings, request access, and view fulfilled insights inside the platform (no downloads).
        </p>

        {!isConnected ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm animate-fade-in-up">
            <p className="text-slate-600 mb-4">Connect your company wallet to continue.</p>
            <ConnectButton />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 stagger-children">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-2">Contracts</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="companyMarketplace" className="block text-sm text-slate-600 mb-1">
                      Marketplace address
                    </label>
                    <input
                      id="companyMarketplace"
                      value={marketplaceAddress}
                      onChange={(e) => setMarketplaceAddress(e.target.value.trim())}
                      placeholder="0x..."
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                      aria-label="Marketplace address"
                    />
                  </div>
                  <div>
                    <label htmlFor="companyToken" className="block text-sm text-slate-600 mb-1">
                      DATA token address
                    </label>
                    <input
                      id="companyToken"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value.trim())}
                      placeholder="0x..."
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                      aria-label="DATA token address"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={ensureAllowance}
                      disabled={busy || !isHex(tokenAddress) || !isHex(marketplaceAddress)}
                      className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Approve DATA spending
                    </button>
                    <p className="text-xs text-slate-500">
                      Allowance: <span className="font-medium">{formatUnits(allowance, 18)}</span> DATA
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover-lift">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-slate-800">Marketplace listings</h3>
                  <button
                    type="button"
                    onClick={refreshMarketplace}
                    className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800"
                    disabled={loadingMarket || !isHex(marketplaceAddress)}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {loadingMarket ? "Refreshing…" : "Refresh"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3">Built from on-chain `PermissionCreated` events + `getPermission`.</p>

                <div className="space-y-2">
                  {permissions.length === 0 ? (
                    <p className="text-sm text-slate-600">No active listings found yet.</p>
                  ) : (
                    permissions.map((p) => {
                      const key = `${p.user.toLowerCase()}:${p.category}`;
                      const selected = key === selectedPermissionKey;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedPermissionKey(key)}
                          className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                            selected ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-slate-50 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{shortenHex(p.user)}</p>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Category: <span className="font-medium">{CATEGORY_LABEL[p.category] ?? p.category}</span>
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Price: <span className="font-medium">{formatUnits(p.pricePerAccess, 18)}</span> DATA
                              </p>
                            </div>
                            <span className="text-xs text-slate-500">Active</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Request access
                  </h4>
                  <label htmlFor="offerAmount" className="block text-sm text-slate-600 mb-1">
                    Offer amount (DATA)
                  </label>
                  <input
                    id="offerAmount"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="5"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                    aria-label="Offer amount"
                  />
                  <button
                    type="button"
                    onClick={createRequest}
                    disabled={busy || !selectedPermission || allowance === BigInt(0)}
                    className="mt-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2.5 font-medium w-full shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Create request (on-chain)
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    Note: the smart contract enforces pricing and expiry. It doesn’t grant “download”; fulfilled insights are viewed in-app.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover-lift">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-slate-800">Your purchases</h3>
                  <button
                    type="button"
                    onClick={refreshMyRequests}
                    className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800"
                    disabled={loadingRequests || !isHex(marketplaceAddress)}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {loadingRequests ? "Refreshing…" : "Refresh"}
                  </button>
                </div>

                {myRequests.length === 0 ? (
                  <p className="text-sm text-slate-600">No requests created by this wallet yet.</p>
                ) : (
                  <div className="space-y-2">
                    {myRequests.map((r) => (
                      <div key={r.requestId} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{shortenHex(r.requestId)}</p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Owner <span className="font-medium">{shortenHex(r.dataOwner)}</span> • {CATEGORY_LABEL[r.category] ?? r.category}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Offered <span className="font-medium">{formatUnits(r.offeredAmount, 18)}</span> DATA • Status{" "}
                              <span className="font-medium">{statusLabel(r.status)}</span>
                            </p>
                          </div>
                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() => r.insightCid && openInsight(r.insightCid)}
                              disabled={!r.insightCid}
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </div>
                        </div>
                        {r.insightCid ? <p className="text-xs text-slate-500 mt-2 break-all">CID: {r.insightCid}</p> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover-lift">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-700" /> Insight Viewer (in-platform)
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  We intentionally don’t provide a download link. This is a UI view of the fulfilled output (hackathon-grade security).
                </p>

                {loadingViewer ? (
                  <p className="text-sm text-slate-600">Loading insight…</p>
                ) : !viewer ? (
                  <p className="text-sm text-slate-600">Select a fulfilled request and click “View”.</p>
                ) : viewer.kind === "media" && viewer.mime && viewer.content ? (
                  viewer.mime.startsWith("image/") ? (
                    <img
                      src={`data:${viewer.mime};base64,${viewer.content}`}
                      alt="Insight media"
                      className="w-full max-h-96 object-contain rounded-xl border border-slate-100 bg-slate-50"
                      draggable={false}
                    />
                  ) : (
                    <video
                      src={`data:${viewer.mime};base64,${viewer.content}`}
                      controls
                      className="w-full max-h-96 rounded-xl border border-slate-100 bg-slate-50"
                      controlsList="nodownload"
                    />
                  )
                ) : (
                  <pre className="whitespace-pre-wrap text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto max-h-96">
                    {JSON.stringify(viewer.content, null, 2)}
                  </pre>
                )}
              </div>

              {localError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{localError}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

