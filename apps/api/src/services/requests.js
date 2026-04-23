import { v4 as uuidv4 } from "uuid";

// In-memory store for requests/bounties in this mock implementation.
const requests = new Map();
const contributions = new Map(); // requestId -> Set of CIDs

export const createRequest = (companyAddress, { category, targetCount, budget, title, description, companyName, industry }) => {
  const id = uuidv4();
  const request = {
    id,
    companyAddress,
    companyName: companyName || "Anonymous Corp",
    industry: industry || "Technology",
    category,
    targetCount: parseInt(targetCount) || 1000,
    budget: budget || "1000 POL",
    title: title || `Request for ${category} data`,
    description: description || `Aggregating ${targetCount} items for ${category} analysis.`,
    status: "open",
    count: 0,
    createdAt: new Date().toISOString(),
  };
  requests.set(id, request);
  contributions.set(id, new Set());
  return request;
};

export const listRequests = () => {
  return Array.from(requests.values());
};

export const getRequest = (id) => {
  return requests.get(id);
};

export const addContribution = (requestId, cid) => {
  const request = requests.get(requestId);
  if (!request) throw new Error("Request not found");
  
  const set = contributions.get(requestId);
  if (set.has(cid)) return; // Already contributed
  
  set.add(cid);
  request.count = set.size;
  
  if (request.count >= request.targetCount) {
    request.status = "fulfilled";
  }
  
  return request;
};
