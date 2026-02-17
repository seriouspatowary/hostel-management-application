"use client";

import { createContext, useContext, useState } from "react";
import GlobalLoader from "@/components/custom/GlobalLoader";

const LoadingContext = createContext({
  showLoader: () => {},
  hideLoader: () => {},
  loading: false,
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader, loading }}>
      {children}
      {loading && <GlobalLoader />}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoader() {
  return useContext(LoadingContext);
}
