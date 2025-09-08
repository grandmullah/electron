import React from "react";
import { SWRConfig } from "swr";

interface SWRProviderProps {
  children: React.ReactNode;
}

export const SWRProvider: React.FC<SWRProviderProps> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        // Global configuration for all SWR hooks
        refreshInterval: 30000, // 30 seconds
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000, // 2 seconds
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        shouldRetryOnError: (error) => {
          // Don't retry on 404 errors (endpoint not implemented)
          return error?.status !== 404;
        },
        onError: (error, key) => {
          console.error("SWR Error:", error, "for key:", key);
        },
        onSuccess: (data, key) => {
          console.log("SWR Success:", `Data loaded for ${key}`);
        },
        onLoadingSlow: (key) => {
          console.log(
            "SWR Loading Slow:",
            `Loading is taking longer than expected for ${key}`
          );
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

