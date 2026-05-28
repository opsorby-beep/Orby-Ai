export type TradeType = 'Carpet Cleaning' | 'House Cleaning' | 'Roofing' | 'Auto Detailing' | 'Lawn & Landscaping';

export interface UpsellRecommendation {
  item: string;
  estimatedCost: number;
  justification: string;
}

export interface TechnicalScopeMetrics {
  sizeEstimate: string;
  severityCondition: string;
  difficultyFactor: string;
}

export interface EstimateResult {
  tradeDetected: TradeType;
  estimatedRangeMin: number;
  estimatedRangeMax: number;
  confidenceScore: number;
  visualAnalysisSummary: string;
  upsellRecommendations: UpsellRecommendation[];
  technicalScopeMetrics: TechnicalScopeMetrics;
}

export interface SavedEstimate extends EstimateResult {
  id: string;
  createdAt: string;
  clientName: string;
  clientAddress: string;
  description: string;
  notes?: string;
  image?: string;
  selectedUpsellItems: string[]; // item names that are active
  customItems: { description: string; cost: number }[];
  marginPct: number; // e.g. 10%
  taxPct: number; // e.g. 8.25%
  discount: number; // flat discount
  status: 'Draft' | 'Sent' | 'Approved' | 'Completed';
  totalCost: number;
}

export interface AppTheme {
  id: 'emerald' | 'cyan' | 'amber' | 'purple';
  name: string;
  primaryHex: string;
  primaryBg: string;
  accentText: string;
  accentBg?: string;
  accentBorder: string;
  borderLight: string;
  badgeBg: string;
  badgeText: string;
  badgeClass: string;
  glowBtn: string;
  accentSlider: string;
  glowColor?: string;
  darkBg?: string;
  gradientGlow: string;
}

