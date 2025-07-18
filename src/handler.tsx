import { StackHandler } from "@stackframe/react";
import { useLocation } from "react-router-dom";

import { stackClientApp } from "@/stack";

export default function Handler() {
  const location = useLocation();

  return (
    <StackHandler app={stackClientApp} location={location.pathname} fullPage />
  );
}
