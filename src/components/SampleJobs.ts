import { EstimateResult, TradeType } from "../types";

export interface SampleJobPreset {
  id: string;
  title: string;
  trade: TradeType;
  description: string;
  avatarIcon: string;
  visualMockSvg: string; // inline dynamic styled graphic
  realisticResult: EstimateResult;
}

// Inline SVGs to represent visual job sites elegantly to the contractor
export const getCarpetMockSvg = (severity: 'moderate' | 'heavy') => `
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="w-full h-full bg-amber-50 rounded-lg overflow-hidden border border-amber-100">
  <rect width="100%" height="100%" fill="#faf7f2" />
  <g opacity="0.15">
    <pattern id="carpetPattern" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#c2b295" />
      <circle cx="7" cy="7" r="1.2" fill="#d9ceb9" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#carpetPattern)" />
  </g>
  <!-- Traffic Lane Darkening -->
  <path d="M 120,0 Q 150,150 140,300 M 250,0 Q 280,110 270,300" stroke="#d5c8ab" stroke-width="${severity === 'heavy' ? '85' : '45'}" stroke-linecap="round" fill="none" opacity="0.45" filter="blur(20px)" />
  <!-- Stains -->
  <circle cx="160" cy="120" r="${severity === 'heavy' ? '30' : '15'}" fill="#a37e5c" opacity="0.32" filter="blur(8px)" />
  <circle cx="180" cy="130" r="${severity === 'heavy' ? '18' : '10'}" fill="#805633" opacity="0.38" filter="blur(6px)" />
  <circle cx="280" cy="210" r="12" fill="#c36343" opacity="0.25" filter="blur(5px)" />
  <!-- Text Overlays -->
  <text x="20" y="270" font-family="monospace" font-size="11" fill="#786c55" font-weight="600">OBSERVATION MODE: MEDIUM PILE</text>
  <text x="20" y="285" font-family="monospace" font-size="10" fill="#a0947e">${severity === 'heavy' ? 'PET RESIDUE & SEVERE WEAR COHORT' : 'MODERATE PATHWAY SOIL LOAD'}</text>
  <rect x="270" y="20" width="110" height="24" rx="4" fill="#805633" opacity="0.9" />
  <text x="282" y="36" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="bold">PET STAIN PREWARP</text>
</svg>
`;

export const getRoofMockSvg = (severity: 'repair' | 'replace') => `
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="w-full h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
  <rect width="100%" height="100%" fill="#1e293b" />
  <!-- Shingle Grids -->
  <g stroke="#334155" stroke-width="1.2" opacity="0.5">
    ${Array.from({ length: 15 }).map((_, i) => `<line x1="0" y1="${i * 20}" x2="400" y2="${i * 20}" />`).join('')}
    ${Array.from({ length: 20 }).map((_, i) => `<line x1="${(i * 20) + (i % 2 ? 10 : 0)}" y1="0" x2="${(i * 20) + (i % 2 ? 10 : 0)}" y2="300" stroke-dasharray="2,18" />`).join('')}
  </g>
  <!-- Damage and Moss -->
  ${severity === 'replace' ? `
    <!-- Extensive moss lines -->
    <path d="M 0,110 Q 150,140 300,90 T 400,120" stroke="#4d7c0f" stroke-width="14" fill="none" opacity="0.75" filter="blur(6px)" />
    <path d="M 50,220 Q 200,240 350,210" stroke="#375a03" stroke-width="25" fill="none" opacity="0.8" filter="blur(10px)" />
    <!-- Chimney damage -->
    <circle cx="320" cy="140" r="25" fill="#111827" opacity="0.9" filter="blur(4px)" stroke="#b91c1c" stroke-width="2" />
    <text x="305" y="105" font-family="sans-serif" font-size="9" fill="#f87171" font-weight="bold">FLASHING FAILED</text>
  ` : `
    <!-- Minor Moss and simple crack -->
    <path d="M 120,50 Q 200,80 280,60" fill="none" stroke="#65a30d" stroke-width="8" filter="blur(4px)" opacity="0.6" />
    <line x1="180" y1="140" x2="220" y2="180" stroke="#000000" stroke-width="3" opacity="0.8" />
    <text x="120" y="215" font-family="sans-serif" font-size="9" fill="#94a3b8">HAIL SCUFF MARK INDEX</text>
  `}
  <!-- Text overlays -->
  <text x="20" y="270" font-family="monospace" font-size="11" fill="#94a3b8" font-weight="600">AUDIT UNIT: SHINGLE GABLE</text>
  <text x="20" y="285" font-family="monospace" font-size="10" fill="#64748b">${severity === 'replace' ? 'ELEVATED ROT risk — OVER 20 SQUARES' : 'MINOR RIDGE REINFORCEMENT SCOPE'}</text>
  <rect x="270" y="20" width="110" height="24" rx="4" fill="#0f172a" stroke="#ef4444" stroke-width="1" />
  <text x="278" y="35" font-family="sans-serif" font-size="9" fill="#ef4444" font-weight="bold">MOSS THREAT LVL 4</text>
</svg>
`;

export const getLawnMockSvg = () => `
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="w-full h-full bg-emerald-950 rounded-lg overflow-hidden border border-emerald-800">
  <rect width="100%" height="100%" fill="#022c22" />
  <!-- Overgrown Weeds Pattern -->
  <g opacity="0.5">
    ${Array.from({ length: 45 }).map((_, i) => `
      <path d="M ${Math.random() * 400},${Math.random() * 250} Q ${(Math.random() * 400) + 15},${Math.random() * 250} ${(Math.random() * 400) + 10},${(Math.random() * 250) + 20}" stroke="#4d7c0f" stroke-width="${3 + Math.random() * 5}" fill="none" />
      <circle cx="${Math.random() * 400}" cy="${Math.random() * 250}" r="${1 + Math.random() * 3}" fill="#eab308" />
    `).join('')}
  </g>
  <!-- Fence / Boundary lines -->
  <line x1="20" y1="10" x2="20" y2="290" stroke="#78350f" stroke-width="6" stroke-dasharray="15,5" />
  <line x1="20" y1="40" x2="380" y2="40" stroke="#78350f" stroke-width="4" opacity="0.7" />
  <!-- Bare brown spots -->
  <ellipse cx="150" cy="180" rx="35" ry="15" fill="#451a03" opacity="0.65" filter="blur(8px)" />
  <ellipse cx="280" cy="100" rx="45" ry="20" fill="#451a03" opacity="0.55" filter="blur(10px)" />
  <!-- Text overlays -->
  <text x="30" y="270" font-family="monospace" font-size="11" fill="#a7f3d0" font-weight="600">AUDIT UNIT: LAWN & perimeter</text>
  <text x="30" y="285" font-family="monospace" font-size="10" fill="#34d399">SOIL COMPACTION IN MID-SECTION</text>
  <rect x="250" y="10" width="130" height="24" rx="4" fill="#047857" />
  <text x="258" y="25" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="bold">BROADLEAF INFILTRATION</text>
</svg>
`;

export const getAutoMockSvg = () => `
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="w-full h-full bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800">
  <rect width="100%" height="100%" fill="#171717" />
  <!-- Car door curvature mockup -->
  <path d="M 50,150 Q 200,80 350,150 T 50,220" fill="none" stroke="#262626" stroke-width="12" />
  <!-- Swirl marks on paint -->
  <g stroke="#ffffff" opacity="0.2" fill="none">
    <circle cx="200" cy="130" r="40" stroke-width="0.3" stroke-dasharray="5,2" />
    <circle cx="200" cy="130" r="60" stroke-width="0.3" stroke-dasharray="8,4" />
    <circle cx="200" cy="130" r="80" stroke-width="0.3" stroke-dasharray="10,6" />
    <circle cx="210" cy="140" r="30" stroke-width="0.2" />
    <circle cx="180" cy="120" r="50" stroke-width="0.25" stroke-dasharray="4,1" />
  </g>
  <!-- Road grime and stains on fabric -->
  <rect x="80" y="200" width="240" height="50" rx="10" fill="#525252" opacity="0.25" filter="blur(8px)" />
  <circle cx="120" cy="220" r="15" fill="#404040" opacity="0.4" filter="blur(4px)" />
  <!-- Text overlays -->
  <text x="20" y="270" font-family="monospace" font-size="11" fill="#e5e5e5" font-weight="600">AUDIT UNIT: PREMIUM CLEARCOAT</text>
  <text x="20" y="285" font-family="monospace" font-size="10" fill="#a3a3a3">MICRO-SCUFF COAXIAL REFRACTION</text>
  <rect x="270" y="20" width="115" height="24" rx="4" fill="#3f3f46" />
  <text x="278" y="35" font-family="sans-serif" font-size="9" fill="#10b981" font-weight="bold">SWIRLS DETECTED (B+)</text>
</svg>
`;

export const getHouseMockSvg = () => `
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="w-full h-full bg-amber-50 rounded-lg overflow-hidden border border-amber-200">
  <rect width="100%" height="100%" fill="#fffbf5" />
  <!-- Tile lines -->
  <g stroke="#f3e8ff" stroke-width="1.5">
    ${Array.from({ length: 10 }).map((_, i) => `<line x1="0" y1="${i * 35}" x2="400" y2="${i * 35}" />`).join('')}
    ${Array.from({ length: 12 }).map((_, i) => `<line x1="${i * 35}" y1="0" x2="${i * 35}" y2="300" />`).join('')}
  </g>
  <!-- Grime and Grease marks -->
  <circle cx="180" cy="110" r="30" fill="#78350f" opacity="0.14" filter="blur(15px)" />
  <path d="M 120,80 Q 150,90 200,85 T 280,105" stroke="#ca8a04" stroke-width="12" fill="none" opacity="0.2" filter="blur(8px)" />
  <circle cx="210" cy="130" r="18" fill="#71717a" opacity="0.15" filter="blur(8px)" />
  <!-- Limestone Scale / shower calcification -->
  <g opacity="0.4">
    <circle cx="80" cy="80" r="8" fill="#e2e8f0" filter="blur(2px)" />
    <circle cx="95" cy="110" r="12" fill="#cbd5e1" filter="blur(3px)" />
    <circle cx="70" cy="120" r="15" fill="#e2e8f0" filter="blur(3px)" />
  </g>
  <!-- Text overlays -->
  <text x="20" y="270" font-family="monospace" font-size="11" fill="#854d0e" font-weight="600">AUDIT UNIT: KITCHEN REVERB RANGE</text>
  <text x="20" y="285" font-family="monospace" font-size="10" fill="#ca8a04">LIPID SATURATION INDEX ON TILE</text>
  <rect x="260" y="15" width="125" height="24" rx="4" fill="#a21caf" />
  <text x="268" y="30" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="bold">SCALE & SOAP FILM</text>
</svg>
`;

// Static presets matching each trade correctly
export const SampleJobsList: SampleJobPreset[] = [
  {
    id: "preset-carpet-pet",
    title: "Living/Hallway Carpet with Heavy Pet Urine Spots",
    trade: "Carpet Cleaning",
    description: "Steam-clean three rooms and hallway. Severe localized staining, high dog urine smell in main transition corridor and high pile traffic lane darkening.",
    avatarIcon: "🐶",
    visualMockSvg: getCarpetMockSvg("heavy"),
    realisticResult: {
      tradeDetected: "Carpet Cleaning",
      estimatedRangeMin: 210,
      estimatedRangeMax: 320,
      confidenceScore: 0.94,
      visualAnalysisSummary: "Detailed appraisal identifies severe biological urine stains nested deep into primary backing. Noticeable fibers matting along high traffic pathway.",
      upsellRecommendations: [
        {
          item: "Pet Sub-Surface Enzyme Biological Flushing",
          estimatedCost: 85,
          justification: "Critical pathogen counteractive needed to dissolve high urea odor spores nested in the carpet backing."
        },
        {
          item: "Teflon Fiber Deflector Protectant Shield",
          estimatedCost: 75,
          justification: "Necessary to recreate clean spill repel surface on the freshly scoured traffic lanes."
        },
        {
          item: "Premium Room Deodorizer Mist Infusion",
          estimatedCost: 35,
          justification: "De-escalates stale ambient odors post steam-flush cycle."
        }
      ],
      technicalScopeMetrics: {
        sizeEstimate: "3 Rooms & 1 Hall (~680 sq ft)",
        severityCondition: "Severe biological staining & fiber matted paths",
        difficultyFactor: "Requires high transition layout and extra flush passes."
      }
    }
  },
  {
    id: "preset-carpet-standard",
    title: "Standard Living Room Light Maintenance",
    trade: "Carpet Cleaning",
    description: "Standard light colored residential bedroom suite. Light grey nylon with only light traffic lane scuffs and slight coffee spot near nightstand.",
    avatarIcon: "🛏️",
    visualMockSvg: getCarpetMockSvg("moderate"),
    realisticResult: {
      tradeDetected: "Carpet Cleaning",
      estimatedRangeMin: 120,
      estimatedRangeMax: 160,
      confidenceScore: 0.89,
      visualAnalysisSummary: "Inspection highlights high-integrity nylon loops with trace dynamic traffic scuffs and 1 minor tannin coffee spill on right hand corridor.",
      upsellRecommendations: [
        {
          item: "Dynamic Food Dye & Tannin Stain Extractor",
          estimatedCost: 40,
          justification: "To break down nested coffee acid bonds without stripping neutral loop pigment."
        },
        {
          item: "Quick-Dry Rotary Moisture Extraction Fan",
          estimatedCost: 35,
          justification: "Shortens normal dry curve from 12 hours down to 2-3 hours for immediate re-occupancy."
        }
      ],
      technicalScopeMetrics: {
        sizeEstimate: "1 Master Suite (~300 sq ft)",
        severityCondition: "Light surface scuffing & trace spills",
        difficultyFactor: "Standard uncluttered empty layout."
      }
    }
  },
  {
    id: "preset-roof-repair",
    title: "Moss Infested Asphalt Shingles Inspect",
    trade: "Roofing",
    description: "Inspect moss growth on north-facing roof valley of single-story home. Minor gutter leakage, shingles showing standard granule loss with wind-lift along ridge.",
    avatarIcon: "🏠",
    visualMockSvg: getRoofMockSvg("replace"),
    realisticResult: {
      tradeDetected: "Roofing",
      estimatedRangeMin: 650,
      estimatedRangeMax: 1200,
      confidenceScore: 0.91,
      visualAnalysisSummary: "North elevation inspection shows moderate to severe green moss accumulation over 4 roof valleys. Thick root rhizoids have begun lifting shingle tabs.",
      upsellRecommendations: [
        {
          item: "Heavy Moss Root-Stop Algicidal Wash & Scrub",
          estimatedCost: 380,
          justification: "To treat and eradicate underlying spores preventing wood decking decay from moisture lock."
        },
        {
          item: "Valley Ice-Shield Sealant & Flashing Reline",
          estimatedCost: 290,
          justification: "North sides frequently remain moist; structural sealants guarantee leakage protection."
        },
        {
          item: "Gutter Clear & Sag Reinforcement Brackets",
          estimatedCost: 180,
          justification: "Restores accurate flow pitch on sag lines under high water runoff."
        }
      ],
      technicalScopeMetrics: {
        sizeEstimate: "18 Roof Squares (~1,800 sq ft roof envelope)",
        severityCondition: "Heavy Moss & Raised Shingle Seams",
        difficultyFactor: "Standard 8/12 angle, simple Ranch access."
      }
    }
  },
  {
    id: "preset-auto-premium",
    title: "Executive SUV Multi-Stage Detail",
    trade: "Auto Detailing",
    description: "Premium full interior leather care and paint micro-scuff correction. High swirl marks under headlight rays, dirty console crevices, minor dog hair on rear bench.",
    avatarIcon: "🚗",
    visualMockSvg: getAutoMockSvg(),
    realisticResult: {
      tradeDetected: "Auto Detailing",
      estimatedRangeMin: 250,
      estimatedRangeMax: 390,
      confidenceScore: 0.88,
      visualAnalysisSummary: "Exterior assessment recognizes high swirl densities in clear-coat layers. Cab interior shows leather dryness and fine particle dust inside steering columns.",
      upsellRecommendations: [
        {
          item: "Polymer Nano-Ceramic 12-Month Paint Sealant",
          estimatedCost: 150,
          justification: "To lock in gloss brilliance and protect correction layers from road-salts and UV fading."
        },
        {
          item: "Steam Cab Sanitization & AC Vent Ionizing",
          estimatedCost: 65,
          justification: "Purges structural mold components nested in air distribution ducts."
        },
        {
          item: "Rear Bench Pet Hair Extraction Pass",
          estimatedCost: 40,
          justification: "Removes woven double-coat animal dander fibers deep locked in carpets."
        }
      ],
      technicalScopeMetrics: {
        sizeEstimate: "Mid-Size 3-Row SUV",
        severityCondition: "Surface swirl marks & embedded dust lines",
        difficultyFactor: "Tight electronic screens and custom speaker gills require hand brushes."
      }
    }
  },
  {
    id: "preset-lawn-standard",
    title: "Overgrown Yard Spring Cleanup & Mulch",
    trade: "Lawn & Landscaping",
    description: "Densely overgrown lawn perimeter with dandelions and broadleaf weeds. Bare spots from previous winter shade, messy garden borders needing re-mulching.",
    avatarIcon: "🌱",
    visualMockSvg: getLawnMockSvg(),
    realisticResult: {
      tradeDetected: "Lawn & Landscaping",
      estimatedRangeMin: 320,
      estimatedRangeMax: 550,
      confidenceScore: 0.93,
      visualAnalysisSummary: "Visual green audit lists turf height averages of 7 inches. Broadleaf infestation rates average approx 18% of lawn area. Soil shows high hard-crust compaction.",
      upsellRecommendations: [
        {
          item: "High-Efficiency Aeration & Overseeding Pass",
          estimatedCost: 220,
          justification: "Combats hard-crust compaction allowing seed integration prior to sun exposure."
        },
        {
          item: "Premium Bark Mulch Bed Install & Clean Borders",
          estimatedCost: 280,
          justification: "To rebuild weed suppressant levels and lock in tree node moisture."
        },
        {
          item: "Pre-Emergent Weed-Stop Treatment",
          estimatedCost: 85,
          justification: "Inhibits immediate seed germination in clear borders."
        }
      ],
      technicalScopeMetrics: {
        sizeEstimate: "8,200 sq ft Mixed Turf & Beds",
        severityCondition: "Severely Overgrown Trim Lines with Patchy Soil",
        difficultyFactor: "Multiple custom shrub nodes and perimeter tree lines require specialized weed-wacker work."
      }
    }
  },
  {
    id: "preset-house-kitchen",
    title: "Deep Kitchen Cleandown & Bathroom Scalecut",
    trade: "House Cleaning",
    description: "Prepare rental apartment for move-out. Heavy kitchen oven grease, calcium buildup on master bath shower glass and tile grout graying.",
    avatarIcon: "✨",
    visualMockSvg: getHouseMockSvg(),
    realisticResult: {
      tradeDetected: "House Cleaning",
      estimatedRangeMin: 220,
      estimatedRangeMax: 360,
      confidenceScore: 0.95,
      visualAnalysisSummary: "Apartment check reveals hard lipid-grease coatings on burner vents. Shower glass features thick gray calcium deposits from long-term hardwater crystallization.",
      upsellRecommendations: [
        {
          item: "Chemical Heavy oven Core Restoration Service",
          estimatedCost: 65,
          justification: "Carbonized oils locked on elements pose mild fire smoke hazards. High alkalinity strips base carbon molecules cleanly."
        },
        {
          item: "Bathroom Calcification Acid Restoration Strip",
          estimatedCost: 75,
          justification: "Calcium buildup blocks glass translucency. Specific acidic paste emulsifies crystals safely."
        },
        {
          item: "Baseboard Deep Handwash Detailing Package",
          estimatedCost: 55,
          justification: "Hand dusting restores high contrast white trim borders to move-out baseline status."
        }
      ],
      technicalScopeMetrics: {
        sizeEstimate: "2 Bed, 2 Bath (~1100 sq ft)",
        severityCondition: "Heavy Lipid Deposits & Heavy Calcification",
        difficultyFactor: "Requires heavy acidic and alkaline specialized compound rotations."
      }
    }
  }
];
