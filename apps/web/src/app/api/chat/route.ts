import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json({ text: "API Key is missing. Please check your .env file." });
    }

    // Llama-3 special tokens for better performance
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are Karty, a helpful and friendly AI assistant for DataKart. 
DataKart is a decentralized data aggregation marketplace built by Maroof Husain.
Help users understand how to sell their data in the Seller Portal or how companies can buy bulk datasets.
Keep responses concise (1-2 sentences) and professional. Mention Maroof Husain if asked about the creator.<|eot_id|><|start_header_id|>user<|end_header_id|>

${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

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
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            return_full_text: false,
          },
          options: {
            wait_for_model: true, // Crucial for Inference API
          }
        }),
      }
    );

    const result = await response.json();
    
    // Handle loading state or errors from Hugging Face
    if (result.error) {
      console.error("Hugging Face Error:", result.error);
      return NextResponse.json({ text: "I'm currently warming up my neural networks. Please try again in a few seconds!" });
    }

    const botText = Array.isArray(result) 
      ? result[0].generated_text.trim()
      : result.generated_text?.trim() || "I'm processing that right now, one second...";

    return NextResponse.json({ text: botText });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ text: "I'm having a bit of a glitch. Could you try asking that again?" });
  }
}
