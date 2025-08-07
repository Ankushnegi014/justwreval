"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("loggedIn") === "1") {
        router.replace("/trips");
      } else {
        router.replace("/login");
      }
    }
  }, [router]);
  return null;
}
