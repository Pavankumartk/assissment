import { Suspense } from "react";
import PageClient from "./PageClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{padding:24}}>Loading assessment...</div>}>
      <PageClient />
    </Suspense>
  );
}
