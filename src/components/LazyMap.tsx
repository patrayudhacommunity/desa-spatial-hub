import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, type ComponentProps } from "react";
import type VillageMapType from "./VillageMap";

const VillageMap = lazy(() => import("./VillageMap"));

export function LazyMap(props: ComponentProps<typeof VillageMapType>) {
  const fallback = <div className="h-full w-full animate-pulse bg-muted" />;
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <VillageMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}
