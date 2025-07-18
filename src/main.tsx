import { StrictMode, Suspense } from "react";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StackProvider, StackTheme } from "@stackframe/react";

import { AuthProvider } from "@/contexts/auth-provider.tsx";
import { NeonAuthZeroProvider } from "@/contexts/neon-auth-zero-provider";
import { stackClientApp } from "@/stack.ts";
import App from "@/app";
import Handler from "@/handler.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <BrowserRouter>
        <StackProvider app={stackClientApp}>
          <AuthProvider>
            <StackTheme>
              <NeonAuthZeroProvider>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/handler/*" element={<Handler />} />
                </Routes>
              </NeonAuthZeroProvider>
            </StackTheme>
          </AuthProvider>
        </StackProvider>
      </BrowserRouter>
    </Suspense>
  </StrictMode>
);
