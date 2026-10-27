import { Suspense } from "react";
import PageClient from "./PageClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#DFE6E9",
            color: "#374151",
            fontFamily: "Segoe UI, sans-serif",
          }}
        >
          Loading assessment...
        </div>
      }
    >
      <PageClient />
    </Suspense>
  );
}
