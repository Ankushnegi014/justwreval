"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// HOC wrapper
function withAuth(Component: React.FC) {
  return function AuthComponent(props: any) {
    const router = useRouter();
    useEffect(() => {
      if (typeof window !== "undefined" && sessionStorage.getItem("loggedIn") !== "1") {
        router.replace("/login");
      }
    }, [router]);
    return <Component {...props} />;
  };
}
export default withAuth;
