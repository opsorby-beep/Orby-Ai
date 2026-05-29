import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Auth, DB } from "../firebase";
import { SignUpPage } from "./SignUpPage";
import { RegistrationForm } from "./RegistrationForm";

interface AppRouterProps {
  renderLanding: () => React.JSX.Element;
  renderDashboard: () => React.JSX.Element;
  onProfileSynced: (profile: any) => void;
  selectedTheme: {
    primaryHex: string;
    accentText: string;
  };
}

export function AppRouter({ renderLanding, renderDashboard, onProfileSynced, selectedTheme }: AppRouterProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Subscribe to Firebase Auth State Changes
    const unsubscribe = onAuthStateChanged(Auth, async (user) => {
      setAuthLoading(true);
      const isDemoBypass = localStorage.getItem("orby_demo_authorized") === "true";

      if (user) {
        setCurrentUser(user);
        try {
          // Query user profile to see if setup form has succeeded
          const userDocRef = doc(DB, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.setupComplete) {
              setSetupComplete(true);
              
              // Pass business metadata to propagate context across application dynamically
              onProfileSynced({
                businessName: data.businessName || "Apex Home Services",
                trade: data.primaryTrade || data.trade || "Carpet Cleaning",
                whatsapp: data.whatsapp || data.whatsApp || "",
                website: data.website || "",
                city: data.city || "",
                state: data.state || "",
                zip: data.zip || "",
                themeKey: data.themeKey || "emerald"
              });
            } else {
              setSetupComplete(false);
            }
          } else {
            setSetupComplete(false);
          }
        } catch (err) {
          console.warn("Error verifying setup status:", err);
          // Set setupComplete false for new profiles to trigger setup fallback
          setSetupComplete(false);
        }
      } else if (isDemoBypass) {
        // Frictionless gate mock session for demonstration bypasses
        setCurrentUser({
          uid: "demo_fallback",
          email: "demo-client@orby.pro"
        } as any);
        setSetupComplete(true);
        onProfileSynced({
          businessName: localStorage.getItem("orby_company_name") || "Apex Cleaning Co.",
          trade: "Carpet Cleaning",
          whatsapp: "",
          website: "",
          city: "",
          state: "",
          zip: "",
          themeKey: "emerald"
        });
      } else {
        setCurrentUser(null);
        setSetupComplete(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [onProfileSynced]);

  // Handle route protection redirect rules dynamically
  useEffect(() => {
    if (authLoading) return;

    const path = location.pathname;

    if (!currentUser) {
      // Unauthenticated routes
      if (path !== "/signup" && path !== "/") {
        navigate("/");
      }
    } else {
      // Authenticated routes
      if (setupComplete === false) {
        // Enforce Setup stage 2 form completion
        if (path !== "/setup") {
          navigate("/setup");
        }
      } else if (setupComplete === true) {
        // Enforce dashboard redirect
        if (path === "/signup" || path === "/setup" || path === "/") {
          navigate("/dashboard");
        }
      }
    }
  }, [currentUser, setupComplete, authLoading, location.pathname, navigate]);

  if (authLoading) {
    // Gorgeous glowing orbit loading spinner matching Orby design guidelines
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative w-16 h-16 flex items-center justify-center mb-6">
          <div className="absolute inset-0 border-4 border-[#222B3E] rounded-full"></div>
          <div 
            className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" 
            style={{ borderColor: `${selectedTheme.primaryHex} transparent transparent transparent` }}
          ></div>
          <span className="text-xl font-mono font-bold animate-pulse" style={{ color: selectedTheme.primaryHex }}>☉</span>
        </div>
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
          Initializing Terminal Sync
        </p>
        <span className="text-[10px] text-zinc-600 font-mono mt-1">
          Establishing SSL links with Google Cloud Database
        </span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={renderLanding()} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/setup" element={<RegistrationForm />} />
      <Route path="/dashboard" element={renderDashboard()} />
      <Route path="*" element={<Navigate to={currentUser ? (setupComplete ? "/dashboard" : "/setup") : "/"} replace />} />
    </Routes>
  );
}
