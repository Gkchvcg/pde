import { ethers } from "ethers";

const ABI = [
  "function getRequest(bytes32 requestId) view returns (tuple(address requester,address dataOwner,uint8 category,uint256 offeredAmount,uint8 status,uint256 createdAt,string insightCid))",
];

export function getProvider() {
  const url =
    process.env.CHAIN_RPC ||
    process.env.POLYGON_AMOY_RPC ||
    process.env.LOCALHOST_RPC ||
    "http://127.0.0.1:8545";
  return new ethers.JsonRpcProvider(url);
}

export function getMarketplaceContract() {
  const address = process.env.MARKETPLACE_ADDRESS;
  if (!address) return null;
  const provider = getProvider();
  return new ethers.Contract(address, ABI, provider);
}

export async function canViewCid({ requesterAddress, requestId, cid }) {
  const contract = getMarketplaceContract();
  if (!contract) return { ok: false, reason: "MARKETPLACE_ADDRESS not configured" };
  if (!requestId) return { ok: false, reason: "requestId required" };
  const req = await contract.getRequest(requestId);
  const status = Number(req.status);
  if (status !== 3) return { ok: false, reason: "Request not fulfilled" };
  if (String(req.insightCid) !== String(cid)) return { ok: false, reason: "CID mismatch" };
  if (String(req.requester).toLowerCase() !== String(requesterAddress).toLowerCase()) return { ok: false, reason: "Not requester" };
  return { ok: true };
}

