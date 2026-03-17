"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { parseUnits, formatUnits, isHex } from "viem";
import { DATA_MARKETPLACE_ADDRESS, dataMarketplaceAbi } from "@/lib/contracts";

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

const DEFAULT_DURATION_SECONDS = BigInt(60 * 60 * 24 * 30);

export default function PermissionsPage() {
  const { address, isConnected } = useAccount();
  const [marketplaceAddress, setMarketplaceAddress] = useState<string>(DATA_MARKETPLACE_ADDRESS);
  const [category, setCategory] = useState<CategoryKey>("FITNESS");
  const [price, setPrice] = useState("5");
  const [allowFitness, setAllowFitness] = useState(true);
  const [allowHealthcare, setAllowHealthcare] = useState(false);
  const [allowMarketing, setAllowMarketing] = useState(true);
  const [allowInsurance, setAllowInsurance] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: txHash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

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

  const { data: existingPermission } = useReadContract({
    address: marketplaceAddress as `0x${string}`,
    abi: dataMarketplaceAbi,
    functionName: "getPermission",
    args: address ? [address, CATEGORY_TO_ENUM[category]] : undefined,
    query: {
      enabled: Boolean(address && marketplaceAddress && isHex(marketplaceAddress)),
    },
  });

  const existingPrice = useMemo(() => {
    if (!existingPermission || !(existingPermission as any).pricePerAccess) return null;
    try {
      return formatUnits((existingPermission as any).pricePerAccess as bigint, 18);
    } catch {
      return null;
    }
  }, [existingPermission]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Connect wallet first.</p>
      </div>
    );
  }

  const handleCreatePermission = async () => {
    setLocalError(null);

    if (!address) {
      setLocalError("Wallet address not found.");
      return;
    }

    if (!marketplaceAddress || !isHex(marketplaceAddress)) {
      setLocalError("Marketplace contract address is not configured. Paste it below.");
      return;
    }

    try {
      const categoryId = CATEGORY_TO_ENUM[category];
      const priceInWei = parseUnits(price || "0", 18);

      writeContract({
        address: marketplaceAddress as `0x${string}`,
        abi: dataMarketplaceAbi,
        functionName: "createPermission",
        args: [categoryId, priceInWei, allowFitness, allowHealthcare, allowMarketing, allowInsurance, DEFAULT_DURATION_SECONDS],
      });
    } catch (err: any) {
      setLocalError(err.message ?? "Failed to send transaction.");
    }
  };

  const isSubmitting = isPending || isConfirming;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-800 animate-fade-in-up">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-white" />
          </span>
          Auto Data Licensing
        </h1>
        <p className="text-slate-600 mb-8">
          Set rules per category. Smart contracts enforce who can access your data and at what price.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 max-w-xl shadow-sm hover-lift">
          <div className="space-y-4">
            <div>
              <label htmlFor="marketplaceAddress" className="block text-sm text-slate-600 mb-1">
                Marketplace contract
              </label>
              <input
                id="marketplaceAddress"
                value={marketplaceAddress}
                onChange={(e) => setMarketplaceAddress(e.target.value.trim())}
                placeholder="0x..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                aria-label="Marketplace contract address"
                title="Marketplace contract address"
              />
              <p className="text-xs text-slate-500 mt-1">
                Tip: deploy locally and paste the printed `NEXT_PUBLIC_MARKETPLACE_ADDRESS`. Saved locally in this browser.
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Data category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryKey)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                aria-label="Data category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pricePerAccess" className="block text-sm text-slate-600 mb-1">
                Price per access (DATA tokens)
              </label>
              <input
                id="pricePerAccess"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                aria-label="Price per access"
                placeholder="5"
              />
              {existingPrice && (
                <p className="text-xs text-slate-500 mt-1">
                  Current on-chain price for this category: <span className="font-medium">{existingPrice} DATA</span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Allow requests from</label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowFitness}
                  onChange={(e) => setAllowFitness(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Fitness companies
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowHealthcare}
                  onChange={(e) => setAllowHealthcare(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Healthcare / Pharma
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowMarketing}
                  onChange={(e) => setAllowMarketing(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Marketing / Brands
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowInsurance}
                  onChange={(e) => setAllowInsurance(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Insurance companies
              </label>
            </div>
            <button
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2.5 font-medium w-full shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleCreatePermission}
              disabled={isSubmitting}
            >
              {isPending && "Confirm in your wallet..."}
              {isConfirming && !isPending && "Waiting for confirmation..."}
              {!isSubmitting && !isConfirmed && "Create permission (on-chain)"}
              {isConfirmed && "Permission created"}
            </button>

            {(localError || !marketplaceAddress) && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {localError ||
                  "Marketplace contract address is not set. Deploy the contracts and paste the address above."}
              </p>
            )}

            {!localError && marketplaceAddress && (
              <p className="text-xs text-slate-500 break-all">
                Using marketplace contract at <code className="bg-slate-100 px-1.5 py-0.5 rounded">{marketplaceAddress}</code>
              </p>
            )}
          </div>
        </div>

        <p className="text-slate-500 text-sm mt-4">
          Deploy contracts with <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">npm run contracts:compile</code> and run deploy script, then add contract
          addresses to .env to enable on-chain actions.
        </p>
      </main>
    </div>
  );
}
