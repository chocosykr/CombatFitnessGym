"use client";

import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/components/CartProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#171717",
            color: "#fff",
            border: "1px solid #262626",
          },
        }}
      />
    </CartProvider>
  );
}

