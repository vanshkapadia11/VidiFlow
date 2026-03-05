"use client";

import { Suspense } from "react";
import { PageLoader } from "./PageLoader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Suspense required because PageLoader uses useSearchParams */}
      <Suspense fallback={null}>
        <PageLoader />
      </Suspense>
      {children}
    </>
  );
}
