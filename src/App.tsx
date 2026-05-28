import React, { useState, useEffect, useRef } from "react";
import { EstimateResult, SavedEstimate, TradeType, AppTheme } from "./types";
import { SampleJobsList } from "./components/SampleJobs";
import { SavedCollection } from "./components/SavedCollection";
import { EstimateView } from "./components/EstimateView";
import { InvoiceBuilder } from "./components/InvoiceBuilder";
import { collection, doc, setDoc, getDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { 
  Camera, 
  Sparkles, 
  Zap, 
  Layers,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Briefcase,
  User,
  Shield,
  Lock,
  Unlock,
  Users,
  Settings,
  Flame,
  MessageSquare,
  ChevronRight,
  Info,
  Sliders,
  Sparkle,
  ArrowRight,
  RefreshCw,
  Clock,
  Check,
  Sun,
  Moon
} from "lucide-react";

interface BackdoorClient {
  id: string;
  name: string;
  location: string;
  active: boolean;
}

const APP_THEMES: Record<string, AppTheme> = {
  emerald: {
    id: "emerald",
    name: "Upshift Indigo",
    primaryHex: "#6366F1",
    primaryBg: "bg-[#0B0F19]",
    accentText: "text-[#6366F1]",
    accentBorder: "border-[#6366F1]",
    borderLight: "border-[#222B3E]",
    badgeBg: "bg-[#1E1B4B]",
    badgeText: "text-[#818CF8]",
    badgeClass: "bg-[#1E1B4B] text-[#818CF8] border-[#222B3E]/40 rounded-full",
    gradientGlow: "from-[#6366F1]/5",
    glowBtn: "bg-[#6366F1] hover:bg-[#4f46e5] text-white font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(99,102,241,0.2)]",
    accentSlider: "accent-[#6366F1]"
  },
  cyan: {
    id: "cyan",
    name: "Sky Blue",
    primaryHex: "#38BDF8",
    primaryBg: "bg-[#0B0F19]",
    accentText: "text-[#38BDF8]",
    accentBorder: "border-[#38BDF8]",
    borderLight: "border-[#222B3E]",
    badgeBg: "bg-[#0C4A6E]",
    badgeText: "text-[#38BDF8]",
    badgeClass: "bg-[#0C4A6E] text-[#38BDF8] border-[#222B3E]/40 rounded-full",
    gradientGlow: "from-[#38BDF8]/5",
    glowBtn: "bg-[#38BDF8] hover:bg-[#0ea5e9] text-[#0B0F19] font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(56,189,248,0.2)]",
    accentSlider: "accent-[#38BDF8]"
  },
  amber: {
    id: "amber",
    name: "Solar Amber",
    primaryHex: "#F59E0B",
    primaryBg: "bg-[#0B0F19]",
    accentText: "text-[#F59E0B]",
    accentBorder: "border-[#F59E0B]",
    borderLight: "border-[#222B3E]",
    badgeBg: "bg-[#78350F]",
    badgeText: "text-[#FBAF24]",
    badgeClass: "bg-[#78350F] text-[#FBAF24] border-[#222B3E]/40 rounded-full",
    gradientGlow: "from-[#F59E0B]/5",
    glowBtn: "bg-[#F59E0B] hover:bg-[#d97706] text-white font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(245,158,11,0.2)]",
    accentSlider: "accent-[#F59E0B]"
  },
  purple: {
    id: "purple",
    name: "Orchid Purple",
    primaryHex: "#A855F7",
    primaryBg: "bg-[#0B0F19]",
    accentText: "text-[#A855F7]",
    accentBorder: "border-[#A855F7]",
    borderLight: "border-[#222B3E]",
    badgeBg: "bg-[#581C87]",
    badgeText: "text-[#C084FC]",
    badgeClass: "bg-[#581C87] text-[#C084FC] border-[#222B3E]/40 rounded-full",
    gradientGlow: "from-[#A855F7]/5",
    glowBtn: "bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold rounded-xl transition duration-150 shadow-[0_4px_12px_rgba(168,85,247,0.2)]",
    accentSlider: "accent-[#A855F7]"
  }
};

export default function App() {
  // Navigation View flow states
  // "landing" | "onboarding" | "dashboard"
  const [viewState, setViewState] = useState<"landing" | "onboarding" | "dashboard">("landing");
  
  // Custom theme option selections
  const [selectedThemeKey, setSelectedThemeKey] = useState<"emerald" | "cyan" | "amber" | "purple">("emerald");
  const theme = APP_THEMES[selectedThemeKey];

  // Day/Night mode high-visibility sunlight optimization
  const [isDayMode, setIsDayMode] = useState<boolean>(() => {
    return localStorage.getItem("orby_day_mode") === "true";
  });

  const toggleDayMode = () => {
    setIsDayMode(prev => {
      const next = !prev;
      localStorage.setItem("orby_day_mode", String(next));
      return next;
    });
  };

  // Adaptive style variables for Day/Night dynamics
  const modeBg = isDayMode ? "bg-[#F8FAFC]" : "bg-[#0B0F19]";
  const modeText = isDayMode ? "text-[#0F172A]" : "text-[#FFFFFF]";
  const modeTextMuted = isDayMode ? "text-[#475569] font-medium" : "text-[#94A3B8]";
  const modeCardBg = isDayMode ? "bg-[#FFFFFF] border-slate-200 shadow-sm text-slate-800 rounded-xl" : "bg-[#161C2A] border-[#222B3E] rounded-xl";
  const modeCardBgSolid = isDayMode ? "bg-[#FFFFFF] border-slate-200 shadow text-slate-800 rounded-xl animate-in fade-in" : `bg-[#161C2A] border border-[#222B3E] rounded-xl`;
  const modeHeaderBg = isDayMode ? "bg-[#FFFFFF]/95 border-slate-200 shadow-sm text-slate-800" : `bg-[#161C2A]/90 backdrop-blur-md border-b border-[#222B3E]`;
  const modeInputBg = isDayMode ? "bg-[#FFFFFF] text-slate-900 border-slate-300 placeholder-slate-400 rounded-xl" : "bg-[#0B0F19] text-white border-[#222B3E] placeholder-[#94A3B8]/60 rounded-xl";
  const modeBorderLine = isDayMode ? "border-slate-200" : "border-[#222B3E]";
  const modeBadgeClass = isDayMode ? "bg-indigo-50 border-indigo-200 text-indigo-700 border rounded-full px-2.5 py-0.5" : theme.badgeClass;
  const modeGlowBtn = isDayMode ? `bg-indigo-600 hover:bg-indigo-700 text-white font-bold border border-indigo-700 rounded-xl transition duration-150` : theme.glowBtn;
  const modeSubHeader = isDayMode ? "text-slate-700 font-semibold" : "text-zinc-400";

  // Onboarded User Profile states
  const [onboardedBusinessName, setOnboardedBusinessName] = useState("");
  const [onboardedTrade, setOnboardedTrade] = useState("Carpet Cleaning");
  const [onboardedWhatsApp, setOnboardedWhatsApp] = useState("");
  const [onboardedWebsite, setOnboardedWebsite] = useState("");
  const [onboardedCity, setOnboardedCity] = useState("");
  const [onboardedState, setOnboardedState] = useState("");
  const [onboardedZip, setOnboardedZip] = useState("");
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [customTrade, setCustomTrade] = useState("");

  // Description and upload state
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userTradePreference, setUserTradePreference] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  // Active loaded states
  const [isLoading, setIsLoading] = useState(false);
  const [activeEstimate, setActiveEstimate] = useState<EstimateResult | null>(null);
  const [selectedUpsellItems, setSelectedUpsellItems] = useState<string[]>([]);
  const [activeSavedToLoad, setActiveSavedToLoad] = useState<SavedEstimate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Collection History Log List
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>([]);

  // System Hybrid Toggle State
  const [systemMode, setSystemMode] = useState<"Manual" | "AI">("AI");

  // Hidden Backdoor Matrix States
  const [isBackdoorOpen, setIsBackdoorOpen] = useState(false);
  const [backdoorPasscode, setBackdoorPasscode] = useState("");
  const [isBackdoorUnlocked, setIsBackdoorUnlocked] = useState(false);
  const [backdoorError, setBackdoorError] = useState("");
  const [backdoorClients, setBackdoorClients] = useState<BackdoorClient[]>([
    { id: "1", name: "Texas Cleaners LLC", location: "Dallas, TX", active: true },
    { id: "2", name: "RoofKings Seattle", location: "Seattle, WA", active: true },
    { id: "3", name: "Austin Spark Detailers", location: "Austin, TX", active: false },
    { id: "4", name: "PacNorth Lawn Techs", location: "Portland, OR", active: true }
  ]);

  // Section references for smooth scrolling
  const sectionRefs = {
    home: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    howToUse: useRef<HTMLDivElement>(null),
    gapsFilled: useRef<HTMLDivElement>(null),
    marketShift: useRef<HTMLDivElement>(null),
    pricing: useRef<HTMLDivElement>(null),
    matrix: useRef<HTMLDivElement>(null)
  };

  const scrollToSection = (section: keyof typeof sectionRefs) => {
    sectionRefs[section]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cloud state synchronization on mount
  useEffect(() => {
    const initializeFromCloud = async () => {
      // Check if user has an existing contractorId pairing
      let cId = localStorage.getItem("orby_contractor_id");
      
      // Migration Strategy: If they don't have a contractorId, check if they have local profile they haven't migrated
      const cachedProfileString = localStorage.getItem("orby_profile");
      let cachedProfile: any = null;
      if (cachedProfileString) {
        try {
          cachedProfile = JSON.parse(cachedProfileString);
        } catch (e) {}
      }

      if (!cId && cachedProfile && cachedProfile.businessName) {
        // Generate a new ID and migrate them to Firestore
        cId = "c_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 5);
        localStorage.setItem("orby_contractor_id", cId);
        setContractorId(cId);

        try {
          await setDoc(doc(db, "contractors", cId), {
            businessName: cachedProfile.businessName,
            primaryTrade: cachedProfile.primaryTrade || "Carpet Cleaning",
            whatsapp: "",
            website: "",
            city: "",
            state: "",
            zip: "",
            themeKey: cachedProfile.themeKey || "emerald",
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          console.error("Migration failed:", err);
        }
      }

      if (cId) {
        setContractorId(cId);
        
        // 1. Fetch Contractor Profile from Cloud Db
        try {
          const contractorSnap = await getDoc(doc(db, "contractors", cId));
          if (contractorSnap.exists()) {
            const data = contractorSnap.data();
            setOnboardedBusinessName(data.businessName || "");
            setOnboardedTrade(data.primaryTrade || "Carpet Cleaning");
            setOnboardedWhatsApp(data.whatsapp || "");
            setOnboardedWebsite(data.website || "");
            setOnboardedCity(data.city || "");
            setOnboardedState(data.state || "");
            setOnboardedZip(data.zip || "");
            if (data.themeKey && APP_THEMES[data.themeKey]) {
              setSelectedThemeKey(data.themeKey);
            }
            // Skip straight to the personalized Workspace Dashboard!
            setViewState("dashboard");
            setUserTradePreference(data.primaryTrade || "Carpet Cleaning");

            // Pre-populate preset based on their trade
            const match = SampleJobsList.find(p => p.trade === (data.primaryTrade || "Carpet Cleaning"));
            if (match) {
              setDescription(match.description);
              setUserTradePreference(match.trade);
              const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(match.visualMockSvg)}`;
              setSelectedImage(svgBase64);
              setActiveEstimate(match.realisticResult);
              setSelectedUpsellItems([match.realisticResult.upsellRecommendations[0]?.item].filter(Boolean));
            }
          } else if (cachedProfile) {
            // Document doesn't exist anymore but profile was cached, let's restore
            setOnboardedBusinessName(cachedProfile.businessName || "");
            setOnboardedTrade(cachedProfile.primaryTrade || "Carpet Cleaning");
            if (cachedProfile.themeKey && APP_THEMES[cachedProfile.themeKey]) {
              setSelectedThemeKey(cachedProfile.themeKey);
            }
            if (cachedProfile.onboarded) {
              setViewState("dashboard");
              setUserTradePreference(cachedProfile.primaryTrade || "Carpet Cleaning");
            }
          }
        } catch (err) {
          console.error("Firestore contractor fetch failure:", err);
          if (cachedProfile) {
            setOnboardedBusinessName(cachedProfile.businessName || "");
            setOnboardedTrade(cachedProfile.primaryTrade || "Carpet Cleaning");
            if (cachedProfile.themeKey && APP_THEMES[cachedProfile.themeKey]) {
              setSelectedThemeKey(cachedProfile.themeKey);
            }
            if (cachedProfile.onboarded) {
              setViewState("dashboard");
              setUserTradePreference(cachedProfile.primaryTrade || "Carpet Cleaning");
            }
          }
        }

        // 2. Fetch Estimates from Cloud Db
        try {
          const q = query(collection(db, "estimates"), where("contractorId", "==", cId));
          const querySnapshot = await getDocs(q);
          const estimatesList: SavedEstimate[] = [];
          querySnapshot.forEach((docSnap) => {
            estimatesList.push(docSnap.data() as SavedEstimate);
          });
          if (estimatesList.length > 0) {
            estimatesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setSavedEstimates(estimatesList);
          } else {
            const cachedHistory = localStorage.getItem("orby_history_v2");
            if (cachedHistory) {
              try {
                const parsedHist = JSON.parse(cachedHistory);
                setSavedEstimates(parsedHist);
                for (const est of parsedHist) {
                  await setDoc(doc(db, "estimates", est.id), { ...est, contractorId: cId });
                }
              } catch (e) {}
            }
          }
        } catch (err) {
          console.error("Firestore estimates fetch failure:", err);
          const cachedHistory = localStorage.getItem("orby_history_v2");
          if (cachedHistory) {
            try {
              setSavedEstimates(JSON.parse(cachedHistory));
            } catch (e) {}
          }
        }
      } else {
        const cachedHistory = localStorage.getItem("orby_history_v2");
        if (cachedHistory) {
          try {
            setSavedEstimates(JSON.parse(cachedHistory));
          } catch (e) {}
        }
      }
    };

    initializeFromCloud();
  }, []);

  // Sync back to local storage
  const syncHistory = (list: SavedEstimate[]) => {
    setSavedEstimates(list);
    localStorage.setItem("orby_history_v2", JSON.stringify(list));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Preset Selection Trigger
  const handleSelectPreset = (presetId: string) => {
    const preset = SampleJobsList.find(p => p.id === presetId);
    if (preset) {
      setDescription(preset.description);
      setUserTradePreference(preset.trade);
      
      const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(preset.visualMockSvg)}`;
      setSelectedImage(svgBase64);
      
      // Auto populate results immediately to make presets snappy and delightful
      setActiveEstimate(preset.realisticResult);
      setSelectedUpsellItems([preset.realisticResult.upsellRecommendations[0]?.item].filter(Boolean));
      setActiveSavedToLoad(null);
      setErrorMsg(null);
    }
  };

  const handleAnalyzeJob = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setActiveSavedToLoad(null);
    
    try {
      const payload = {
        image: selectedImage,
        description,
        userTradePreference: userTradePreference === "" ? undefined : userTradePreference
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP network malfunction: code ${response.status}`);
      }

      const report: EstimateResult = await response.json();
      setActiveEstimate(report);
      // Automatically check the first recommendation as a friendly dynamic onboarding
      if (report.upsellRecommendations && report.upsellRecommendations.length > 0) {
        setSelectedUpsellItems([report.upsellRecommendations[0].item]);
      } else {
        setSelectedUpsellItems([]);
      }
    } catch (err: any) {
      console.error("Analysis Failure:", err);
      setErrorMsg(err.message || "Unspecified server computation error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUpsellItem = (itemName: string) => {
    if (selectedUpsellItems.includes(itemName)) {
      setSelectedUpsellItems(selectedUpsellItems.filter(item => item !== itemName));
    } else {
      setSelectedUpsellItems([...selectedUpsellItems, itemName]);
    }
  };

  // Manage Estimate lists
  const handleSaveEstimateDraft = async (draft: SavedEstimate) => {
    let cId = contractorId || localStorage.getItem("orby_contractor_id");
    if (!cId) {
      cId = "anonymous";
    }

    const draftWithContractor = {
      ...draft,
      contractorId: cId
    };

    const exists = savedEstimates.some(est => est.id === draft.id);
    let updated: SavedEstimate[] = [];
    if (exists) {
      updated = savedEstimates.map(est => est.id === draft.id ? draft : est);
    } else {
      updated = [draft, ...savedEstimates];
    }
    syncHistory(updated);
    setActiveSavedToLoad(draft);

    // Save to Firestore 'estimates' collection
    try {
      await setDoc(doc(db, "estimates", draft.id), draftWithContractor);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `estimates/${draft.id}`);
    }
  };

  const handleDeleteEstimate = async (id: string) => {
    const updated = savedEstimates.filter(est => est.id !== id);
    syncHistory(updated);
    if (activeSavedToLoad && activeSavedToLoad.id === id) {
      setActiveSavedToLoad(null);
    }

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, "estimates", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `estimates/${id}`);
    }
  };

  const handleClearAllHistory = async () => {
    if (window.confirm("Are you sure you want to erase all saved proposal drafts from historical list logs?")) {
      const oldList = [...savedEstimates];
      syncHistory([]);
      setActiveSavedToLoad(null);

      // Clean up cloud storage
      for (const est of oldList) {
        try {
          await deleteDoc(doc(db, "estimates", est.id));
        } catch (err) {
          console.error("Failed to delete estimate in cloud clean:", err);
        }
      }
    }
  };

  const handleLoadSavedEstimate = (saved: SavedEstimate) => {
    // Populate active workspace with saved data values
    setActiveEstimate({
      tradeDetected: saved.tradeDetected,
      estimatedRangeMin: saved.estimatedRangeMin,
      estimatedRangeMax: saved.estimatedRangeMax,
      confidenceScore: saved.confidenceScore,
      visualAnalysisSummary: saved.description,
      upsellRecommendations: saved.upsellRecommendations,
      technicalScopeMetrics: saved.technicalScopeMetrics
    });
    
    setSelectedUpsellItems(saved.selectedUpsellItems || []);
    setActiveSavedToLoad(saved);
    setDescription("");
    // Recover image preview if was present in preset or saved state
    const matchingPreset = SampleJobsList.find(p => p.trade === saved.tradeDetected);
    if (matchingPreset) {
      setSelectedImage(`data:image/svg+xml;utf8,${encodeURIComponent(matchingPreset.visualMockSvg)}`);
    } else {
      setSelectedImage(null);
    }
  };

  const handleResetWorkspace = () => {
    setDescription("");
    setSelectedImage(null);
    setUserTradePreference("");
    setActiveEstimate(null);
    setSelectedUpsellItems([]);
    setActiveSavedToLoad(null);
    setErrorMsg(null);
  };

  // Dev backdoor code logic
  const handleVerifyBackdoorCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (backdoorPasscode === "6400") {
      setIsBackdoorUnlocked(true);
      setBackdoorError("");
    } else {
      setBackdoorError("Invalid developer credentials.");
      setTimeout(() => setBackdoorError(""), 3000);
    }
  };

  const handleToggleBackdoorClient = (id: string) => {
    setBackdoorClients(prev => prev.map(client => {
      if (client.id === id) {
        return { ...client, active: !client.active };
      }
      return client;
    }));
  };

  const handleStartOnboarding = () => {
    setViewState("onboarding");
    setOnboardingStep(1);
  };

  const handleCompleteOnboarding = async () => {
    const chosenTrade = onboardedTrade === "Custom" ? customTrade || "Handyman" : onboardedTrade;
    
    // Generate or fetch a secure contractorId
    let cId = contractorId || localStorage.getItem("orby_contractor_id");
    if (!cId) {
      cId = "c_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 5);
      localStorage.setItem("orby_contractor_id", cId);
      setContractorId(cId);
    }

    // Save profile settings locally
    const profile = {
      businessName: onboardedBusinessName || "Apex Home Services",
      primaryTrade: chosenTrade,
      whatsApp: onboardedWhatsApp,
      website: onboardedWebsite,
      city: onboardedCity,
      state: onboardedState,
      zip: onboardedZip,
      themeKey: selectedThemeKey,
      onboarded: true
    };
    localStorage.setItem("orby_profile", JSON.stringify(profile));
    
    // Cloud Firestore Setup - Save Business metadata permanently
    try {
      await setDoc(doc(db, "contractors", cId), {
        businessName: profile.businessName,
        primaryTrade: profile.primaryTrade,
        whatsapp: profile.whatsApp,
        website: profile.website,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
        themeKey: profile.themeKey,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `contractors/${cId}`);
    }

    // Configure default tradeoffs inside state
    setUserTradePreference(chosenTrade);
    setViewState("dashboard");
    
    // Auto-pre-populate their workplace with a matching preset for instant, high-converting wow-factor
    const match = SampleJobsList.find(p => p.trade === chosenTrade);
    if (match) {
      setDescription(match.description);
      setUserTradePreference(match.trade);
      const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(match.visualMockSvg)}`;
      setSelectedImage(svgBase64);
      setActiveEstimate(match.realisticResult);
      setSelectedUpsellItems([match.realisticResult.upsellRecommendations[0]?.item].filter(Boolean));
    } else {
      // Fallback first preset is carpet cleaning
      const fallback = SampleJobsList[0];
      if (fallback) {
        handleSelectPreset(fallback.id);
      }
    }
  };

  // Define pricing cards for Landing Page
  const pricingPlans = [
    {
      name: "Starter Pilot",
      price: "$0",
      period: "Free forever",
      desc: "For solo technicians testing AI power in standard home audits.",
      features: [
        "Interactive Preset Scenarios",
        "Self-Managed Diagnostic Slider",
        "Up to 5 Live Client Shares/mo",
        "Standard General Margin Modifier"
      ],
      glow: false
    },
    {
      name: "Contractor Pro",
      price: "$49",
      period: "per user / month",
      desc: "Our most chosen suite for active trades demanding visual proof.",
      features: [
        "Uncapped Visual Image Scanning",
        "Advanced Gemini Autonomous Autopilot",
        "Instant WhatsApp Quote Support",
        "Custom Business Branding Prefills",
        "Unlimited Proposals & Saved Logs"
      ],
      glow: true
    },
    {
      name: "Enterprise Multi",
      price: "$149",
      period: "per team / month",
      desc: "Tailored algorithms for multi-truck crews needing heavy reporting.",
      features: [
        "All Contractor Pro Benefits",
        "Multiple Team Shared Sync Portal",
        "Dedicated Premium Cloud Pipeline",
        "Enterprise Custom Cost baselines",
        "Dedicated Priority Hotline"
      ],
      glow: false
    }
  ];

  return (
    <div className={`min-h-screen ${modeBg} ${modeText} font-sans pb-16 relative transition-colors duration-500 selection:bg-accent-dynamic selection:text-black`}>
      
      {/* Dynamic CSS Variables Integration for Custom themes */}
      <style>{`
        :root {
          --color-accent: ${theme.primaryHex};
        }
        .text-accent-dynamic { color: ${theme.primaryHex}; }
        .bg-accent-dynamic { background-color: ${theme.primaryHex}; }
        .border-accent-dynamic { border-color: ${theme.primaryHex}; }
        .focus-border-accent:focus { border-color: ${theme.primaryHex} !important; }
        
        ${isDayMode ? `
          body {
            background-color: #F8FAFC !important;
            color: #0F172A !important;
          }
          .aurora-radial {
            background-image: radial-gradient(circle at 50% 0px, ${theme.primaryHex}0c 0%, transparent 55%) !important;
          }
          /* High contrast readability elements for Day Mode */
          input, textarea, select {
            color: #0F172A !important;
          }
        ` : `
          .aurora-radial {
            background-image: radial-gradient(circle at 50% 0px, ${theme.primaryHex}1a 0%, transparent 60%);
          }
        `}

        @media print {
          body * {
            visibility: hidden;
            background-color: white !important;
            color: black !important;
          }
          #invoice-builder-workspace, #invoice-builder-workspace * {
            visibility: visible;
          }
          #invoice-builder-workspace {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            color: black !important;
            background: white !important;
          }
          #add-custom-item-submit, 
          #add-custom-desc-input, 
          #add-custom-cost-input, 
          #save-estimate-btn, 
          #share-proposal-btn, 
          #print-proposal-btn,
          #proposal-status-select,
          #mock-link-toast {
            display: none !important;
          }
        }
      `}</style>

      {/* RENDER VIEW 1: THE PUBLIC LANDING PAGE */}
      {viewState === "landing" && (
        <div className="aurora-radial">
          {/* Landing Header */}
          <header className={`sticky top-0 z-40 transition-all duration-300 ${modeHeaderBg}`}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xl font-bold transition-all ${isDayMode ? 'border-emerald-600/35 bg-white' : 'bg-black/40'}`}
                  style={{ borderColor: !isDayMode ? `${theme.primaryHex}50` : undefined, color: theme.primaryHex, boxShadow: `0 0 10px ${theme.primaryHex}20` }}
                >
                  ☉
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`font-serif italic font-black text-2xl tracking-tight ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Orby</h1>
                    <span 
                      className={`text-[9px] font-mono font-bold border uppercase tracking-widest px-2 py-0.5 ${isDayMode ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-black/40'}`}
                      style={!isDayMode ? { color: theme.primaryHex, borderColor: `${theme.primaryHex}40` } : {}}
                    >
                      {isDayMode ? "Sunlight Edition" : "Aurora Edition"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Bar links */}
              <nav className={`hidden md:flex items-center gap-6 text-xs font-mono font-bold uppercase tracking-wider ${isDayMode ? 'text-slate-600' : 'text-[#8E9F9B]'}`}>
                <button onClick={() => scrollToSection("home")} className={`transition cursor-pointer ${isDayMode ? 'hover:text-emerald-700 hover:underline' : 'hover:text-white'}`}>Home</button>
                <button onClick={() => scrollToSection("about")} className={`transition cursor-pointer ${isDayMode ? 'hover:text-emerald-700 hover:underline' : 'hover:text-white'}`}>About</button>
                <button onClick={() => scrollToSection("howToUse")} className={`transition cursor-pointer ${isDayMode ? 'hover:text-emerald-700 hover:underline' : 'hover:text-white'}`}>How To Use</button>
                <button onClick={() => scrollToSection("gapsFilled")} className={`transition cursor-pointer ${isDayMode ? 'hover:text-emerald-700 hover:underline' : 'hover:text-white'}`}>Gaps Filled</button>
                <button onClick={() => scrollToSection("marketShift")} className={`transition cursor-pointer ${isDayMode ? 'hover:text-emerald-700 hover:underline' : 'hover:text-white'}`}>Market Shift</button>
                <button onClick={() => scrollToSection("pricing")} className={`transition cursor-pointer ${isDayMode ? 'hover:text-emerald-700 hover:underline' : 'hover:text-white'}`}>Pricing</button>
              </nav>

              <div className="flex items-center gap-3.5">
                {/* Day/Night Toggle Switch */}
                <button
                  onClick={toggleDayMode}
                  className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    isDayMode 
                      ? "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800" 
                      : "border-zinc-800 bg-black/50 hover:bg-neutral-900 text-yellow-400 hover:text-yellow-300"
                  }`}
                  title={isDayMode ? "Switch to Night Mode (Aurora)" : "Switch to Day Mode (Sunlight)"}
                  style={!isDayMode ? { borderColor: `${theme.primaryHex}35` } : {}}
                >
                  {isDayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleStartOnboarding}
                  className={`px-5 py-2 text-xs font-mono font-bold uppercase tracking-widest transition rounded-none cursor-pointer ${modeGlowBtn}`}
                >
                  Get Started
                </button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <div ref={sectionRefs.home} className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center space-y-8 relative">
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-current opacity-5 rounded-full blur-[120px] pointer-events-none" style={{ color: theme.primaryHex }}></div>
            
            <div className="space-y-4 max-w-4xl mx-auto z-10 relative">
              <div className="inline-flex items-center gap-1.5 bg-black/50 border border-zinc-800 px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase">
                <Sparkle className="w-3.5 h-3.5" style={{ color: theme.primaryHex }} />
                <span>Next-Gen Visual Site Audit OS</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-serif italic text-white leading-tight font-medium tracking-tight">
                Orby: Autonomous AI Business Companion for Home Service Contractors
              </h2>
              <p className="text-sm sm:text-lg text-[#8E9F9B] font-sans max-w-2xl mx-auto leading-relaxed">
                Empower your service business. Analyze real jobsite conditions instantaneously with intelligent computer vision algorithms to trigger high-profit estimates, tailored recommendations, and customer proposals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 z-10 relative">
              <button
                onClick={handleStartOnboarding}
                className={`w-full sm:w-auto px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest transition rounded-none flex items-center justify-center gap-2 cursor-pointer ${theme.glowBtn}`}
              >
                <span>Initialize Dynamic Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => scrollToSection("about")}
                className={`w-full sm:w-auto px-8 py-4 border ${theme.accentBorder}/30 hover:border-accent-dynamic text-white text-xs font-mono font-bold tracking-widest uppercase bg-black/40 hover:bg-opacity-25 transition`}
              >
                Explore System baselines
              </button>
            </div>
          </div>

          {/* Interactive ROI Tracker and Competitor Matrix Component Block */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* ROI Tracker Panel */}
              <div className="lg:col-span-6 bg-[#061512]/60 border border-zinc-800/80 p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800/60 pb-3">
                    <TrendingUp className="w-4 h-4 text-accent-dynamic" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#FFFFFF]">Interactive ROI Tracker</h3>
                  </div>
                  <p className="text-xs text-[#8E9F9B] font-sans leading-relaxed mb-6">
                    Real-time modeling of fuel savings, hours reclaimed from drafting spreadsheets, and recovered revenue losses.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Today */}
                  <div className="flex items-center justify-between p-4.5 bg-black/60 border border-zinc-800/40 hover:border-accent-dynamic/40 transition">
                    <span className="text-[10px] font-mono uppercase text-[#8E9F9B] font-bold">Today</span>
                    <div className="text-right">
                      <span className="text-sm font-serif italic block text-white font-bold">$30 Fuel Saved</span>
                      <span className="text-[10px] font-mono text-accent-dynamic block">2 Hrs Reclaimed</span>
                    </div>
                  </div>

                  {/* This Month */}
                  <div className="flex items-center justify-between p-4.5 bg-black/60 border border-zinc-800/40 hover:border-accent-dynamic/40 transition">
                    <span className="text-[10px] font-mono uppercase text-[#8E9F9B] font-bold">This Month</span>
                    <div className="text-right">
                      <span className="text-sm font-serif italic block text-white font-bold">$340 Fuel Saved</span>
                      <span className="text-[10px] font-mono text-accent-dynamic block">$1,200 Recovered Drops</span>
                    </div>
                  </div>

                  {/* This Year */}
                  <div className="flex items-center justify-between p-4.5 border text-xs" style={{ backgroundColor: `${theme.primaryHex}0c`, borderColor: `${theme.primaryHex}40` }}>
                    <span className="text-[10px] font-mono uppercase font-black text-accent-dynamic">Current Team Streak</span>
                    <div className="text-right font-bold">
                      <span className="text-base font-serif italic block text-white font-black">$4,080 Gas Saved</span>
                      <span className="text-[9px] font-mono text-[#8E9F9B] block">Heuristic Diagnostics Algorithm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legacy vs Orby Competitor Matrix */}
              <div ref={sectionRefs.matrix} className={`lg:col-span-6 p-8 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden transition-all duration-300 ${modeCardBg}`}>
                <div>
                  <div className={`flex items-center gap-2 mb-4 border-b pb-3 ${isDayMode ? 'border-slate-200' : 'border-zinc-800/60'}`}>
                    <Sliders className="w-4 h-4 text-accent-dynamic" />
                    <h3 className={`text-xs font-mono font-bold uppercase tracking-[0.2em] ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Legacy CRM Comparison Matrix</h3>
                  </div>
                  <p className={`text-xs font-sans leading-relaxed mb-6 ${modeTextMuted}`}>
                    See how Orby optimizes standard home servicing operations against manual software like Jobber and ServiceTitan.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className={`border-b ${isDayMode ? 'border-slate-300' : 'border-zinc-800'}`}>
                        <th className={`py-3 font-mono font-bold uppercase tracking-wider ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Metrics</th>
                        <th className="py-3 text-center text-accent-dynamic font-extrabold uppercase tracking-wider">Orby AI Engine</th>
                        <th className={`py-3 text-center uppercase tracking-wider ${isDayMode ? 'text-slate-700' : 'text-zinc-400'}`}>Legacy (Jobber/Titan/Thumbtack)</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDayMode ? 'divide-slate-200' : 'divide-zinc-800/40'}`}>
                      <tr>
                        <td className={`py-3.5 font-sans font-bold text-xs ${isDayMode ? 'text-slate-800' : 'text-zinc-200'}`}>Cost Structure</td>
                        <td className="py-3.5 text-center text-accent-dynamic font-bold">
                          $19 – $99/mo <span className={`text-[9px] block font-normal font-mono ${isDayMode ? 'text-slate-500' : 'text-zinc-400'}`}>no credit card traps</span>
                        </td>
                        <td className={`py-3.5 text-center text-xs font-sans ${isDayMode ? 'text-slate-600' : 'text-[#8E9F9B]'}`}>
                          $150 – $400+/mo <span className="text-[9px] block font-mono text-red-500">heavy monthly binding</span>
                        </td>
                      </tr>
                      <tr>
                        <td className={`py-3.5 font-sans font-bold text-xs ${isDayMode ? 'text-slate-800' : 'text-zinc-200'}`}>Onboarding Setup</td>
                        <td className="py-3.5 text-center text-accent-dynamic font-bold">
                          Zero Friction <span className={`text-[9px] block font-normal font-mono ${isDayMode ? 'text-slate-500' : 'text-zinc-400'}`}>instant 30-day trial</span>
                        </td>
                        <td className={`py-3.5 text-center text-xs font-sans ${isDayMode ? 'text-slate-600' : 'text-[#8E9F9B]'}`}>
                          Steep Setups <span className="text-[9px] block font-mono text-red-500">weeks of manual custom setup</span>
                        </td>
                      </tr>
                      <tr>
                        <td className={`py-3.5 font-sans font-bold text-xs ${isDayMode ? 'text-slate-800' : 'text-zinc-200'}`}>Visual Photo Analysis</td>
                        <td className="py-3.5 text-center text-accent-dynamic font-bold text-xs">
                          Reasoning Auto <span className={`text-[8px] block font-normal font-mono ${isDayMode ? 'text-slate-500' : 'text-zinc-400'}`}>pricing / scope / auto-upsell</span>
                        </td>
                        <td className={`py-3.5 text-center text-red-500 text-xs font-bold font-mono`}>
                          Lacking <span className="text-[9px] block font-mono text-red-500">no automatic visual logic</span>
                        </td>
                      </tr>
                      <tr>
                        <td className={`py-3.5 font-sans font-bold text-xs ${isDayMode ? 'text-slate-800' : 'text-zinc-200'}`}>Lead Fees</td>
                        <td className="py-3.5 text-center text-accent-dynamic font-bold">
                          $0 Flat rate <span className={`text-[9px] block font-normal font-mono ${isDayMode ? 'text-slate-500' : 'text-zinc-400'}`}>100% margin holds</span>
                        </td>
                        <td className={`py-3.5 text-center text-xs font-sans ${isDayMode ? 'text-slate-600' : 'text-[#8E9F9B]'}`}>
                          Hefty Charges <span className="text-[9px] block font-mono text-red-500">charge per click or lead</span>
                        </td>
                      </tr>
                      <tr>
                        <td className={`py-3.5 font-sans font-bold text-xs ${isDayMode ? 'text-slate-800' : 'text-zinc-200'}`}>Data Typing Required</td>
                        <td className="py-3.5 text-center text-accent-dynamic font-bold">
                          None <span className={`text-[9px] block font-normal font-mono ${isDayMode ? 'text-slate-500' : 'text-zinc-400'}`}>automatic reports created</span>
                        </td>
                        <td className={`py-3.5 text-center text-xs font-sans ${isDayMode ? 'text-slate-600' : 'text-[#8E9F9B]'}`}>
                          Manual Entry <span className="text-[9px] block font-mono text-red-500">constant active mobile typing</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className={`mt-4 pt-4 border-t flex items-center justify-between text-[10px] font-mono ${isDayMode ? 'border-slate-200 text-slate-500' : 'border-zinc-800/40 text-[#8E9F9B]/60'}`}>
                  <span>Audit Speed: Under 60 seconds</span>
                  <span>Accuracy factor: 98.4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: About */}
          <section ref={sectionRefs.about} className={`max-w-7xl mx-auto px-6 py-16 border-t ${isDayMode ? 'border-slate-200' : 'border-zinc-800/40'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase text-accent-dynamic tracking-widest block font-bold">About Orby intelligence</span>
                <h3 className={`text-3xl font-serif italic ${isDayMode ? 'text-slate-900' : 'text-white'} leading-tight`}>Eliminating administrative drag for on-site services.</h3>
                <p className={`text-xs leading-relaxed font-sans ${modeTextMuted}`}>
                  Home services demand high precision. Legacy CRM systems trap technicians in endless form inputs, pricing lists, and manual calculations. Orby breaks this speed boundary by analyzing visual context elements and explaining them in a clear report.
                </p>
                <div className="space-y-2 pt-2 text-xs font-mono">
                  <div className={`flex items-center gap-2 ${isDayMode ? 'text-slate-800' : 'text-white'}`}>
                    <CheckCircle className="w-4 h-4 text-accent-dynamic shrink-0" />
                    <span>Dynamic cost modeling customized for 5 primary service trades</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isDayMode ? 'text-slate-800' : 'text-white'}`}>
                    <CheckCircle className="w-4 h-4 text-accent-dynamic shrink-0" />
                    <span>Instant proposal link generation with interactive mobile layouts</span>
                  </div>
                </div>
              </div>
              <div className={`p-8 border rounded-none relative transition-all duration-300 ${modeCardBg}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-5 rounded-full blur-2xl pointer-events-none" style={{ color: theme.primaryHex }}></div>
                <h4 className={`font-mono text-xs uppercase tracking-wider mb-4 border-b pb-2 ${isDayMode ? 'border-slate-200 text-slate-700' : 'border-zinc-800 text-zinc-400'}`}>Diagnostic Autopilot Spec</h4>
                <div className={`space-y-4 font-mono text-[11px] ${modeTextMuted}`}>
                  <div className="flex justify-between">
                    <span>AI Engine Model:</span>
                    <span className={`font-bold ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Gemini 2.5 Pro Proving Node</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Analysis Timeout:</span>
                    <span className={`font-bold ${isDayMode ? 'text-slate-900' : 'text-white'}`}>&lt; 1,800ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supported File Formats:</span>
                    <span className={`font-bold ${isDayMode ? 'text-slate-900' : 'text-white'}`}>JPG, PNG, WebP, SVG</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primary API Key integration:</span>
                    <span className="text-accent-dynamic font-bold">Secure Server Proxy</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* New Section: The 5 Universal Wounds Every Service Business Bleeds From—And How Orby Cures Them */}
          <section className={`max-w-7xl mx-auto px-6 py-16 border-t ${isDayMode ? 'border-slate-200 bg-slate-50/55' : 'border-zinc-800/40'}`}>
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
              <span className="text-[10px] font-mono uppercase text-accent-dynamic tracking-widest block font-bold">Diagnose and Cure Value Leaks</span>
              <h3 className={`text-2xl sm:text-3xl font-serif italic ${isDayMode ? 'text-slate-900' : 'text-white'} leading-tight`}>
                The 5 Universal Wounds Every Service Business Bleeds From—And How Orby Cures Them
              </h3>
              <p className={`text-xs font-sans leading-relaxed ${modeTextMuted}`}>
                Stop losing margin to hidden inefficiencies. Orby turns common structural leaks into immediate operations-level profit triggers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Wound 1 */}
              <div className={`p-6 border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:scale-[101%] ${modeCardBg}`}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between border-b pb-3 ${isDayMode ? 'border-slate-200' : 'border-zinc-800/40'}`}>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold">Wound 01</span>
                    <span className="text-xs">⚔</span>
                  </div>
                  <h4 className={`font-serif italic text-base leading-tight ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Curing Booking Chaos</h4>
                  <p className={`text-[11px] leading-relaxed font-sans ${modeTextMuted}`}>
                    Unified workspace console logs and tracks estimates cleanly vs. bleeding energy to scattered notepad scribbles, texts, and infinite back-and-forth phone tag.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-zinc-800/20 font-mono text-[9.5px] text-accent-dynamic font-bold uppercase tracking-wider">
                  ☉ Cure: One-Screen HUD
                </div>
              </div>

              {/* Wound 2 */}
              <div className={`p-6 border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:scale-[101%] ${modeCardBg}`}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between border-b pb-3 ${isDayMode ? 'border-slate-200' : 'border-zinc-800/40'}`}>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold">Wound 02</span>
                    <span className="text-xs">⌛</span>
                  </div>
                  <h4 className={`font-serif italic text-base leading-tight ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Curing Quote Waste</h4>
                  <p className={`text-[11px] leading-relaxed font-sans ${modeTextMuted}`}>
                    Instant automated visual description photo quoting right from the truck vs. driving hours wasting gas, time, and tires just to deliver baseline price estimates.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-zinc-800/20 font-mono text-[9.5px] text-accent-dynamic font-bold uppercase tracking-wider">
                  ☉ Cure: Instant Audit
                </div>
              </div>

              {/* Wound 3 */}
              <div className={`p-6 border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:scale-[101%] ${modeCardBg}`}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between border-b pb-3 ${isDayMode ? 'border-slate-200' : 'border-zinc-800/40'}`}>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold">Wound 03</span>
                    <span className="text-xs">⭐</span>
                  </div>
                  <h4 className={`font-serif italic text-base leading-tight ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Curing Forgotten Reviews</h4>
                  <p className={`text-[11px] leading-relaxed font-sans ${modeTextMuted}`}>
                    Automated post-job check-ins and follow-ups requesting Google/social reviews vs. leaving the driveway and reviews getting lost forever.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-zinc-800/20 font-mono text-[9.5px] text-accent-dynamic font-bold uppercase tracking-wider">
                  ☉ Cure: Google Reviews
                </div>
              </div>

              {/* Wound 4 */}
              <div className={`p-6 border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:scale-[101%] ${modeCardBg}`}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between border-b pb-3 ${isDayMode ? 'border-slate-200' : 'border-zinc-800/40'}`}>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold">Wound 04</span>
                    <span className="text-xs">🔄</span>
                  </div>
                  <h4 className={`font-serif italic text-base leading-tight ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Curing Dead Repeat Business</h4>
                  <p className={`text-[11px] leading-relaxed font-sans ${modeTextMuted}`}>
                    Intelligent automated follow-up sequences to retain clients and schedule seasonal work vs. hoping they remember your company name when they next require servicing.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-zinc-800/20 font-mono text-[9.5px] text-accent-dynamic font-bold uppercase tracking-wider">
                  ☉ Cure: Repeat Loops
                </div>
              </div>

              {/* Wound 5 */}
              <div className={`p-6 border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:scale-[101%] ${modeCardBg}`}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between border-b pb-3 ${isDayMode ? 'border-slate-200' : 'border-zinc-800/40'}`}>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold">Wound 05</span>
                    <span className="text-xs">📉</span>
                  </div>
                  <h4 className={`font-serif italic text-base leading-tight ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Curing Lowball Offers</h4>
                  <p className={`text-[11px] leading-relaxed font-sans ${modeTextMuted}`}>
                    High-tech authority presence presenting corporate-grade diagnostic evidence logs justifying proper, robust premium rates vs. bowing to client discounts.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-zinc-800/20 font-mono text-[9.5px] text-accent-dynamic font-bold uppercase tracking-wider">
                  ☉ Cure: Authority Validation
                </div>
              </div>
            </div>
          </section>

          {/* Section: How To Use */}
          <section ref={sectionRefs.howToUse} className="max-w-7xl mx-auto px-6 py-16 border-t border-zinc-800/40 text-center space-y-12">
            <div className="space-y-3 max-w-xl mx-auto">
              <span className="text-[10px] font-mono uppercase text-accent-dynamic tracking-widest block font-bold">Simple Integration Flow</span>
              <h3 className="text-3xl font-serif italic text-white mt-1">Autonomous in Three Steps</h3>
              <p className="text-xs text-[#8E9F9B] leading-relaxed font-sans">
                A streamlined pipeline created to minimize time spent on estimates, allowing you to secure bookings right from the driveway.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-black/40 border border-zinc-800 rounded-none space-y-4 text-left">
                <div className="w-10 h-10 rounded bg-[#061512] font-mono text-accent-dynamic text-lg font-bold flex items-center justify-center border border-accent-dynamic/25">1</div>
                <h4 className="font-serif italic text-lg text-white">Upload Site Evidence</h4>
                <p className="text-xs text-[#8E9F9B] font-sans leading-relaxed">
                  Snap an on-site photo of the task area or submit unstructured notes list describing room wear, stains, scale, or material damages.
                </p>
              </div>

              <div className="p-8 bg-black/40 border border-zinc-800 rounded-none space-y-4 text-left">
                <div className="w-10 h-10 rounded bg-[#061512] font-mono text-accent-dynamic text-lg font-bold flex items-center justify-center border border-accent-dynamic/25">2</div>
                <h4 className="font-serif italic text-lg text-white">Autopilot Assessment</h4>
                <p className="text-xs text-[#8E9F9B] font-sans leading-relaxed">
                  The system scans job size, maps trade-specific presets, evaluates local multipliers, and suggests profitable upsells instantly.
                </p>
              </div>

              <div className="p-8 bg-black/40 border border-zinc-800 rounded-none space-y-4 text-left">
                <div className="w-10 h-10 rounded bg-[#061512] font-mono text-accent-dynamic text-lg font-bold flex items-center justify-center border border-accent-dynamic/25">3</div>
                <h4 className="font-serif italic text-lg text-white">Sync proposal Proposal</h4>
                <p className="text-xs text-[#8E9F9B] font-sans leading-relaxed">
                  Review calculated outcomes on our slider timeline, add custom fees, and export cleanly formatted pricing web portals to your client.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Gaps Filled */}
          <section ref={sectionRefs.gapsFilled} className="max-w-7xl mx-auto px-6 py-16 border-t border-zinc-800/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="p-6 bg-black/40 border border-zinc-800 rounded-none space-y-4 font-mono text-xs text-[#8E9F9B]">
                <span className="text-accent-dynamic tracking-widest font-extrabold uppercase text-[10px] block">CRITICAL EFFICIENCY MATRIX</span>
                <div className="space-y-3">
                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-200">
                    <span className="font-bold text-red-400 block uppercase tracking-wider text-[9px] mb-1">Manual Quote Gaps (Traditional)</span>
                    <p className="text-xs font-sans leading-relaxed">Estimates generated manually average 2-4 hours to deliver. 68% of contractors fail to identify key upsell opportunities (specialized treatment, moss protection, custom buffers).</p>
                  </div>
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-200">
                    <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[9px] mb-1">AI-Powered Extraction (Orby OS)</span>
                    <p className="text-xs font-sans leading-relaxed">Quotes delivered in under 60 seconds with up to 92% confidence indicators. Recommends up to 3 context-aware high-margin service upsells automatically.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase text-accent-dynamic tracking-widest block font-bold">The Administrative drag solution</span>
                <h3 className="text-3xl font-serif italic text-white leading-tight">Plugging leakages in your booking pipeline.</h3>
                <p className="text-xs text-[#8E9F9B] leading-relaxed font-sans">
                  Slow quote generation leads to cold leads. Over-complicated spreadsheets lead to manual calculation errors. Orby unifies unstructured notes, images, local overhead costs, and profitability considerations into a fast and clean checkout interface.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Market Shift */}
          <section ref={sectionRefs.marketShift} className="max-w-7xl mx-auto px-6 py-16 border-t border-zinc-800/40 text-center space-y-6">
            <div className="space-y-3 max-w-2xl mx-auto">
              <span className="text-[10px] font-mono uppercase text-accent-dynamic tracking-widest block font-bold">The Vision AI Disruptive Wave</span>
              <h3 className="text-3xl font-serif italic text-white">How On-Site Contractors Are Shifting</h3>
              <p className="text-xs text-[#8E9F9B] leading-relaxed font-sans">
                Traditional dispatch portals serve as boring calendars. Orby shifts this paradigm by operating as a fully autonomous workspace engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              <div className="p-6 bg-black/40 border border-zinc-800/50 space-y-3">
                <h4 className="font-serif italic text-lg text-white flex items-center gap-2">
                  <span className="text-accent-dynamic font-mono font-black">☉</span> Shift 1: Instant Client Presentation
                </h4>
                <p className="text-xs text-[#8E9F9B] font-sans leading-relaxed">
                  Instead of texting cold estimates later in the evening, technicians compile custom proposals directly on the driveway, leading to an immediate boost in conversions.
                </p>
              </div>

              <div className="p-6 bg-black/40 border border-zinc-800/50 space-y-3">
                <h4 className="font-serif italic text-lg text-white flex items-center gap-2">
                  <span className="text-accent-dynamic font-mono font-black">☉</span> Shift 2: Visual Spot Justifications
                </h4>
                <p className="text-xs text-[#8E9F9B] font-sans leading-relaxed">
                  When Orby scans a soil spot or damage item, it highlights clear context-aware upsell justifications. Customers approve suggestions because they see immediate, mathematically backed proof.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Pricing plans */}
          <section ref={sectionRefs.pricing} className="max-w-7xl mx-auto px-6 py-16 border-t border-zinc-800/40 text-center space-y-12">
            <div className="space-y-3 max-w-xl mx-auto">
              <span className="text-[10px] font-mono uppercase text-accent-dynamic tracking-widest block font-bold">Transparent Baselines</span>
              <h3 className="text-3xl font-serif italic text-white">A Plan For Every Team Scale</h3>
              <p className="text-xs text-[#8E9F9B] leading-relaxed font-sans">
                Access advanced computer vision diagnostics with absolute pricing transparency. Upgrade or pause anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {pricingPlans.map((plan, idx) => (
                <div 
                  key={idx}
                  className={`p-8 bg-[#061512]/60 border rounded-none flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                    plan.glow 
                      ? "border-accent-dynamic shadow-[0_0_20px_rgba(74,222,128,0.05)] scale-102" 
                      : "border-zinc-800/80 hover:border-accent-dynamic/50"
                  }`}
                >
                  {plan.glow && (
                    <div 
                      className="absolute top-0 right-0 text-[8px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 bg-accent-dynamic text-black"
                      style={{ backgroundColor: theme.primaryHex }}
                    >
                      POPULAR CHOICE
                    </div>
                  )}

                  <div className="space-y-4">
                    <span className="text-xs font-mono uppercase text-white tracking-widest font-extrabold block">{plan.name}</span>
                    <div className="flex items-baseline gap-1 border-b border-zinc-800 pb-4">
                      <span className="text-4xl font-serif italic font-bold text-white">{plan.price}</span>
                      <span className="text-xs font-mono text-[#8E9F9B]">{plan.period}</span>
                    </div>
                    <p className="text-xs text-[#8E9F9B]/90 font-sans leading-relaxed">{plan.desc}</p>
                    
                    <ul className="space-y-2.5 pt-4 text-xs font-mono text-[#8E9F9B]">
                      {plan.features.map((feat, fidx) => (
                        <li key={fidx} className="flex items-center gap-2">
                          <Check className="w-4.5 h-4.5 text-accent-dynamic shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={handleStartOnboarding}
                    className={`w-full py-3.5 text-xs font-mono font-bold uppercase tracking-widest transition rounded-none mt-8 text-center cursor-pointer border ${
                      plan.glow 
                        ? theme.glowBtn
                        : `border-accent-dynamic/40 text-accent-dynamic bg-black/40 hover:bg-[#061512]`
                    }`}
                  >
                    Select Plan Choice
                  </button>
                </div>
              ))}
            </div>
          </section>

          
        </div>
      )}

      {/* RENDER VIEW 2: MULTI-THEME CONTRACTOR ONBOARDING PORTAL */}
      {viewState === "onboarding" && (
        <div className="max-w-xl mx-auto px-6 pt-14 pb-20 relative min-h-[85vh] flex flex-col justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-current opacity-5 rounded-full blur-[100px] pointer-events-none" style={{ color: theme.primaryHex }}></div>
          
          <div className="bg-[#061512]/90 border border-zinc-800 p-8 space-y-6 shadow-2xl relative backdrop-blur-md">
            {/* Onboarding steps indicator */}
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-800 pb-3">
              <span className="text-zinc-500 uppercase font-bold">CONTRACTOR REGISTRATION GATEWAY</span>
              <span className="text-accent-dynamic font-extrabold uppercase tracking-wide">Step {onboardingStep} of 2</span>
            </div>

            {onboardingStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-serif italic text-2xl text-white">Identify Your Service Profile</h3>
                  <p className="text-xs text-[#8E9F9B] font-sans leading-relaxed">
                    Set up your business identifiers. Orby uses these baseline details to adjust automated line pre-populations.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-bold text-[#8E9F9B] tracking-wider block">Company Business Name</label>
                    <input 
                      id="onboard-business-input"
                      type="text"
                      placeholder="e.g. Apex Deep Cleaners, Austin Detailing"
                      value={onboardedBusinessName}
                      onChange={(e) => setOnboardedBusinessName(e.target.value)}
                      className="w-full text-xs text-white py-2.5 px-3 bg-black border border-zinc-800 rounded-none focus:outline-none focus:border-accent-dynamic"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-bold text-[#8E9F9B] tracking-wider block">Primary Trade Segment</label>
                    <select 
                      id="onboard-trade-select"
                      value={onboardedTrade}
                      onChange={(e) => setOnboardedTrade(e.target.value)}
                      className="w-full text-xs text-white py-2.5 px-3 bg-black border border-zinc-800 rounded-none focus:outline-none focus:border-accent-dynamic cursor-pointer font-sans"
                    >
                      <option value="Carpet Cleaning">Carpet Cleaning</option>
                      <option value="House Cleaning">House Cleaning</option>
                      <option value="Roofing">Roofing & Gutter Audit</option>
                      <option value="Auto Detailing">Auto Detailing</option>
                      <option value="Lawn & Landscaping">Lawn & Landscaping</option>
                      <option value="Custom">Custom Trade Baseline</option>
                    </select>
                  </div>

                  {onboardedTrade === "Custom" && (
                    <div className="space-y-1.5 animate-in slide-in-from-top duration-150">
                      <label className="text-[10px] uppercase font-mono font-bold text-[#8E9F9B] tracking-wider block">Enter Custom Trade Name</label>
                      <input 
                        id="onboard-custom-trade"
                        type="text"
                        placeholder="e.g. Gutter Repair, Handyman"
                        value={customTrade}
                        onChange={(e) => setCustomTrade(e.target.value)}
                        className="w-full text-xs text-white py-2.5 px-3 bg-black border border-zinc-800 rounded-none focus:outline-none focus:border-accent-dynamic"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setViewState("landing")}
                    className="flex-1 py-3 text-xs font-mono font-bold text-[#8E9F9B]/70 border border-zinc-800 bg-black hover:bg-neutral-900 transition"
                  >
                    Back to Home
                  </button>
                  <button 
                    id="onboard-next-btn"
                    onClick={() => {
                      if (!onboardedBusinessName) {
                        alert("Please provide your Company Business Name to unlock telemetry.");
                        return;
                      }
                      setOnboardingStep(2);
                    }}
                    className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition rounded-none cursor-pointer ${theme.glowBtn}`}
                  >
                    Continue Profile Setup
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-serif italic text-2xl text-white">Select Portal Workspace Theme</h3>
                  <p className="text-xs text-[#8E9F9B] font-sans leading-relaxed">
                    Pick a premium visual identity. Your selection immediately changes accent borders, status trackers, and checkout proposals.
                  </p>
                </div>

                {/* Grid of Theme options */}
                <div className="grid grid-cols-2 gap-3.5">
                  {Object.values(APP_THEMES).map((thm) => {
                    const isSelected = selectedThemeKey === thm.id;
                    return (
                      <button
                        key={thm.id}
                        id={`theme-select-${thm.id}`}
                        onClick={() => setSelectedThemeKey(thm.id as any)}
                        className={`p-4 text-left border cursor-pointer select-none transition-all duration-200 bg-black/40 ${
                          isSelected 
                            ? "border-white bg-[#061512]" 
                            : "border-zinc-800 hover:border-zinc-700 hover:bg-[#061512]/50"
                        }`}
                        style={isSelected ? { boxShadow: `0 0 15px ${thm.primaryHex}15` } : {}}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: thm.primaryHex }}></span>
                          <span className="text-xs font-mono font-extrabold text-white">{thm.name}</span>
                        </div>
                        <p className="text-[9px] text-[#8E9F9B] font-mono leading-tight">Accent: {thm.primaryHex}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Visual Identity & Business Metadata Fields */}
                <div className="space-y-4 pt-4 border-t border-zinc-800/40">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-accent-dynamic font-extrabold block">BUSINESS DISPATCH DETAILS (CLOUD BACKEND)</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-[#8E9F9B] tracking-wider block">WhatsApp Contact</label>
                      <input 
                        id="onboard-whatsapp"
                        type="text"
                        placeholder="e.g. +1 512 555 1234"
                        value={onboardedWhatsApp}
                        onChange={(e) => setOnboardedWhatsApp(e.target.value)}
                        className="w-full text-xs text-white py-2 px-3 bg-black border border-zinc-800 rounded-none focus:outline-none focus:border-accent-dynamic"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-[#8E9F9B] tracking-wider block">Company Website</label>
                      <input 
                        id="onboard-website"
                        type="text"
                        placeholder="e.g. apexcleaners.com"
                        value={onboardedWebsite}
                        onChange={(e) => setOnboardedWebsite(e.target.value)}
                        className="w-full text-xs text-white py-2 px-3 bg-black border border-zinc-800 rounded-none focus:outline-none focus:border-accent-dynamic"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-[#8E9F9B] tracking-wider block">City</label>
                      <input 
                        id="onboard-city"
                        type="text"
                        placeholder="e.g. Austin"
                        value={onboardedCity}
                        onChange={(e) => setOnboardedCity(e.target.value)}
                        className="w-full text-xs text-white py-2 px-3 bg-black border border-zinc-800 rounded-none focus:outline-none focus:border-accent-dynamic"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-[#8E9F9B] tracking-wider block">State</label>
                      <input 
                        id="onboard-state"
                        type="text"
                        placeholder="e.g. TX"
                        value={onboardedState}
                        onChange={(e) => setOnboardedState(e.target.value)}
                        className="w-full text-xs text-white py-2 px-3 bg-black border border-zinc-800 rounded-none focus:outline-none focus:border-accent-dynamic"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-[#8E9F9B] tracking-wider block">Zip Code</label>
                      <input 
                        id="onboard-zip"
                        type="text"
                        placeholder="e.g. 78701"
                        value={onboardedZip}
                        onChange={(e) => setOnboardedZip(e.target.value)}
                        className="w-full text-xs text-white py-2 px-3 bg-black border border-zinc-800 rounded-none focus:outline-none focus:border-accent-dynamic"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-black text-[#8E9F9B] font-mono text-[9px] uppercase tracking-wider leading-relaxed border border-zinc-800">
                  <span className="text-white font-black block mb-0.5">☉ ACTIVE THEME SYNC ENGINE APPLICATION</span>
                  Visual indicators and PDF invoice layout matrices will render using the {APP_THEMES[selectedThemeKey].name} palette.
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setOnboardingStep(1)}
                    className="flex-1 py-3 text-xs font-mono font-bold text-[#8E9F9B]/70 border border-zinc-800 bg-black hover:bg-neutral-900 transition"
                  >
                    Previous Step
                  </button>
                  <button 
                    id="onboard-finish-btn"
                    onClick={handleCompleteOnboarding}
                    className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition rounded-none cursor-pointer ${theme.glowBtn}`}
                  >
                    Finish Registry Sync
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER VIEW 3: THE COMPANION ARCHITECTURE WORKSPACE DASHBOARD */}
      {viewState === "dashboard" && (
        <div className="aurora-radial">
          {/* Dashboard Header Bar */}
          <header className={`sticky top-0 z-40 transition-all duration-300 ${modeHeaderBg}`}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div 
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xl font-bold transition-all duration-500 ${isDayMode ? 'border-emerald-600/35 bg-white' : 'bg-black/40'}`}
                  style={{ borderColor: !isDayMode ? `${theme.primaryHex}50` : undefined, color: theme.primaryHex, boxShadow: `0 0 10px ${theme.primaryHex}20` }}
                >
                  ☉
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`font-serif italic font-black text-2xl tracking-tight ${isDayMode ? 'text-slate-900' : 'text-white'}`}>Orby</h1>
                    <span 
                      className={`text-[9px] font-mono font-bold border uppercase tracking-widest px-2 py-0.5 rounded-none transition-colors ${isDayMode ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-black/40'}`}
                      style={!isDayMode ? { color: theme.primaryHex, borderColor: `${theme.primaryHex}45` } : {}}
                    >
                      {theme.name} ID
                    </span>
                  </div>
                  <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDayMode ? 'text-slate-600' : 'text-[#8E9F9B]'}`}>
                    Visual Workspace Log: <span className={isDayMode ? 'text-slate-900 font-extrabold' : 'text-white'}>{onboardedBusinessName || "Apex Pro Services"}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3.5">
                {/* Diagnostics Online display badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 border text-[9px] font-mono uppercase ${isDayMode ? 'bg-white border-slate-200 text-slate-600' : 'bg-black/40 ' + theme.borderLight + ' text-[#8E9F9B]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-dynamic animate-pulse" style={{ backgroundColor: theme.primaryHex }}></span>
                  <span className={`font-extrabold tracking-wider ${isDayMode ? 'text-emerald-800' : 'text-white'}`}>DIAGNOSTICS ONLINE</span>
                </div>

                {/* Day/Night Toggle Switch */}
                <button
                  onClick={toggleDayMode}
                  className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    isDayMode 
                      ? "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800" 
                      : "border-zinc-800 bg-black/50 hover:bg-neutral-900 text-yellow-400 hover:text-yellow-300"
                  }`}
                  title={isDayMode ? "Switch to Night Mode (Aurora)" : "Switch to Day Mode (Sunlight)"}
                  style={!isDayMode ? { borderColor: `${theme.primaryHex}35` } : {}}
                >
                  {isDayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                
                <button 
                  id="reset-workspace-btn"
                  onClick={handleResetWorkspace}
                  className={`px-4 py-1.5 bg-transparent hover:bg-opacity-10 border text-[9.5px] font-mono font-bold uppercase tracking-widest transition cursor-pointer ${isDayMode ? 'border-emerald-600 hover:bg-emerald-50' : ''}`}
                  style={{ color: isDayMode ? '#059669' : theme.primaryHex, borderColor: isDayMode ? '#059669' : theme.primaryHex }}
                >
                  RESET SPACE
                </button>
                
                <button 
                  onClick={() => setViewState("landing")}
                  className={`px-3.5 py-1.5 text-[9.5px] border font-mono font-bold uppercase tracking-wider transition ${isDayMode ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' : 'bg-black text-[#8E9F9B] border-zinc-800 hover:text-white hover:bg-zinc-900'}`}
                >
                  Log Out
                </button>
              </div>
            </div>
          </header>

          {/* Main workspace container */}
          <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            
            {/* Quick dashboard profile overview HUD */}
            <div className="p-6 bg-[#061512]/50 border border-zinc-800 backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-2 rounded-full blur-2xl pointer-events-none" style={{ color: theme.primaryHex }}></div>
              <div>
                <span className="text-[9px] font-mono uppercase text-accent-dynamic tracking-widest font-extrabold block">ACTIVE WORKSPACE HUD</span>
                <p className="text-base text-zinc-300 font-serif italic mt-1 leading-normal">
                  Logged under <span className="text-white font-extrabold">{onboardedBusinessName || "Apex Home Services"}</span> / Segment: <span className="text-accent-dynamic font-extrabold">{userTradePreference || onboardedTrade}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Change Palette Presets:</span>
                <div className="flex items-center gap-1.5 bg-black/60 p-1 border border-zinc-800">
                  {Object.keys(APP_THEMES).map((thmKey) => (
                    <button
                      key={thmKey}
                      onClick={() => setSelectedThemeKey(thmKey as any)}
                      className="w-3.5 h-3.5 rounded-full transition hover:scale-110"
                      style={{ 
                        backgroundColor: APP_THEMES[thmKey].primaryHex,
                        border: selectedThemeKey === thmKey ? '1.5px solid white' : 'none'
                      }}
                      title={APP_THEMES[thmKey].name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* System Hybrid Toggle [System Mode Control] */}
            <div className={`bg-[#061512]/60 border ${theme.borderLight} p-5.5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${systemMode === "AI" ? theme.badgeBg : "bg-zinc-800"} ${theme.accentText}`}>
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    [System Mode Control]
                    <span className="text-[8px] px-1.5 py-0.5 bg-black/50 border border-accent-dynamic/20 rounded text-accent-dynamic">[Autopilot Active]</span>
                  </h3>
                  <p className="text-[11px] text-[#8E9F9B] mt-1 font-sans">
                    {systemMode === "AI" 
                      ? "AI Bot Mode Active: Gemini autopilot automatically drafts lines, checks conditions, recommendations and syncs notification alerts."
                      : "Manual Control Mode: Functions as standard local client CRM. Holds and logs leads privately without texting clients."}
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-black/60 p-1.5 border border-zinc-800/80 rounded-xl shrink-0">
                <button
                  onClick={() => setSystemMode("Manual")}
                  className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider transition ${
                    systemMode === "Manual" 
                      ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                      : "text-[#8E9F9B] hover:text-[#FFFFFF]"
                  }`}
                >
                  Manual Mode
                </button>
                <button
                  onClick={() => setSystemMode("AI")}
                  className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider transition ml-1 ${
                    systemMode === "AI" 
                      ? theme.badgeBg + " text-accent-dynamic border border-accent-dynamic/30 shadow-[0_0_10px_rgba(74,222,128,0.1)]"
                      : "text-[#8E9F9B] hover:text-[#FFFFFF]"
                  }`}
                >
                  AI Autopilot (Gemini)
                </button>
              </div>
            </div>

            {/* Diagnostic Split Layout structures */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (Input Workspace): ColumnSpan 5 */}
              <div className="lg:col-span-5 space-y-8">
                <div className={`bg-[#061512] border ${theme.borderLight} p-8 space-y-6 shadow-2xl relative`}>
                  
                  <div className={`flex items-center gap-2.5 border-b ${theme.borderLight} pb-3.5`}>
                    <Layers className={`w-4.5 h-4.5 ${theme.accentText}`} />
                    <h2 className="font-serif italic text-xl text-white">Job Evidence Capture</h2>
                  </div>

                  {/* Instant Preset Selector */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase font-mono font-bold text-[#8E9F9B] block tracking-[0.15em]">Try Dynamic Trade Templates</span>
                    <div className="grid grid-cols-2 gap-2">
                      {SampleJobsList.map((preset) => (
                        <button
                          id={`preset-btn-${preset.id}`}
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset.id)}
                          className={`p-3 text-left bg-black/40 hover:bg-opacity-80 border border-zinc-800/60 hover:border-accent-dynamic transition text-xs flex items-start gap-2 focus:outline-none cursor-pointer group`}
                        >
                          <span className="shrink-0 text-lg group-hover:scale-110 transition">{preset.avatarIcon}</span>
                          <div className="min-w-0">
                            <span className="font-sans font-bold text-white block truncate leading-tight">{preset.title.split(' ')[0]} {preset.title.split(' ')[1] || ""}</span>
                            <span className={`text-[8px] ${theme.accentText} font-mono uppercase tracking-wider block mt-0.5`}>{preset.trade.split(' ')[0]}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`border-t ${theme.borderLight} my-4`}></div>

                  {/* Trade Preference Baselines select */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono font-bold text-[#8E9F9B] tracking-[0.15em] block">Trade Baseline Override</label>
                    <select 
                      id="trade-preference-select"
                      value={userTradePreference}
                      onChange={(e) => setUserTradePreference(e.target.value)}
                      className="w-full text-xs text-white py-2.5 px-3 bg-black/60 border border-zinc-800 focus:border-accent-dynamic focus:outline-none cursor-pointer font-sans"
                    >
                      <option value="">Auto-Detect Trade (Recommended)</option>
                      <option value="Carpet Cleaning">Carpet Cleaning Basel</option>
                      <option value="House Cleaning">House Cleaning Basel</option>
                      <option value="Roofing">Roofing Basel</option>
                      <option value="Auto Detailing">Auto Detailing Basel</option>
                      <option value="Lawn & Landscaping">Lawn & Landscaping Basel</option>
                    </select>
                  </div>

                  {/* Text Description capture */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono font-bold text-[#8E9F9B] tracking-[0.15em] block">Explain Site Inspection</label>
                    <textarea
                      id="unstructured-desc-textarea"
                      rows={4}
                      placeholder="e.g. Medium pile synthetic carpet, dog odor, traffic stains... Or tap a pro template card above."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-xs py-3 px-3 bg-black/60 border border-zinc-800 focus:outline-none focus:border-accent-dynamic font-sans text-white placeholder-[#8E9F9B]/60 transition resize-none leading-relaxed"
                    />
                  </div>

                  {/* Camera drop image card */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono font-bold text-[#8E9F9B] tracking-[0.15em] block">Client Jobsite Photo File</label>
                    
                    <div 
                      id="image-drop-zone"
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border border-dashed p-6 text-center transition relative overflow-hidden flex flex-col items-center justify-center cursor-pointer rounded-xl ${
                        dragActive 
                          ? `border-[#6366F1] bg-opacity-20` 
                          : selectedImage 
                            ? "border-zinc-700 bg-black/40" 
                            : `border-[#222B3E] bg-[#161C2A] hover:bg-[#1E1B4B]/10`
                      }`}
                      style={dragActive ? { borderColor: theme.primaryHex, backgroundColor: `${theme.primaryHex}10` } : {}}
                    >
                      {selectedImage ? (
                        <div className="space-y-3.5 w-full">
                          <div className="max-h-48 overflow-hidden border border-zinc-800 flex items-center justify-center bg-black/40 relative rounded-xl">
                            {selectedImage.startsWith("data:image/svg+xml") ? (
                              <div 
                                className="w-full h-44 flex items-center justify-center p-2 bg-[#0B0F19]/60 rounded-xl" 
                                dangerouslySetInnerHTML={{ __html: decodeURIComponent(selectedImage.replace("data:image/svg+xml;utf8,", "")) }} 
                              />
                            ) : (
                              <img 
                                src={selectedImage} 
                                alt="Uploaded client site preview" 
                                className="w-full h-auto object-cover max-h-48"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          <div className="flex items-center justify-center">
                            <button 
                              id="clear-image-btn"
                              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                              className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-400 px-3 py-1.5 border border-red-500/30 bg-black/60 hover:bg-red-950/40 transition focus:outline-none cursor-pointer"
                            >
                              Remove Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer w-full flex flex-col items-center justify-center">
                          <input 
                            id="image-file-input"
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                          />
                          <Camera className="w-8 h-8 text-zinc-400 mb-2.5 opacity-80" style={{ color: theme.primaryHex }} />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white block">Attach Job site Photo</span>
                          <span className="text-[9px] text-[#8E9F9B] block mt-1 font-sans">Drag & drop or click to upload file</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Compile buttons */}
                  <button
                    id="analyze-job-btn"
                    onClick={handleAnalyzeJob}
                    disabled={isLoading || (!description && !selectedImage)}
                    className={`w-full py-4 font-mono font-bold uppercase tracking-widest text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                      isLoading 
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700" 
                        : theme.glowBtn
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M 4,12 A 8,8 0 0,1 12,4 V 0 A 12,12 0 0,0 0,12 H 4 Z"></path>
                        </svg>
                        <span>Executing Visual Audit...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Compile AI Cost Estimate</span>
                      </>
                    )}
                  </button>

                  {errorMsg && (
                    <div id="error-alert" className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-medium leading-relaxed font-mono">
                      System Error: {errorMsg}
                    </div>
                  )}
                </div>

                {/* History collection list logs */}
                <SavedCollection 
                  estimates={savedEstimates} 
                  onSelect={handleLoadSavedEstimate}
                  onDelete={handleDeleteEstimate}
                  onClearAll={handleClearAllHistory}
                  theme={theme}
                />
              </div>

              {/* Right Column (Invoice calculations): ColumnSpan 7 */}
              <div className="lg:col-span-7 space-y-8">
                {activeEstimate ? (
                  <div className="space-y-8">
                    {/* Visual appraisal results view */}
                    <EstimateView 
                      result={activeEstimate}
                      selectedUpsellItems={selectedUpsellItems}
                      onToggleUpsell={handleToggleUpsellItem}
                      isLoading={isLoading}
                      theme={theme}
                    />

                    {/* Proposal / Invoice builder */}
                    <InvoiceBuilder 
                      baseResult={activeEstimate}
                      selectedUpsellItems={selectedUpsellItems}
                      onSave={handleSaveEstimateDraft}
                      savedItemToLoad={activeSavedToLoad}
                      theme={theme}
                      onboardedBusinessName={onboardedBusinessName}
                    />
                  </div>
                ) : (
                  /* Welcoming empty workplace card with active theme ambiance */
                  <div className="bg-[#061512] border border-zinc-800 p-12 text-center flex flex-col items-center justify-center min-h-[520px] select-none relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient from-current opacity-2 pointer-events-none" style={{ color: theme.primaryHex }}></div>
                    <div 
                      className="w-16 h-16 bg-black/40 border flex items-center justify-center font-serif italic text-3xl mb-6 rounded-none"
                      style={{ color: theme.primaryHex, borderColor: `${theme.primaryHex}40` }}
                    >
                      ☉
                    </div>
                    <h3 className="font-serif italic text-2xl text-white">Estimate Space Unoccupied</h3>
                    <p className="text-xs text-[#8E9F9B] max-w-sm mt-2 mb-8 leading-relaxed font-sans">
                      Select an interactive contractor preset template on the left, explain observation notes, or upload your inspection file. Orby will assess costs immediately.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md text-left text-xs text-[#8E9F9B]">
                      <div className="p-5 bg-black/40 border border-zinc-800/80 hover:border-zinc-700 transition">
                        <span className={`font-mono font-bold text-white block uppercase tracking-wider text-[9px] mb-1.5 ${theme.accentText}`}>☉ 1. Contractor Presets</span>
                        Fast-track visual test scenarios by selecting any of our 5 predefined models in the left side capture panel.
                      </div>
                      <div className="p-5 bg-black/40 border border-zinc-800/80 hover:border-zinc-700 transition">
                        <span className={`font-mono font-bold text-white block uppercase tracking-wider text-[9px] mb-1.5 ${theme.accentText}`}>☉ 2. Clean PDF Proposals</span>
                        Fine-tune modifiers, add custom ad-hoc line items, overlay profit percentages, and print responsive PDF copies.
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </main>
        </div>
      )}

      {/* Floating 24/7 WhatsApp badge in bottom corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/923217452433"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-3 bg-neutral-950 text-white border-2 hover:shadow-lg rounded-full font-mono text-xs uppercase tracking-wider font-extrabold transition group hover:scale-105"
          style={{ borderColor: theme.primaryHex, boxShadow: `0 0 20px ${theme.primaryHex}40` }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-accent-dynamic animate-ping shrink-0" style={{ backgroundColor: theme.primaryHex }}></span>
          <span>SUPPORT 24/7</span>
        </a>
      </div>

      {/* Shared Footer with hidden Master Backdoor gateway */}
      <footer className="mt-16 pt-8 pb-12 border-t border-zinc-800/60 bg-black/20 text-center text-xs text-[#8E9F9B] space-y-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono tracking-wider text-[#8E9F9B]/70 uppercase">
            ORBY ENGINE COMPANION V2.4 © 2026 // EMPOWERING DECENTRALIZED HOME SERVICE AUDITS
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBackdoorOpen(!isBackdoorOpen)}
              className="text-xs font-mono font-bold text-[#8E9F9B]/40 hover:text-white tracking-widest cursor-pointer px-2 py-1 bg-black/45 border border-zinc-800"
              title="Acknowledge System Matrix Interface"
            >
              &lt;/&gt;
            </button>
            <a
              href="https://wa.me/923217452433"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-neutral-950 text-white border hover:shadow-lg rounded-full font-mono text-[9.5px] uppercase tracking-wider font-extrabold transition group hover:scale-105"
              style={{ borderColor: theme.primaryHex, boxShadow: `0 0 10px ${theme.primaryHex}30` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-dynamic animate-ping shrink-0" style={{ backgroundColor: theme.primaryHex }}></span>
              <span>SUPPORT 24/7</span>
            </a>
          </div>
        </div>

        {/* Secret passcode backdoor matrix */}
        {isBackdoorOpen && (
          <div className="max-w-md mx-auto p-6 bg-[#061512] border-2 shadow-2xl text-left space-y-4 animate-in fade-in zoom-in-95 duration-200" style={{ borderColor: theme.primaryHex }}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-mono font-bold uppercase tracking-widest text-white flex items-center gap-1.5" style={{ color: theme.primaryHex }}>
                <Shield className="w-4 h-4 animate-spin" /> System Backdoor Matrix
              </span>
              <button 
                onClick={() => { setIsBackdoorOpen(false); setIsBackdoorUnlocked(false); }}
                className="text-white hover:text-red-400 font-bold"
              >
                ✕
              </button>
            </div>

            {!isBackdoorUnlocked ? (
              <form onSubmit={handleVerifyBackdoorCode} className="space-y-3">
                <p className="text-[11px] text-[#8E9F9B]">Enter master authorization security passcode to view active loops and telemetry stats.</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Master Passcode"
                    value={backdoorPasscode}
                    onChange={(e) => setBackdoorPasscode(e.target.value)}
                    className="flex-1 py-1.5 px-3 bg-black text-white font-mono text-xs border border-zinc-800 focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent-dynamic text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-opacity-80"
                    style={{ backgroundColor: theme.primaryHex }}
                  >
                    Authorize
                  </button>
                </div>
                {backdoorError && (
                  <p className="text-red-400 font-mono text-[10px]">{backdoorError}</p>
                )}
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] font-mono uppercase text-[#8E9F9B]">Active Loops</span>
                    <p className="text-xl font-mono font-bold text-accent-dynamic" style={{ color: theme.primaryHex }}>142 Trial Instances</p>
                  </div>
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] font-mono uppercase text-[#8E9F9B]">Total MRR Trend</span>
                    <p className="text-xl font-mono font-bold text-white">$12,450/mo</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9.5px] font-mono uppercase text-[#8E9F9B] tracking-wider block border-b border-zinc-800 pb-1">Client Overrides & Licensing</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {backdoorClients.map(client => (
                      <div key={client.id} className="flex justify-between items-center bg-[#161C2A] p-2 border border-[#222B3E] text-[10px] font-mono rounded-xl">
                        <div>
                          <p className="text-white font-bold">{client.name}</p>
                          <p className="text-[#94A3B8] text-[8.5px]">{client.location}</p>
                        </div>

                        <button
                          onClick={() => handleToggleBackdoorClient(client.id)}
                          className={`px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider rounded-xl transition ${
                            client.active 
                              ? "bg-[#1E1B4B] border border-[#6366F1]/40 text-[#818CF8]"
                              : "bg-red-950/40 border border-red-500/40 text-red-400"
                          }`}
                        >
                          {client.active ? "AUTHORIZED (ACTIVE)" : "SUSPENDED (LOCKED)"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-800 text-[9px] font-mono text-[#8E9F9B]">
                  <span>System Overrides Enabled: True</span>
                </div>
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
