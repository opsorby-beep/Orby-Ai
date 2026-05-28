import React, { useState, useEffect } from "react";
import { SavedEstimate, EstimateResult, AppTheme } from "../types";
import { 
  Plus, 
  Trash2, 
  FileCheck, 
  Share2, 
  Printer, 
  Settings, 
  User, 
  Briefcase, 
  Calculator,
  Check
} from "lucide-react";

interface InvoiceBuilderProps {
  baseResult: EstimateResult;
  selectedUpsellItems: string[];
  onSave: (estimate: SavedEstimate) => void;
  savedItemToLoad?: SavedEstimate | null;
  theme?: AppTheme;
  onboardedBusinessName?: string;
}

export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({
  baseResult,
  selectedUpsellItems,
  onSave,
  savedItemToLoad,
  theme,
  onboardedBusinessName
}) => {
  // Company details
  const [companyName, setCompanyName] = useState(onboardedBusinessName || "Apex Home Services");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  
  // Pricing states
  const defaultBaseMode = Math.round((baseResult.estimatedRangeMin + baseResult.estimatedRangeMax) / 2);
  const [basePrice, setBasePrice] = useState<number>(defaultBaseMode);
  
  // Custom added items
  const [customItems, setCustomItems] = useState<{ id: string; description: string; cost: number }[]>([]);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemCost, setNewItemCost] = useState("");

  // Modifiers
  const [marginPct, setMarginPct] = useState<number>(10); // 10% markup / buffer
  const [taxPct, setTaxPct] = useState<number>(8.25); // standard house clean/tax
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState<SavedEstimate['status']>("Draft");

  // UX Feedback actions
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSavedDone, setIsSavedDone] = useState(false);

  // Prefill business details from onboarding on load
  useEffect(() => {
    if (onboardedBusinessName && !savedItemToLoad) {
      setCompanyName(onboardedBusinessName);
    }
  }, [onboardedBusinessName, savedItemToLoad]);

  // Sync when estimate shifts
  useEffect(() => {
    if (savedItemToLoad) {
      setCompanyName(savedItemToLoad.clientName ? (onboardedBusinessName || "Apex Home Services") : "Apex Home Services");
      setClientName(savedItemToLoad.clientName);
      setClientAddress(savedItemToLoad.clientAddress);
      setClientEmail(savedItemToLoad.clientEmail || "");
      setBasePrice(savedItemToLoad.estimatedRangeMin); // or midpoint
      setCustomItems(savedItemToLoad.customItems?.map((item, index) => ({
        id: `custom-${index}`,
        description: item.description,
        cost: item.cost
      })) || []);
      setMarginPct(savedItemToLoad.marginPct);
      setTaxPct(savedItemToLoad.taxPct);
      setDiscount(savedItemToLoad.discount);
      setStatus(savedItemToLoad.status);
    } else {
      setBasePrice(defaultBaseMode);
      setCustomItems([]);
    }
  }, [baseResult, savedItemToLoad]);

  // Extract selected upsell prices
  const activeUpsells = baseResult.upsellRecommendations.filter(rec => 
    selectedUpsellItems.includes(rec.item)
  );

  // Math components
  const upsellsTotal = activeUpsells.reduce((acc, curr) => acc + curr.estimatedCost, 0);
  const customItemsTotal = customItems.reduce((acc, curr) => acc + curr.cost, 0);
  
  // Formulas
  const subtotal = basePrice + upsellsTotal + customItemsTotal;
  const markupAmount = subtotal * (marginPct / 100);
  const subtotalWithMarkup = subtotal + markupAmount;
  const taxAmount = subtotalWithMarkup * (taxPct / 100);
  const totalCost = Math.max(0, subtotalWithMarkup + taxAmount - discount);

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc || !newItemCost) return;
    const costNum = parseFloat(newItemCost);
    if (isNaN(costNum)) return;

    setCustomItems([
      ...customItems,
      {
        id: Date.now().toString(),
        description: newItemDesc,
        cost: costNum
      }
    ]);
    setNewItemDesc("");
    setNewItemCost("");
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
  };

  const handleTriggerSave = () => {
    const rawSaved: SavedEstimate = {
      ...baseResult,
      id: savedItemToLoad?.id || Date.now().toString(),
      createdAt: savedItemToLoad?.createdAt || new Date().toISOString(),
      clientName: clientName || "Valued Customer",
      clientAddress: clientAddress || "Jobsite Location",
      clientEmail: clientEmail,
      description: baseResult.visualAnalysisSummary,
      selectedUpsellItems,
      customItems: customItems.map(item => ({ description: item.description, cost: item.cost })),
      marginPct,
      taxPct,
      discount,
      status,
      totalCost
    };
    onSave(rawSaved);
    setIsSavedDone(true);
    setTimeout(() => {
      setIsSavedDone(false);
    }, 2800);
  };

  const handleCopyMockLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const mockShareUrl = `https://orby.pro/quote/apex-${Math.floor(100000 + Math.random() * 900000)}`;

  const borderLightClass = theme ? theme.borderLight : "border-[#222B3E]";
  const borderAccentClass = theme ? theme.accentBorder : "border-[#6366F1]";
  const textAccentClass = theme ? theme.accentText : "text-[#6366F1]";
  const badgeClass = theme ? theme.badgeClass : "bg-[#1E1B4B] text-[#818CF8] border-[#222B3E]/30 rounded-full px-2.5 py-0.5";
  const glowBtn = theme ? theme.glowBtn : "bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold rounded-xl transition duration-150";
  const accentSlider = theme ? theme.accentSlider : "accent-[#6366F1]";

  return (
    <div id="invoice-builder-workspace" className={`bg-[#161C2A] border ${borderLightClass} p-8 space-y-8 shadow-2xl relative rounded-xl`}>
      <div 
        className="absolute top-0 left-0 w-full h-1" 
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${theme ? theme.primaryHex : '#6366F1'}, transparent)` }}
      ></div>

      {/* Title block */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border-b ${borderLightClass} pb-4 gap-4`}>
        <div className="flex items-center gap-2">
          <Calculator className={`w-5 h-5 ${textAccentClass}`} />
          <h2 className="font-serif italic text-2xl text-white">Estimate & Draft Proposal</h2>
        </div>
        <select 
          id="proposal-status-select"
          value={status} 
          onChange={(e) => setStatus(e.target.value as any)}
          className={`text-[11px] font-sans font-semibold uppercase tracking-wider px-3.5 py-1.5 border border-[#222B3E] bg-[#0B0F19] text-white focus:border-[#6366F1] outline-none cursor-pointer rounded-xl`}
          style={theme ? { borderColor: `${theme.primaryHex}40` } : {}}
        >
          <option value="Draft">Draft Status</option>
          <option value="Sent">Sent to Client</option>
          <option value="Approved">Approved / Booked</option>
          <option value="Completed">Job Completed</option>
        </select>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contractor / Company Metadata */}
        <div className={`p-6 bg-[#0B0F19] border ${theme ? `${theme.accentBorder}/15` : "border-[#222B3E]"} space-y-4 rounded-xl`}>
          <h3 className={`font-sans font-bold text-[11px] ${textAccentClass} uppercase tracking-[0.2em] flex items-center gap-1.5 border-b ${borderLightClass} pb-2`}>
            <Briefcase className="w-3.5 h-3.5" /> Company Profile
          </h3>
          <div>
            <label className="text-[10px] uppercase font-sans font-bold text-[#94A3B8] tracking-wider block mb-1">Your Company Name</label>
            <input 
              id="company-name-input"
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`w-full text-xs py-2 px-3 bg-[#161C2A]/60 text-white border ${theme ? `${theme.accentBorder}/20` : "border-[#222B3E]"} rounded-xl focus:outline-none focus:border-[#6366F1] font-medium`}
            />
          </div>
        </div>

        {/* Client details info */}
        <div className={`p-6 bg-[#0B0F19] border ${theme ? `${theme.accentBorder}/15` : "border-[#222B3E]"} space-y-4 rounded-xl`}>
          <h3 className={`font-sans font-bold text-[11px] ${textAccentClass} uppercase tracking-[0.2em] flex items-center gap-1.5 border-b ${borderLightClass} pb-2`}>
            <User className="w-3.5 h-3.5" /> Recipient File
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-sans font-bold text-[#94A3B8] tracking-wider block mb-1">Client Name</label>
              <input 
                id="client-name-input"
                type="text" 
                placeholder="John Doe" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={`w-full text-xs py-2 px-3 bg-[#161C2A]/60 text-white border ${theme ? `${theme.accentBorder}/20` : "border-[#222B3E]"} rounded-xl focus:outline-none focus:border-[#6366F1]`}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-sans font-bold text-[#94A3B8] tracking-wider block mb-1">Client Email</label>
              <input 
                id="client-email-input"
                type="email" 
                placeholder="johndoe@email.com" 
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className={`w-full text-xs py-2 px-3 bg-[#161C2A]/60 text-white border ${theme ? `${theme.accentBorder}/20` : "border-[#222B3E]"} rounded-xl focus:outline-none focus:border-[#6366F1]`}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-sans font-bold text-[#94A3B8] tracking-wider block mb-1">Job Address</label>
            <input 
              id="client-address-input"
              type="text" 
              placeholder="123 Main St, Austin TX" 
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className={`w-full text-xs py-2 px-3 bg-[#161C2A]/60 text-white border ${theme ? `${theme.accentBorder}/20` : "border-[#222B3E]"} rounded-xl focus:outline-none focus:border-[#6366F1]`}
            />
          </div>
        </div>
      </div>

      {/* Reline Tables Line Items */}
      <div className="space-y-4">
        <h3 className="font-sans font-bold text-[11px] text-[#94A3B8] uppercase tracking-[0.2em] border-b border-[#222B3E] pb-2">Line Items Calculation</h3>
        
        <div className={`border ${theme ? `${theme.accentBorder}/15` : "border-[#222B3E]"} divide-y divide-zinc-800 rounded-xl overflow-hidden`}>
          {/* Base Labor */}
          <div className="p-4 flex items-center justify-between bg-[#0B0F19] text-xs">
            <div className="space-y-0.5">
              <span className={`font-sans font-bold tracking-wider ${textAccentClass} uppercase`}>Base Professional Labor</span>
              <p className="text-[10px] text-[#94A3B8] italic">Calibrated from AI visual dimensions assessment</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-sans text-[#94A3B8]">$</span>
              <input 
                id="base-labor-input"
                type="number" 
                value={basePrice || ""}
                onChange={(e) => setBasePrice(Math.max(0, parseInt(e.target.value) || 0))}
                className={`w-24 text-right bg-[#161C2A] text-white border ${theme ? `${theme.accentBorder}/30` : "border-[#222B3E]"} rounded-xl py-1.5 px-2 font-mono text-sm font-bold shrink-0 focus:outline-none focus:border-[#6366F1]`}
              />
            </div>
          </div>

          {/* AI Applied recommendations */}
          {activeUpsells.map((up) => (
            <div key={up.item} className="p-4 flex items-center justify-between text-xs bg-[#161C2A]/40">
              <div className="space-y-0.5 pr-4">
                <span className="font-sans font-bold tracking-wider text-white uppercase block">✨ {up.item}</span>
                <p className="text-[10px] text-[#94A3B8] italic truncate line-clamp-1">{up.justification}</p>
              </div>
              <span className={`font-mono font-bold ${textAccentClass} shrink-0`}>+${up.estimatedCost.toFixed(2)}</span>
            </div>
          ))}

          {/* Custom additions */}
          {customItems.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between text-xs bg-[#161C2A]/40">
              <span className="font-sans font-bold tracking-wider text-white uppercase">{c.description}</span>
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-white">${c.cost.toFixed(2)}</span>
                <button 
                  onClick={() => handleRemoveCustomItem(c.id)} 
                  className="p-1 text-red-400 hover:text-red-300 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom labor add-on trigger form */}
        <form onSubmit={handleAddCustomItem} className="flex gap-2">
          <input 
            id="add-custom-desc-input"
            type="text" 
            placeholder="Introduce custom ad-hoc task detail..." 
            value={newItemDesc}
            onChange={(e) => setNewItemDesc(e.target.value)}
            className={`flex-1 text-xs py-2.5 px-3 bg-[#0B0F19] text-white placeholder-zinc-500 border ${theme ? `${theme.accentBorder}/20` : "border-[#222B3E]"} rounded-xl outline-none focus:border-[#6366F1] font-sans`}
          />
          <input 
            id="add-custom-cost-input"
            type="number" 
            placeholder="$ Cost" 
            value={newItemCost}
            onChange={(e) => setNewItemCost(e.target.value)}
            className={`w-20 sm:w-24 text-xs py-2.5 px-2 bg-[#0B0F19] text-white placeholder-zinc-500 border ${theme ? `${theme.accentBorder}/20` : "border-[#222B3E]"} rounded-xl text-center outline-none focus:border-[#6366F1] font-mono`}
          />
          <button 
            id="add-custom-item-submit"
            type="submit" 
            className={`px-4 bg-[#1E1B4B] ${textAccentClass} border ${theme ? `${theme.accentBorder}/40` : "border-[#6366F1]/40"} hover:bg-opacity-80 rounded-xl transition cursor-pointer flex items-center justify-center`}
            style={theme ? { backgroundColor: `${theme.primaryHex}15` } : {}}
            title="Add custom line item"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Margins, Taxes & Discounts Modifiers */}
      <div className={`p-6 bg-[#0B0F19] border ${theme ? `${theme.accentBorder}/15` : "border-[#222B3E]"} space-y-5 text-xs rounded-xl`}>
        <h4 className={`font-sans font-bold text-[11px] ${textAccentClass} uppercase tracking-[0.2em] flex items-center gap-1.5 border-b ${borderLightClass} pb-2`}>
          <Settings className="w-3.5 h-3.5" /> Margin Factors & Modifiers
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
          {/* Profit Markup percentage */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#8E9F9B] font-semibold">Contractor Markup</span>
              <span className="text-white font-bold">{marginPct}%</span>
            </div>
            <input 
              id="markup-percentage-slider"
              type="range" 
              min="0" 
              max="50" 
              value={marginPct}
              onChange={(e) => setMarginPct(parseInt(e.target.value))}
              className={`w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer ${accentSlider}`}
            />
          </div>

          {/* Tax rate percentage */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#8E9F9B] font-semibold">Tax Rate Value</span>
              <span className="text-white font-bold">{taxPct}%</span>
            </div>
            <input 
              id="tax-percentage-slider"
              type="range" 
              min="0" 
              max="15" 
              step="0.25"
              value={taxPct}
              onChange={(e) => setTaxPct(parseFloat(e.target.value))}
              className={`w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer ${accentSlider}`}
            />
          </div>

          {/* Discount flat value */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-[#8E9F9B] font-semibold">Coupons / Discounts</span>
              <span className="text-white font-bold">${discount}</span>
            </div>
            <input 
              id="discount-slider"
              type="range" 
              min="0" 
              max="150" 
              step="5"
              value={discount}
              onChange={(e) => setDiscount(parseInt(e.target.value))}
              className={`w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer ${accentSlider}`}
            />
          </div>
        </div>
      </div>      {/* High contrast total breakdown sheet */}
      <div className="bg-[#0B0F19] border border-[#222B3E] p-8 space-y-4 select-none relative overflow-hidden rounded-xl">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl" style={{ color: theme?.primaryHex || '#6366F1' }}></div>
        
        <div className="flex justify-between text-xs text-[#94A3B8] font-sans">
          <span className="uppercase tracking-wider font-semibold">Subtotal base load:</span>
          <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
        </div>
        
        {marginPct > 0 && (
          <div className="flex justify-between text-xs text-[#94A3B8] border-b border-[#222B3E]/40 pb-2 font-sans">
            <span className="uppercase tracking-wider font-semibold">Markup Buffer (+{marginPct}%):</span>
            <span className="font-mono text-white">+${markupAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs text-[#94A3B8] font-sans">
          <span className="uppercase tracking-wider font-semibold">Taxes Total ({taxPct}%):</span>
          <span className="font-mono text-white">${taxAmount.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-xs font-sans">
            <span className={`uppercase tracking-wider font-bold ${textAccentClass}`}>Special Coupon Discount:</span>
            <span className={`font-mono ${textAccentClass} font-bold`}>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className={`flex justify-between items-end border-t ${theme ? theme.borderLight : 'border-[#222B3E]'} pt-4 mt-2`}>
          <div>
            <span className={`text-xs font-sans font-bold tracking-[0.2em] ${textAccentClass} block`}>TOTAL ESTIMATED INVOICE</span>
            <span className="text-[10px] text-[#94A3B8] font-sans">Full Scope Calibrations Included</span>
          </div>
          <span id="invoice-builder-total" className={`text-4xl sm:text-5xl font-mono tracking-tight ${textAccentClass} font-black shrink-0`}>${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Action buttons list */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          id="save-estimate-btn"
          onClick={handleTriggerSave}
          className={`flex-1 py-3.5 text-xs font-sans font-bold tracking-widest uppercase transition flex items-center justify-center gap-2 cursor-pointer border rounded-xl ${
            isSavedDone 
              ? theme ? `${theme.badgeBg} ${theme.accentText} ${theme.accentBorder}` : "bg-[#1E1B4B] text-[#818CF8] border-[#6366F1]/50 shadow-[0_4px_12px_rgba(99,102,241,0.1)]" 
              : glowBtn
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{isSavedDone ? "Saved - Logged to Workspace!" : "Save Draft Proposal & Log"}</span>
        </button>

        <div className="flex gap-2">
          <button
            id="share-proposal-btn"
            onClick={handleCopyMockLink}
            className={`px-6 py-3.5 border ${theme ? `${theme.accentBorder}/30 hover:border-accent-dynamic` : "border-[#222B3E] hover:border-[#6366F1]"} bg-[#0B0F19] hover:bg-opacity-80 ${textAccentClass} text-xs font-sans font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer rounded-xl transition`}
            title="Generate customer quote link"
          >
            {copiedLink ? <Check className={`w-4 h-4 ${textAccentClass}`} /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Share Link"}</span>
          </button>

          <button
            id="print-proposal-btn"
            onClick={handlePrint}
            className={`px-6 py-3.5 bg-[#0B0F19] border ${theme ? `${theme.accentBorder}/30 hover:border-accent-dynamic` : "border-[#222B3E] hover:border-[#6366F1]"} hover:bg-opacity-80 ${textAccentClass} text-xs font-sans font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer rounded-xl transition`}
            title="Print Estimate sheet"
          >
            <Printer className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Mock Shared Client link preview card */}
      {copiedLink && (
        <div id="mock-link-toast" className={`p-4 bg-[#0B0F19] border ${theme ? theme.accentBorder : 'border-[#6366F1]/45'} space-y-1 text-xs rounded-xl animate-in slide-in-from-bottom duration-200`}>
          <span className={`font-sans font-bold ${textAccentClass} uppercase tracking-wider block`}>Proposal Portal URL Compiled:</span>
          <p className="text-white font-mono break-all text-[11px] underline selection:bg-white selection:text-black">{mockShareUrl}</p>
          <p className="text-[10px] text-[#94A3B8] italic mt-1 leading-relaxed">Deliver this secure layout link to your customer for an immersive, mobile-ready pricing sheet with instant scheduling.</p>
        </div>
      )}
    </div>
  );
};
