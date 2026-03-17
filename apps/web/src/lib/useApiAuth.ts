"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { getApiToken, getNonceMessage, setApiToken, verifySignature } from "@/lib/apiAuth";

export function useApiAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [token, setToken] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setToken(null);
      return;
    }
    setToken(getApiToken(address));
  }, [address]);

  const ensureAuth = async () => {
    if (!address || !isConnected) return null;
    const existing = getApiToken(address);
    if (existing) {
      setToken(existing);
      return existing;
    }
    setAuthenticating(true);
    setAuthError(null);
    try {
      const { message } = await getNonceMessage(address);
      const signature = await signMessageAsync({ message });
      const verified = await verifySignature(address, signature, message);
      setApiToken(address, verified.token);
      setToken(verified.token);
      return verified.token;
    } catch (e: any) {
      setAuthError(e.message ?? "Auth failed");
      setToken(null);
      return null;
    } finally {
      setAuthenticating(false);
    }
  };

  return { address, token, ensureAuth, authenticating, authError };
}

