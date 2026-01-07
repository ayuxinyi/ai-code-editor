"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";

import { ThemeProvider } from "../theme/theme.provider";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

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
        // TODO: 使用关联社交账户，会提示/api/auth/account-info 404，这个问题需要等待better-auth发布最新的包
        social={{
          providers: ["github", "google"],
        }}
      >
        <Toaster richColors />
        {children}
      </AuthUIProvider>
    </ThemeProvider>
  );
}
