"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, Suspense } from "react";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const clerkAppearance = {
    variables: {
        colorPrimary: "#5a8f4e",
    },
};

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider appearance={clerkAppearance}>
            <Suspense fallback={null}>
                <PostHogProvider>
                    <ConvexProvider client={convex}>{children}</ConvexProvider>
                </PostHogProvider>
            </Suspense>
        </ClerkProvider>
    );
}
