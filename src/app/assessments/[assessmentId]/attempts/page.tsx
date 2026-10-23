import { Suspense } from "react";
import AttemptsClient from "./AttemptsClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AttemptsClient />
    </Suspense>
  );
}
