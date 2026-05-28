import React from "react";
import { EstimateResult, TradeType, AppTheme } from "../types";
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  Gauge 
} from "lucide-react";

interface EstimateViewProps {
  result: EstimateResult;
  selectedUpsellItems: string[];
  onToggleUpsell: (itemName: string) => void;
  isLoading: boolean;
  theme?: AppTheme;
}

export const EstimateView: React.FC<EstimateViewProps> = ({
  result,
  selectedUpsellItems,
  onToggleUpsell,
  isLoading,
  theme
}) => {
  const {
    tradeDetected,
    estimatedRangeMin,
    estimatedRangeMax,
    confidenceScore,
    visualAnalysisSummary,
    upsellRecommendations,
    technicalScopeMetrics
  } = result;

  // Midpoint calculation
  const midpoint = Math.round((estimatedRangeMin + estimatedRangeMax) / 2);

  const borderLightClass = theme ? theme.borderLight : "border-[#222B3E]";
  const borderAccentClass = theme ? theme.accentBorder : "border-[#6366F1]";
  const textAccentClass = theme ? theme.accentText : "text-[#6366F1]";
  const badgeClass = theme ? theme.badgeClass : "bg-[#1E1B4B] text-[#818CF8] border-[#222B3E]/40 rounded-full px-2.5 py-0.5";
  const gradientGlow = theme ? theme.gradientGlow : "from-[#6366F1]/5";

  return (
    <div id="orby-analysis-dashboard" className="space-y-8">
      
      {/* Editorial Custom Header Section */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-baseline border-b ${borderLightClass} pb-6 mb-2`}>
        <div>
          <h1 className={`text-xs font-mono font-bold tracking-[0.2em] uppercase ${textAccentClass}`}>Orby AI // Site Audit Report</h1>
          <p id="trade-detected-heading" className="text-4xl font-serif italic mt-1 text-white font-medium">{tradeDetected}</p>
        </div>
        <div className="text-left sm:text-right mt-3 sm:mt-0">
          <div className={`inline-block px-4 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase mb-1 ${badgeClass}`}>
            Trade Detected
          </div>
          <p className="text-[10px] text-[#8E9F9B] font-mono uppercase tracking-wider">
            System Confidence: <span className="text-white font-bold">{(confidenceScore * 100).toFixed(1)}%</span>
          </p>
        </div>
      </div>

      {/* Pricing Module: Large Typographic Display */}
      <div className={`bg-[#161C2A] border ${borderLightClass} p-8 shadow-2xl space-y-6 rounded-xl`}>
        <div className={`flex justify-between items-center border-b ${borderLightClass} pb-3`}>
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Estimated Service Range</h3>
          <span className={`text-[10px] font-mono ${textAccentClass} tracking-wider uppercase`}>Trip Minimum: $120.00</span>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider mb-1">Min Bounds</span>
              <span id="price-min-display" className={`text-[64px] sm:text-[96px] font-serif leading-none tracking-tighter ${textAccentClass} pointer-events-none`}>${estimatedRangeMin}</span>
            </div>
            <span className="text-4xl font-serif text-[#94A3B8]/30 block">—</span>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider mb-1">Max Bounds</span>
              <span id="price-max-display" className="text-[64px] sm:text-[96px] font-serif leading-none tracking-tighter text-white pointer-events-none">${estimatedRangeMax}</span>
            </div>
          </div>

          {/* Recommended Quote Spot */}
          <div className={`bg-[#0B0F19] border ${theme ? `${theme.borderLight}` : "border-[#222B3E]"} p-4.5 flex items-center justify-between rounded-xl`}>
            <div className="space-y-0.5 animate-pulse">
              <span className={`text-[9px] ${textAccentClass} font-mono uppercase font-bold tracking-wider block`}>Recommended Scope Spot</span>
              <p className="text-xs text-[#94A3B8] font-sans italic animate-none">Calibrated against contractor history templates</p>
            </div>
            <span id="price-ideal-display" className="text-2xl font-mono font-black text-white">${midpoint}</span>
          </div>

          {/* Slider bar indicator */}
          <div className="relative pt-4 pb-2">
            <div className="h-1 w-full bg-[#0B0F19] relative rounded-full overflow-hidden">
              <div 
                className="h-full absolute left-[15%] right-[15%]" 
                style={{ 
                  backgroundColor: theme ? theme.primaryHex : '#6366F1',
                  boxShadow: theme ? `0 0 10px ${theme.primaryHex}` : '0 0 10px rgba(99,102,241,0.6)' 
                }}
              ></div>
            </div>
            <div 
              className="absolute left-[15%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" 
              style={{ backgroundColor: theme ? theme.primaryHex : '#6366F1' }} 
              title="Min limit"
            ></div>
            <div 
              className="absolute left-[50%] top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-[#0B0F19] border-2 -ml-2.25" 
              style={{ 
                borderColor: theme ? theme.primaryHex : '#6366F1',
                boxShadow: theme ? `0 0 15px ${theme.primaryHex}` : '0 0 15px rgba(99,102,241,0.8)' 
              }} 
              title="Ideal recommended"
            ></div>
            <div 
              className="absolute right-[15%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" 
              style={{ backgroundColor: theme ? theme.primaryHex : '#6366F1' }} 
              title="Max limit"
            ></div>
          </div>
        </div>
      </div>

      {/* Visual Summary Block */}
      <div className={`bg-[#161C2A] border ${borderLightClass} p-8 shadow-2xl space-y-6 rounded-xl`}>
        <h3 className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#94A3B8] border-b ${borderLightClass} pb-2`}>Visual Analysis Diagnostics</h3>
        
        <p id="analysis-summary-text" className="text-base leading-relaxed text-white font-serif">
          {visualAnalysisSummary}
        </p>

        {/* Technical Key Metrics Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t ${borderLightClass}`}>
          <div className="space-y-1">
            <span className="text-[#94A3B8] text-[10px] font-mono font-bold uppercase tracking-wider block">Calculated Area</span>
            <span id="metric-size-estimate" className={`font-serif font-bold text-sm ${textAccentClass} block`}>
              {technicalScopeMetrics.sizeEstimate}
            </span>
          </div>

          <div className={`space-y-1 border-t sm:border-t-0 sm:border-l ${borderLightClass} pt-4 sm:pt-0 sm:pl-6`}>
            <span className="text-[#94A3B8] text-[10px] font-mono font-bold uppercase tracking-wider block">Severity Condition</span>
            <span id="metric-severity-condition" className="font-serif font-bold text-sm text-red-400 block">
              {technicalScopeMetrics.severityCondition}
            </span>
          </div>

          <div className={`space-y-1 border-t sm:border-t-0 sm:border-l ${borderLightClass} pt-4 sm:pt-0 sm:pl-6`}>
            <span className="text-[#94A3B8] text-[10px] font-mono font-bold uppercase tracking-wider block">Difficulty Factor</span>
            <span id="metric-difficulty-factor" className="font-serif font-bold text-sm text-white block">
              {technicalScopeMetrics.difficultyFactor}
            </span>
          </div>
        </div>
      </div>

      {/* Upsell Options: Gorgeous Checkblocks style */}
      <div className={`bg-[#161C2A] border ${borderLightClass} p-8 shadow-2xl space-y-6 rounded-xl`}>
        <div className={`flex items-center justify-between border-b ${borderLightClass} pb-3`}>
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Strategic Upsell Opportunities</h3>
          <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 border ${badgeClass}`}>
            {upsellRecommendations.length} Recommendations
          </span>
        </div>

        <div className="space-y-4">
          {upsellRecommendations.map((upsell, idx) => {
            const isChecked = selectedUpsellItems.includes(upsell.item);

            return (
              <div 
                id={`upsell-card-${idx}`}
                key={upsell.item}
                onClick={() => onToggleUpsell(upsell.item)}
                className={`p-4.5 cursor-pointer transition-all duration-200 select-none border rounded-xl ${
                  isChecked 
                    ? theme ? `${theme.badgeBg} ${theme.accentBorder} text-white` : "bg-[#1E1B4B] border-[#6366F1] text-white shadow-[0_4px_12px_rgba(99,102,241,0.1)]" 
                    : `bg-[#0B0F19] text-white ${borderLightClass} hover:border-[#6366F1]/50`
                }`}
                style={isChecked && theme ? { boxShadow: `0 0 15px ${theme.primaryHex}15` } : {}}
              >
                <div className="flex justify-between items-start mb-2.5">
                  <span className="text-xs font-sans font-bold tracking-wide uppercase flex items-center gap-2">
                    <span 
                      className="w-4 h-4 rounded border flex items-center justify-center text-[10px]"
                      style={{ 
                        backgroundColor: isChecked ? (theme ? theme.primaryHex : '#6366F1') : 'transparent',
                        color: isChecked ? '#ffffff' : 'transparent',
                        borderColor: isChecked ? (theme ? theme.primaryHex : '#6366F1') : '#94A3B8'
                      }}
                    >
                      {isChecked && "✓"}
                    </span>
                    {upsell.item}
                  </span>
                  <span className={`text-xs font-mono font-extrabold ${isChecked ? textAccentClass : "text-[#94A3B8]"}`}>
                    +${upsell.estimatedCost}.00
                  </span>
                </div>
                <p className={`text-[11.5px] leading-relaxed font-sans ${isChecked ? "text-slate-100" : "text-[#94A3B8]"}`}>
                  {upsell.justification}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
