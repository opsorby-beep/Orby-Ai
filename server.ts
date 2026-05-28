import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body limit to handle high-resolution image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared lazy-loaded Gemini client
let geminiClient: any = null;

function getGeminiClient() {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key !== "") {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return geminiClient;
}

// Simple health API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Primary Endpoint: Orby Intelligence Engine Analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { image, description, userTradePreference } = req.body;
    
    // Check if Gemini is configured
    const ai = getGeminiClient();
    
    if (ai) {
      // Setup payload for Gemini
      const promptText = `
        You are the core intelligence engine of Orby, an autonomous AI business companion for home service contractors.
        Your job is to analyze incoming visual images or unstructured text descriptions of a job site and output a precise, highly structured pricing estimate and structural scope audit.
        
        ${description ? `Contractor-provided unstructured text description: "${description}"` : ""}
        ${userTradePreference ? `Contractor-selected trade preference: "${userTradePreference}"` : "Auto-detect the trade from the description and visual details."}
        
        Strictly classify the job into one of these 5 Trades:
        - "Carpet Cleaning"
        - "House Cleaning"
        - "Roofing"
        - "Auto Detailing"
        - "Lawn & Landscaping"
        
        Match the contractor's trade-specific pricing baseline templates logic:
        - Carpet Cleaning: Standard room starts at ~$50, minimum trip charge $120-$150. Heavy traffic-staining, pet-treatment, or deep soil requires deodorizers/sanitizers (upsells of $40-$80).
        - House Cleaning: Standard deep-cleans vary by size (e.g. $150-$400). Upsells include inside appliances ($30-$50 each), interior windows ($40-$100), or baseboard handwashing.
        - Roofing: Minor repairs (~$200-$600), major reroofs (~$5,000-$15,000). Upsells include moss treatment ($150-$350), gutter guards ($200-$800), or chimney flashing.
        - Auto Detailing: Interior/exterior package ($120-$350). Upsells include headlight restoration ($50-$100), engine bay clean ($60-$120), or clay bar/ceramic coating.
        - Lawn & Landscaping: Mow & edge ($50-$120). Upsells include aeration/overseeding ($150-$300), mulch install ($100-$300/yard), or tree trimming ($100-$500).
        
        Explicitly detect potential upsell opportunities based on visual context elements (discoloration, moss accumulation, heavy wear, pet damage, overgrown areas, appliance grease, faded trim) and describe them under 'upsellRecommendations'.
        
        Make sure the estimated costs are reasonable integers, confidenceScore is between 0.0 and 1.0, and technicalScopeMetrics are practical.
      `;

      let contents: any[] = [];
      
      // If image is supplied, transform it into parts
      if (image && image.includes("base64,")) {
        const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";
        const base64Data = image.split("base64,")[1];
        contents.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
      
      contents.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: contents },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tradeDetected: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Carpet Cleaning', 'House Cleaning', 'Roofing', 'Auto Detailing', 'Lawn & Landscaping'"
              },
              estimatedRangeMin: {
                type: Type.NUMBER,
                description: "Lower bound of estimate based on size and condition indicators (integer dollars)."
              },
              estimatedRangeMax: {
                type: Type.NUMBER,
                description: "Upper bound of estimate based on size and condition indicators (integer dollars)."
              },
              confidenceScore: {
                type: Type.NUMBER,
                description: "A Decimal probability representing confidence from 0.0 to 1.0."
              },
              visualAnalysisSummary: {
                type: Type.STRING,
                description: "A concise, detailed summary of observations from the site. Address visual indicators (stains, wear, age, dimensions)."
              },
              upsellRecommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING, description: "Name of the upsell package or treatment step." },
                    estimatedCost: { type: Type.NUMBER, description: "Target price for this upsell helper (integer)." },
                    justification: { type: Type.STRING, description: "Direct situational link back to the photo observation or text cue." }
                  },
                  required: ["item", "estimatedCost", "justification"]
                }
              },
              technicalScopeMetrics: {
                type: Type.OBJECT,
                properties: {
                  sizeEstimate: { type: Type.STRING, description: "Numerical size plus unit of measurement (e.g. 500 sq ft, 2.5 car driveway, 4 rooms, 23 squares)." },
                  severityCondition: { type: Type.STRING, description: "Visual damage/dirty index score (e.g. Severe Pet Stains, Heavily Overgrown, Normal Moss Accumulation)." },
                  difficultyFactor: { type: Type.STRING, description: "Complexity assessment (e.g. Tight corridor maneuvers, steep 10/12 pitch, high attic access, standard layout)." }
                },
                required: ["sizeEstimate", "severityCondition", "difficultyFactor"]
              }
            },
            required: [
              "tradeDetected",
              "estimatedRangeMin",
              "estimatedRangeMax",
              "confidenceScore",
              "visualAnalysisSummary",
              "upsellRecommendations",
              "technicalScopeMetrics"
            ]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json(parsed);
      } else {
        throw new Error("Empty response from Gemini API");
      }
      
    } else {
      // HEURISTIC DEMO MOCK PREVIEW
      // This allows the app to fully function and return super realistic results
      // matching any trade selection or keywords typed when the user hasn't set their API key!
      console.log("Gemini API key not found. Triggering heuristic demo preview mode.");
      const cleaned = (description || "").toLowerCase();
      let trade: any = userTradePreference || "Carpet Cleaning";

      if (!userTradePreference) {
        if (cleaned.includes("carpet") || cleaned.includes("stain") || cleaned.includes("rug") || cleaned.includes("spill")) {
          trade = "Carpet Cleaning";
        } else if (cleaned.includes("roof") || cleaned.includes("shingle") || cleaned.includes("leak") || cleaned.includes("chimney")) {
          trade = "Roofing";
        } else if (cleaned.includes("lawn") || cleaned.includes("grass") || cleaned.includes("trim") || cleaned.includes("tree") || cleaned.includes("mulch") || cleaned.includes("landscap")) {
          trade = "Lawn & Landscaping";
        } else if (cleaned.includes("car") || cleaned.includes("auto") || cleaned.includes("detail") || cleaned.includes("paint") || cleaned.includes("seat") || cleaned.includes("wax")) {
          trade = "Auto Detailing";
        } else if (cleaned.includes("house") || cleaned.includes("kitchen") || cleaned.includes("appliances") || cleaned.includes("deep clean") || cleaned.includes("dusting") || cleaned.includes("apartment")) {
          trade = "House Cleaning";
        }
      }

      // Generate context-aware values based on mock heuristics
      let estimatedRangeMin = 150;
      let estimatedRangeMax = 220;
      let visualAnalysisSummary = "";
      let upsellRecommendations = [];
      let technicalScopeMetrics = {
        sizeEstimate: "Standard size",
        severityCondition: "Moderate Wear",
        difficultyFactor: "Standard Setup"
      };

      if (trade === "Carpet Cleaning") {
        const hasPet = cleaned.includes("pet") || cleaned.includes("dog") || cleaned.includes("cat") || cleaned.includes("urine");
        const hasHeavy = cleaned.includes("heavy") || cleaned.includes("dirty") || cleaned.includes("traffic") || cleaned.includes("stain");
        
        estimatedRangeMin = hasHeavy ? 220 : 130;
        estimatedRangeMax = hasHeavy ? 310 : 180;
        
        visualAnalysisSummary = `Analysis of carpet layout${image ? " using jobsite snapshot" : ""} showing moderate cut-pile carpet. Heavy wear and traffic staining are visible in transition zones and pathways. ${hasPet ? "Urine odor signature or specific localized spot discolourations require specialized sub-surface extraction." : "No severe pet damage indicated at superficial level."}`;
        
        upsellRecommendations = [
          {
            item: "Commercial-Grade Pet Spot & Enzyme Odor Treatment",
            estimatedCost: 75,
            justification: "Visible light biological spots and high-humidity environments can trigger deep padding spores."
          },
          {
            item: "Teflon Advanced Fabric Protectant Shield",
            estimatedCost: 95,
            justification: "Restores spill repelling barrier to prevent future dye setting on traffic lane pathways."
          },
          {
            item: "Sub-Floor Rotary Scrub & Deodorizer Option",
            estimatedCost: 45,
            justification: "Assures complete pathogen neutralizing for nested fibers."
          }
        ];
        
        technicalScopeMetrics = {
          sizeEstimate: hasHeavy ? "3 Areas (~650 sq ft)" : "2 Areas (~400 sq ft)",
          severityCondition: hasHeavy ? "Severe Traffic Discoloration" : "Moderate Soil Build-up",
          difficultyFactor: "Standard furniture maneuvering/transition strips."
        };
      } else if (trade === "Roofing") {
        estimatedRangeMin = cleaned.includes("repair") ? 350 : 8500;
        estimatedRangeMax = cleaned.includes("repair") ? 650 : 14000;
        
        visualAnalysisSummary = `Roof inspection report generated for typical gable layout. Visual flags show minor ridge cap wind-scuffing alongside localized asphalt shingle granulation loss. Minor gutter sagging noticed on rear elevations.`;
        
        upsellRecommendations = [
          {
            item: "Ridge Cap Shingle Reinforcement & Sealant Paste",
            estimatedCost: 195,
            justification: "Impedes high-velocity wind lift on exposed seams over the attic vent line."
          },
          {
            item: "Algicide Gutter Wash & Premium Moss-Halt Spray",
            estimatedCost: 350,
            justification: "Heavy moss growth near north-facing valley margins traps moisture, accelerating shingle rot."
          }
        ];
        
        technicalScopeMetrics = {
          sizeEstimate: "24 Squares (approx. 2400 sq ft)",
          severityCondition: "Moderate Granule Deficit",
          difficultyFactor: "Medium Steep Pitch (7/12) with single-tier access."
        };
      } else if (trade === "Lawn & Landscaping") {
        estimatedRangeMin = cleaned.includes("mulch") || cleaned.includes("cleanup") ? 350 : 65;
        estimatedRangeMax = cleaned.includes("mulch") || cleaned.includes("cleanup") ? 600 : 95;
        
        visualAnalysisSummary = `Visual lawn condition logs show slightly overdue turf growth (approx 5-6 inches) with minor weed infestation along the driveway boundaries. Soil compaction signs are present on heavy foot-paths.`;
        
        upsellRecommendations = [
          {
            item: "Core Aeration & Broadleaf OverSeeding Treatment",
            estimatedCost: 180,
            justification: "Helps root oxygenation and fills patchy areas before summer weeds establish."
          },
          {
            item: "Pre-Emergent Edge Trimming & Triple-Shredded Bark Mulching",
            estimatedCost: 290,
            justification: "Suppresses future volunteer seedlings and delivers high-contrast curb elegance."
          }
        ];
        
        technicalScopeMetrics = {
          sizeEstimate: "7,500 sq ft Turf Yard",
          severityCondition: "Mild-Moderate Compacted Thatch",
          difficultyFactor: "Standard perimeter fence and multiple dog gate obstacles."
        };
      } else if (trade === "Auto Detailing") {
        const premium = cleaned.includes("ceramic") || cleaned.includes("premium") || cleaned.includes("paint");
        estimatedRangeMin = premium ? 240 : 120;
        estimatedRangeMax = premium ? 380 : 180;
        
        visualAnalysisSummary = `Exterior auto survey flags minor clear-coat micro-scratches (swirls) under direct lighting, alongside standard road-tar accumulation behind fender flares. Front cabin seats show standard dye-transfer stains from jeans.`;
        
        upsellRecommendations = [
          {
            item: "Polymer-Shield Scratch Swirl Correction & Paint Polish",
            estimatedCost: 145,
            justification: "Removes fine linear surface scratches to restore high gloss depth."
          },
          {
            item: "High-Temperature Cabin Steam & Bio-Extraction Treatment",
            estimatedCost: 65,
            justification: "Eliminates biological residue inside center console crevices and sanitizes AC ducts."
          }
        ];
        
        technicalScopeMetrics = {
          sizeEstimate: "Mid-Size SUV / Crossover",
          severityCondition: "Moderate Clear-coat Oxidation & Dirty Cabins",
          difficultyFactor: "Requires precise custom leather hand treatment and detail brushes."
        };
      } else { // House Cleaning
        const heavyChange = cleaned.includes("move") || cleaned.includes("appliances") || cleaned.includes("deep");
        estimatedRangeMin = heavyChange ? 220 : 140;
        estimatedRangeMax = heavyChange ? 350 : 210;
        
        visualAnalysisSummary = `Standard visual survey indicates dust settling on surface panels, with typical splash staining in kitchen splashguards. Showers highlight light soap scum rings and calcification signs around plumbing fixtures.`;
        
        upsellRecommendations = [
          {
            item: "Deep Oven & Range Back-Vent Chemical Degreasing",
            estimatedCost: 55,
            justification: "Baked grease and charcoal deposits pose thermal inefficiency and particulate hazards."
          },
          {
            item: "All-Fixtures Hardwater Calcium & Soap-Scum Restoration",
            estimatedCost: 70,
            justification: "Mineral build-up on shower glazing requires heavy acidic emulsifiers to restore visual clarity."
          }
        ];
        
        technicalScopeMetrics = {
          sizeEstimate: "3 Bed, 2 Bath (~1600 sq ft)",
          severityCondition: "Moderate Daily Dusty Resettlement",
          difficultyFactor: "Includes hardwood panels requiring strict pH balanced cleaner protocols."
        };
      }

      const responseJSON = {
        tradeDetected: trade,
        estimatedRangeMin,
        estimatedRangeMax,
        confidenceScore: 0.88,
        visualAnalysisSummary,
        upsellRecommendations,
        technicalScopeMetrics
      };

      return res.json(responseJSON);
    }
    
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during Orby analysis." });
  }
});

// Configure Vite middleware or build servers
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Orby Server running on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to boot Express/Vite server setup:", err);
});
