import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, categories } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!pdfBase64) {
      return new Response(JSON.stringify({ error: "No PDF data provided" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Processing PDF for inventory parsing...");

    const systemPrompt = `You are a data extraction assistant for an inventory management system. Extract inventory items from the provided PDF document.

Target fields for each item:
- name (required): Item name/description
- brand_model: Brand and model
- property_number: Property number
- serial_number: Serial number
- condition: One of: "Excellent Condition", "Good Condition", "Fair Condition", "Poor Condition"
- utilization_status: One of: "In Use", "Idle", "Standby", "Under Repair", "For Disposal"
- quantity: Number (default 1)
- unit_cost: Number
- total_cost: Number
- accountable_person: Person responsible
- current_location: Physical location
- date_received: YYYY-MM-DD format
- remarks: Notes
- category_name: Category for matching

Available categories: ${categories?.map((c: any) => c.name).join(', ') || 'None'}

Return a JSON array of items. If you cannot extract the name for an item, add _error: "Missing name".
Extract as many items as you can find in the document.`;

    const userPrompt = `Extract all inventory items from this PDF document. Return ONLY a valid JSON array of items.`;

    console.log("Sending PDF to AI for extraction...");
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:application/pdf;base64,${pdfBase64}` 
                } 
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in AI response:", JSON.stringify(aiResponse));
      throw new Error("No response from AI");
    }

    console.log("AI response received, parsing JSON...");

    // Extract JSON from the response
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let parsedItems;
    try {
      parsedItems = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Failed to parse AI response");
    }

    // Map category names to IDs
    if (categories && Array.isArray(parsedItems)) {
      parsedItems = parsedItems.map((item: any) => {
        if (item.category_name) {
          const matchedCategory = categories.find(
            (c: any) => c.name.toLowerCase() === item.category_name.toLowerCase()
          );
          if (matchedCategory) {
            item.category_id = matchedCategory.id;
          }
          delete item.category_name;
        }
        return item;
      });
    }

    console.log(`Successfully parsed ${parsedItems.length} items from PDF`);

    return new Response(JSON.stringify({ items: parsedItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in parse-inventory-pdf:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
