import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl, category } = await req.json();

    // In a real app, we'd use the provided imageUrl or fetch it from IPFS.
    // For this demo, we use a high-quality stock image if none provided.
    const imageToAnalyze = imageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80";

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
        method: "POST",
        body: imageToAnalyze,
      }
    );

    const result = await response.json();
    const caption = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text || "unidentified data";

    // Enhanced Price Estimator with reasoning
    const priceResponse = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `<s>[INST] As a Data Valuation Expert, analyze this data point: "${caption}". 
          Category: ${category || "General"}.
          Estimate its value in a decentralized marketplace.
          Return ONLY the price (e.g. 12.50 USD). [/INST]`,
        }),
      }
    );

    const priceResult = await priceResponse.json();
    const estimatedValue = Array.isArray(priceResult) 
      ? priceResult[0].generated_text.split("[/INST]").pop().trim()
      : priceResult.generated_text?.split("[/INST]").pop().trim() || "1.00 USD";

    return NextResponse.json({ 
      tags: caption,
      estimatedValue: estimatedValue
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
