"use client";

import { useState, useEffect } from "react";
import { AgeVerificationDialog } from "@/components/AgeVerificationDialog";

export function AgeVerificationWrapper() {
  const [showAgeVerification, setShowAgeVerification] = useState(false);

  useEffect(() => {
    const ageVerified = localStorage.getItem("ageVerified");
    if (!ageVerified) {
      setShowAgeVerification(true);
    }
  }, []);

  const handleAgeConfirm = () => {
    localStorage.setItem("ageVerified", "true");
    setShowAgeVerification(false);
  };

  const handleAgeDeny = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <AgeVerificationDialog 
      isOpen={showAgeVerification}
      onConfirm={handleAgeConfirm}
      onDeny={handleAgeDeny}
    />
  );
}