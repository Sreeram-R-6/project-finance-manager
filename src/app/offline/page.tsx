import { OfflineEntry } from "@/components/offline-entry";
import { BrandMark } from "@/components/design-system";
export default function Offline() {
  return (
    <main className="auth panel stack">
      <BrandMark />
      <h1>Offline purchase drafts</h1>
      <p className="muted">
        Drafts stay on this device. Review and submit them once connected.
      </p>
      <OfflineEntry />
    </main>
  );
}
