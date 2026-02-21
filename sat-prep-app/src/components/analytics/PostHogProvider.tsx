"use client";

import { useUser } from "@clerk/nextjs";
import Script from "next/script";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  captureEvent,
  identifyUser,
  resetAnalyticsIdentity,
} from "@/lib/analytics";

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_API_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function buildPostHogSnippet(apiKey: string, host: string): string {
  const normalizedHost = host.endsWith("/") ? host.slice(0, -1) : host;

  return `
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o=["capture","identify","alias","people.set","people.set_once","reset","set_config","register","unregister","setPersonProperties","set_person_properties","group","getFeatureFlag","isFeatureEnabled","onFeatureFlags","reloadFeatureFlags"],n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('${apiKey}',{
  api_host:'${normalizedHost}',
  person_profiles:'identified_only',
  capture_pageview:false,
  capture_pageleave:false
});
`;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPostHogReady, setIsPostHogReady] = useState(false);

  const fullPath = useMemo(() => {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!POSTHOG_API_KEY) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 50;

    const markReadyWhenAvailable = () => {
      if (cancelled) {
        return;
      }

      if (window.posthog) {
        setIsPostHogReady(true);
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        return;
      }

      window.setTimeout(markReadyWhenAvailable, 100);
    };

    markReadyWhenAvailable();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!POSTHOG_API_KEY || !isLoaded || !isPostHogReady) {
      return;
    }

    if (!user) {
      resetAnalyticsIdentity();
      return;
    }

    identifyUser(user.id, {
      email: user.primaryEmailAddress?.emailAddress ?? null,
      first_name: user.firstName ?? null,
      last_name: user.lastName ?? null,
    });
  }, [
    isLoaded,
    isPostHogReady,
    user?.id,
    user?.firstName,
    user?.lastName,
    user?.primaryEmailAddress?.emailAddress,
  ]);

  useEffect(() => {
    if (!POSTHOG_API_KEY || !isPostHogReady) {
      return;
    }

    const startedAt = Date.now();
    let leaveTracked = false;

    captureEvent("page_viewed", {
      path: pathname,
      full_path: fullPath,
    });

    const trackPageLeave = (reason: "route_change" | "pagehide") => {
      if (leaveTracked) {
        return;
      }

      leaveTracked = true;
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

      captureEvent("page_left", {
        path: pathname,
        full_path: fullPath,
        reason,
        duration_seconds: durationSeconds,
      });
    };

    const onPageHide = () => {
      trackPageLeave("pagehide");
    };

    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      trackPageLeave("route_change");
    };
  }, [fullPath, isPostHogReady, pathname]);

  if (!POSTHOG_API_KEY) {
    return <>{children}</>;
  }

  return (
    <>
      <Script
        id="posthog-bootstrap"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: buildPostHogSnippet(POSTHOG_API_KEY, POSTHOG_API_HOST),
        }}
      />
      {children}
    </>
  );
}
