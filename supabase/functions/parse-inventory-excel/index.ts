import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry helper with exponential backoff
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 5
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        if (attempt === maxRetries) {
          return response;
        }
        // Longer delays: 15s, 30s, 60s, 60s, 60s
        const waitTime = Math.min(15000 * Math.pow(2, attempt), 60000);
        console.log(`Rate limited, waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Fetch attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 5000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers, rows, categories } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    if (!headers || !rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: "No data to process" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clean and filter headers - remove null/empty values
    const cleanHeaders = headers.filter((h: any) => h && String(h).trim());
    
    // Limit rows to prevent token overflow - smaller batch for free tier
    const maxRows = 20;
    const processRows = rows.slice(0, maxRows);
    
    if (rows.length > maxRows) {
      console.log(`Warning: Processing first ${maxRows} of ${rows.length} rows. Import multiple times for large files.`);
    }

    const systemPrompt = `You are a data parsing assistant for an inventory management system. Map Excel data to inventory item fields.

Target fields:
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

Return a JSON array. Skip empty rows. If name is missing, add _error: "Missing name".`;

    const userPrompt = `Parse these Excel rows:

Headers: ${JSON.stringify(cleanHeaders)}

Rows:
${JSON.stringify(processRows)}

Return ONLY a valid JSON array.`;

    console.log(`Sending request to Gemini for parsing ${processRows.length} rows...`);
    
    // Use gemini-1.5-flash which has better rate limits than 2.0
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt + "\n\n" + userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          }
        }),
      },
      5
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait 1-2 minutes and try again." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error("No content in Gemini response:", JSON.stringify(aiResponse));
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

    console.log(`Successfully parsed ${parsedItems.length} items`);

    return new Response(JSON.stringify({ items: parsedItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in parse-inventory-excel:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
