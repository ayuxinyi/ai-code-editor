// components/convex-error-boundary.tsx
"use client";
import { AlertCircle, Home, RefreshCw, Sparkles } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import type { FC, PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConvexErrorBoundaryProps {
  onNotFound?: boolean;
}

const ErrorFallback: FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen p-4 bg-background relative overflow-hidden">
      {/* 轻量背景 */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-foreground/5 rounded-full blur-3xl animate-pulse-subtle" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-foreground/5 rounded-full blur-3xl animate-pulse-subtle delay-1000" />

      <Card className="w-full max-w-md border shadow-md relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <CardHeader className="text-center space-y-3 pb-3">
          {/* 图标 */}
          <div className="mx-auto relative">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center shadow-sm animate-breath">
              <AlertCircle className="w-7 h-7 text-foreground/70" />
            </div>
            <div className="absolute -top-1 -right-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-foreground/40" />
            </div>
          </div>

          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">
              哎呀，翻车了… 😵
            </CardTitle>
            <CardDescription className="text-sm">
              这个页面刚刚有点不太配合
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 错误信息 */}
          <div className="bg-muted/50 rounded-md p-3 border text-sm animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="font-medium mb-1 flex items-center gap-2">
              <span>🚨</span>
              出现的问题
            </div>
            <div className="text-muted-foreground break-all">
              {error?.message || "未知错误（但肯定不是你的锅 😏）"}
            </div>
          </div>

          {/* 可能原因 */}
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <span>🕵️</span>
              可能是这些原因
            </div>
            <div className="space-y-1.5">
              {[
                "网络刚刚打了个盹 💤",
                "你可能没有这个项目的访问权限 🔒",
                "这个项目已经被删除或不存在了 👻",
              ].map((text, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground px-2 py-1.5 rounded hover:bg-muted transition-all duration-200 hover:translate-x-1"
                  style={{
                    animation: `fadeSlideIn 0.4s ease-out ${0.1 + index * 0.08}s both`,
                  }}
                >
                  <span>•</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 小提示 */}
          <div className="bg-muted/30 rounded-md p-2 text-sm text-center text-muted-foreground animate-in fade-in duration-300 delay-200">
            ✨ 小提示：刷新一下，或者回首页再试试
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 justify-center pt-2">
          <Button
            onClick={resetErrorBoundary}
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180" />
            再试一次
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
            size="sm"
          >
            <Home className="w-4 h-4" />
            回到首页
          </Button>
        </CardFooter>
      </Card>

      {/* 动画定义 */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes breath {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes pulseSubtle {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-breath {
          animation: breath 2.5s ease-in-out infinite;
        }

        .animate-pulse-subtle {
          animation: pulseSubtle 3s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export const ConvexErrorBoundary: FC<
  PropsWithChildren<ConvexErrorBoundaryProps>
> = ({ children, onNotFound = true }) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        // 如果是 ConvexError 且需要 404
        if (onNotFound && error?.message?.includes("不存在")) {
          notFound();
          return null;
        }

        if (onNotFound && error?.message?.includes("没有权限")) {
          notFound();
          return null;
        }

        // 其他错误显示美化的错误页面
        return (
          <ErrorFallback
            error={error}
            resetErrorBoundary={resetErrorBoundary}
          />
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
