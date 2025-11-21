"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NovaParadaPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect legacy route to the new create page
    router.replace("/paradas/create");
  }, [router]);

  return null;
}

