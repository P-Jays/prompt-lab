import { Suspense } from "react";
import UpdatePromptInner from "./update-prompt-inner";

export const dynamic = "force-dynamic"; // avoid prerender errors for query-based page

export default function UpdatePromptPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <UpdatePromptInner />
    </Suspense>
  );
}