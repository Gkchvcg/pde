import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error("AI Error: HUGGINGFACE_API_KEY is not defined in environment variables.");
      return NextResponse.json({ text: "API Key is missing on the server. Please add HUGGINGFACE_API_KEY to your Vercel environment variables." });
    }

    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are Karty, the helpful AI assistant for DataKart. 
Help users understand how to sell data or how companies can buy it.
Keep it short and friendly.<|eot_id|><|start_header_id|>user<|end_header_id|>

${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    console.log("Sending request to Hugging Face...");
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 150, temperature: 0.7, return_full_text: false },
          options: { wait_for_model: true }
        }),
      }
    );

    const result = await response.json();
    console.log("Hugging Face Response Status:", response.status);

    if (!response.ok || result.error) {
      console.error("Hugging Face API Error:", result.error || result);
      return NextResponse.json({ text: "I'm still waking up (the model is loading on Hugging Face). Please try again in 30 seconds!" });
    }

    const botText = Array.isArray(result) 
      ? result[0].generated_text.trim()
      : result.generated_text?.trim() || "I'm thinking... could you repeat that?";

    return NextResponse.json({ text: botText });
  } catch (error) {
    console.error("Chat API Critical Error:", error);
    return NextResponse.json({ text: "Connection error. Make sure your Hugging Face API key is correct and has access to Llama-3." });
  }
}
