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
    const { headers, rows, categories } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!headers || !rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: "No data to process" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clean and filter headers - remove null/empty values
    const cleanHeaders = headers.filter((h: any) => h && String(h).trim());
    
    // Limit rows to prevent token overflow
    const maxRows = 50;
    const processRows = rows.slice(0, maxRows);
    
    if (rows.length > maxRows) {
      console.log(`Warning: Processing first ${maxRows} of ${rows.length} rows. Import multiple times for large files.`);
    }

    const systemPrompt = `You are a data parsing assistant for an inventory management system. Your task is to map Excel data to inventory item fields.

The target fields are:
- name (required): Item name/description
- brand_model: Brand and model
- property_number: Property number (govt asset tag)
- serial_number: Serial number
- condition: Must be one of: "Excellent Condition", "Good Condition", "Fair Condition", "Poor Condition"
- utilization_status: Must be one of: "In Use", "Idle", "Standby", "Under Repair", "For Disposal"
- quantity: Number (default 1)
- unit_cost: Number (cost per unit)
- total_cost: Number (total cost)
- accountable_person: Person responsible
- current_location: Physical location
- date_received: Date in YYYY-MM-DD format
- remarks: Additional notes
- property_tag: Property tag/label
- property_from: Source of property
- category_name: Category name for matching

Common column name mappings:
- "NAME", "ITEM NAME", "DESCRIPTION", "ARTICLE", "DESCRIPTION/SPECIFICATION" → name
- "BRAND/MODEL", "BRAND", "MODEL", "MAKE" → brand_model
- "PROPERTY NUMBER", "PROP NO.", "PROPERTY NO", "ASSET TAG" → property_number
- "SERIAL NO.", "SERIAL NUMBER", "S/N", "SERIAL" → serial_number
- "CONDITION", "ITEM CONDITION", "COND" → condition
- "STATUS", "UTILIZATION STATUS", "USE STATUS", "UTILIZATION" → utilization_status
- "QTY", "QUANTITY", "QTY.", "UNIT" → quantity
- "UNIT COST", "COST", "PRICE", "UNIT VALUE" → unit_cost
- "TOTAL COST", "TOTAL", "AMOUNT", "TOTAL VALUE" → total_cost
- "ACCOUNTABLE PERSON", "RESPONSIBLE PERSON", "ACCOUNTABLE", "END USER" → accountable_person
- "LOCATION", "CURRENT LOCATION", "OFFICE", "DEPARTMENT" → current_location
- "DATE RECEIVED", "DATE ACQUIRED", "ACQUISITION DATE" → date_received
- "REMARKS", "NOTES", "COMMENT" → remarks
- "CATEGORY", "TYPE", "CLASSIFICATION" → category_name

Available categories for matching: ${categories?.map((c: any) => c.name).join(', ') || 'None'}

Return a JSON array of parsed items. For each row, map the values to the correct fields. 
- Normalize condition values to exact matches
- Normalize utilization status to exact matches  
- Convert quantity and costs to numbers
- Format dates as YYYY-MM-DD
- Skip completely empty rows
- If a required field (name) is missing, include _error: "Missing required field: name"`;

    const userPrompt = `Parse these Excel rows into inventory items.

Headers: ${JSON.stringify(cleanHeaders)}

Data rows:
${JSON.stringify(processRows)}

Return ONLY a valid JSON array of objects with the mapped fields. No explanation, just the JSON array.`;

    console.log(`Sending request to OpenAI for parsing ${processRows.length} rows...`);
    
    const response = await fetch('https://ai-gateway.lovable.dev/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in OpenAI response:", JSON.stringify(aiResponse));
      throw new Error("No response from AI");
    }

    console.log("AI response received, parsing JSON...");

    // Extract JSON from the response (handle markdown code blocks)
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
