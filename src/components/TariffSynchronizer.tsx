"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { TariffType } from "@/types/pharm";
import { useSession } from "next-auth/react";

export function TariffSynchronizer({ dbTariff }: { dbTariff: string }) {
  const { user, changeTariff, status } = useAuth();
  const { update } = useSession();
  const synced = useRef(false);

  useEffect(() => {
    // Only synchronize if the user is authenticated and the frontend tariff differs from the true DB tariff
    if (status === "authenticated" && user && user.tariff !== dbTariff && !synced.current) {
      console.log(`[TariffSynchronizer] Syncing frontend tariff (${user.tariff}) with DB tariff (${dbTariff})`);
      
      // Instantly update UI state via Context
      changeTariff(dbTariff as TariffType);
      
      // Persist to NextAuth cookie in the background
      update({ tariff: dbTariff });
      
      synced.current = true;
    }
  }, [user?.tariff, dbTariff, status, changeTariff, update]);

  return null;
}
