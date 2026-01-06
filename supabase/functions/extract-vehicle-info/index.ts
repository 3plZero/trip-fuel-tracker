import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an OCR assistant that extracts information from Philippine LTO Certificate of Registration images. Extract the following fields if visible:
- plate_no: The plate number
- engine_no: The engine number
- chassis_no: The chassis number
- file_no: The file number
- vehicle_type: The vehicle type
- vehicle_category: The vehicle category
- make_brand: The make/brand
- body_type: The body type
- series: The series
- gross_weight: Gross weight (number only)
- net_weight: Net weight (number only)
- year_model: Year model
- year_rebuilt: Year rebuilt (if applicable)
- piston_displacement: Piston displacement
- max_power: Max power (KW)
- passenger_capacity: Passenger capacity (number only)
- color: The color
- fuel_type: Type of fuel
- registration_classification: Registration classification
- owner_name: Owner's name
- owner_address: Owner's address
- encumbered_to: Encumbered to (if applicable)
- or_no: O.R. Number
- or_date: O.R. Date in YYYY-MM-DD format
- cr_no: C.R. Number
- remarks: Remarks (if any)
- description: A brief description combining make/brand, series, and year model (e.g., "Toyota Innova 2020")

Return ONLY a valid JSON object with these fields. Use null for any field you cannot extract. Do not include any explanation or markdown.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the vehicle registration information from this Certificate of Registration image:"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to process image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Try to parse the JSON response
    let extractedData;
    try {
      // Clean up potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extractedData = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse AI response:", content);
      extractedData = {};
    }

    return new Response(
      JSON.stringify({ data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
