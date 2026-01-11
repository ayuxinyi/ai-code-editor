"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { AuthLoadingView } from "@/features/auth/components/auth-loading-view";
import { UnAuthenticatedView } from "@/features/auth/components/un-authenticated-view";
import { authClient } from "@/lib/auth-client";

import { ThemeProvider } from "../theme/theme.provider";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathName = usePathname();
  const isProtected =
    pathName.startsWith("/dashboard") || pathName.startsWith("/projects");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthUIProvider
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => {
          // Clear router cache (protected routes)
          router.refresh();
        }}
        Link={Link}
        social={{
          providers: ["github", "google"],
        }}
      >
        <Toaster richColors closeButton />
        {!isProtected ? (
          children
        ) : (
          <>
            <Authenticated>{children}</Authenticated>
            <Unauthenticated>
              <UnAuthenticatedView />
            </Unauthenticated>
            <AuthLoading>
              <AuthLoadingView />
            </AuthLoading>
          </>
        )}
      </AuthUIProvider>
    </ThemeProvider>
  );
}
