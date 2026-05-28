import React, { useState } from "react";
import { SavedEstimate, TradeType, AppTheme } from "../types";
import { 
  History, 
  Search, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  ArrowRight
} from "lucide-react";

interface SavedCollectionProps {
  estimates: SavedEstimate[];
  onSelect: (estimate: SavedEstimate) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  theme?: AppTheme;
}

export const SavedCollection: React.FC<SavedCollectionProps> = ({
  estimates,
  onSelect,
  onDelete,
  onClearAll,
  theme
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<TradeType | "All">("All");

  const filteredEstimates = estimates.filter((est) => {
    const matchesSearch = 
      est.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.clientAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTrade = selectedTrade === "All" || est.tradeDetected === selectedTrade;
    
    return matchesSearch && matchesTrade;
  });

  const getStatusStyle = (status: SavedEstimate['status']) => {
    switch (status) {
      case 'Draft': return 'border-zinc-500 text-zinc-400 bg-zinc-950/40 rounded-full px-2.5 py-0.5';
      case 'Sent': return 'border-cyan-500/40 text-cyan-300 bg-cyan-950/20 rounded-full px-2.5 py-0.5';
      case 'Approved': return theme 
        ? `${theme.accentBorder} ${theme.id === 'purple' ? 'text-white' : 'text-white'} ${theme.accentBg || 'bg-[#6366F1]'}`
        : 'border-[#6366F1] text-white bg-[#6366F1] rounded-full px-2.5 py-0.5';
      case 'Completed': return theme
        ? `${theme.accentBorder} ${theme.accentText} ${theme.badgeBg}`
        : 'border-[#10B981] text-[#10B981] bg-[#064E3B]/40 rounded-full px-2.5 py-0.5';
      default: return 'border-zinc-700 text-white rounded-full px-2.5 py-0.5';
    }
  };

  const borderLightClass = theme ? theme.borderLight : "border-[#222B3E]";
  const borderAccentClass = theme ? theme.accentBorder : "border-[#6366F1]";
  const textAccentClass = theme ? theme.accentText : "text-[#6366F1]";
  const badgeClass = theme ? theme.badgeClass : "bg-[#161C2A] text-[#94A3B8] border-[#222B3E]/40 hover:bg-[#1E1B4B]/20 hover:text-white rounded-full px-2.5 py-0.5";

  return (
    <div id="saved-collection" className={`bg-[#161C2A] border ${borderLightClass} p-8 space-y-6 shadow-2xl rounded-xl`}>
      
      {/* Title block */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${borderLightClass} pb-4`}>
        <div className="flex items-center gap-2.5">
          <History className={`w-5 h-5 ${textAccentClass}`} />
          <div>
            <h2 className="font-serif italic text-xl text-white">Estimate Log History</h2>
            <p className="text-[9px] text-[#8E9F9B] font-mono uppercase tracking-widest mt-0.5">Manage previously archived dynamic quotes ({estimates.length})</p>
          </div>
        </div>
        
        {estimates.length > 0 && (
          <button 
            id="clear-all-btn"
            onClick={onClearAll} 
            className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition duration-150 cursor-pointer"
          >
            Clear History Log
          </button>
        )}
      </div>

      {estimates.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-10 text-center border border-dashed ${borderLightClass} bg-black/40`}>
          <History className="w-8 h-8 text-[#8E9F9B] mb-2.5 opacity-50" />
          <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">No Saved Quotes Yet</p>
          <p className="text-[10px] text-[#8E9F9B] max-w-xs mt-1 leading-relaxed">Generated quotes saved in workspace will populate below for historical log comparisons.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9F9B]" />
              <input 
                id="search-estimates-input"
                type="text" 
                placeholder="Search history by customer or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full text-xs py-2.5 pl-10 pr-4 bg-black/50 border ${borderLightClass} text-white focus:outline-none focus:border-accent-dynamic font-sans transition`}
                style={theme ? { borderColor: `${theme.primaryHex}30` } : {}}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              {(["All", "Carpet Cleaning", "House Cleaning", "Roofing", "Auto Detailing", "Lawn & Landscaping"] as const).map((trade) => (
                <button
                  id={`filter-trade-${trade.replace(/\s+/g, '')}`}
                  key={trade}
                  onClick={() => setSelectedTrade(trade)}
                  className={`px-3 py-1.5 text-[10px] font-sans font-semibold tracking-wide border transition rounded-xl ${
                    selectedTrade === trade 
                      ? theme ? `${theme.id === 'purple' || theme.id === 'emerald' ? 'text-white' : 'text-[#0B0F19]'}` : "bg-[#6366F1] text-white border-[#6366F1]" 
                      : theme ? `bg-[#161C2A] text-[#94A3B8] border-[#222B3E] hover:bg-zinc-800/10 hover:text-white` : "bg-[#161C2A] text-[#94A3B8] border-[#222B3E] hover:bg-[#1E1B4B]/10 hover:text-white"
                  }`}
                  style={selectedTrade === trade && theme ? { backgroundColor: theme.primaryHex, borderColor: theme.primaryHex } : {}}
                >
                  {trade}
                </button>
              ))}
            </div>
          </div>

          {/* List display */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {filteredEstimates.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#8E9F9B] font-mono italic">
                No archived reports matching keyword filter.
              </p>
            ) : (
              filteredEstimates.map((est) => (
                <div 
                  id={`saved-est-card-${est.id}`}
                  key={est.id}
                  className={`group relative flex flex-col justify-between bg-[#161C2A] border ${borderLightClass} hover:border-accent-dynamic p-5.5 rounded-xl transition select-none`}
                  style={theme ? { borderColor: `${theme.primaryHex}20` } : {}}
                >
                  {/* Category and date header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${textAccentClass}`}>
                      {est.tradeDetected}
                    </span>
                    <span className="text-[9px] text-[#8E9F9B] font-serif italic flex items-center gap-1">
                      <Calendar className={`w-3 h-3 ${textAccentClass}`} /> {new Date(est.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Client name and address info */}
                  <div className="mb-4">
                    <h3 className="font-serif italic text-base text-white flex items-center gap-1.5 line-clamp-1">
                      <User className={`w-3.5 h-3.5 ${textAccentClass} shrink-0`} />
                      {est.clientName || "Unnamed Recipient"}
                    </h3>
                    <p className="text-xs text-[#8E9F9B] flex items-center gap-1.5 mt-1 line-clamp-1">
                      <MapPin className={`w-3.5 h-3.5 ${textAccentClass} shrink-0`} />
                      {est.clientAddress || "Address Unstated"}
                    </p>
                  </div>

                  {/* Pricing brief */}
                  <div className={`bg-[#0B0F19] border ${borderLightClass} p-3 flex items-center justify-between mb-4 text-xs font-sans rounded-xl`}>
                    <div>
                      <span className="text-[#8E9F9B] text-[8.5px] font-mono uppercase tracking-wider block">Estimated Band</span>
                      <span className="font-mono font-bold text-white text-xs">${est.estimatedRangeMin} - ${est.estimatedRangeMax}</span>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span className="text-[#8E9F9B] text-[8.5px] font-mono uppercase tracking-wider block">Invoice Total</span>
                      <span className={`font-mono font-black ${textAccentClass} text-sm`}>${est.totalCost.toFixed(2)}</span>
                    </div>
                    <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${getStatusStyle(est.status)}`}>
                      {est.status}
                    </span>
                  </div>

                  {/* Footer actions */}
                  <div className={`flex items-center justify-between pt-3 border-t ${borderLightClass}`}>
                    <button
                      id={`delete-est-btn-${est.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(est.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-300 hover:underline transition text-[9px] uppercase font-mono font-bold tracking-widest flex items-center gap-1 cursor-pointer"
                      title="Erase quote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      id={`load-est-btn-${est.id}`}
                      onClick={() => onSelect(est)}
                      className={`text-[9px] font-mono font-bold uppercase tracking-widest ${textAccentClass} hover:text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer`}
                    >
                      <span>Load Workspace</span>
                      <ArrowRight className={`w-3 h-3 ${textAccentClass} transition group-hover:translate-x-1`} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
