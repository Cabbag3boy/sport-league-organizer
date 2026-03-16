import AppClient from "@/app/AppClient";
import { ClientOnly } from "@/components/ClientOnly";

export default function HomePage() {
  return (
    <ClientOnly
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-900" />
      }
    >
      <AppClient />
    </ClientOnly>
  );
}
