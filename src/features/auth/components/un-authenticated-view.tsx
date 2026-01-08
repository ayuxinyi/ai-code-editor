import { ArrowLeft, Lock, LogIn } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const UnAuthenticatedView = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-neutral-100 via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 p-6">
      <div className="w-full max-w-md space-y-8">
        {/* 图标区域 */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-neutral-400/20 dark:bg-neutral-600/20 blur-xl rounded-full" />
            <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-4 rounded-full border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm">
              <Lock
                className="w-8 h-8 text-neutral-600 dark:text-neutral-400"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* 文字区域 */}
        <div className="text-center space-y-3 px-4">
          <h1 className="text-3xl font-light text-neutral-800 dark:text-neutral-200 tracking-tight">
            🔐 需要身份验证
          </h1>
          <p className="text-neutral-500 dark:text-neutral-500 text-sm leading-relaxed max-w-sm mx-auto">
            抱歉，这个页面需要登录后才能查看哦～
            <br />
            <span className="text-neutral-400 dark:text-neutral-600 text-xs">
              登录后即可畅享完整功能 ✨
            </span>
          </p>
        </div>

        {/* 按钮区域 */}
        <div className="space-y-3 px-4">
          <Button
            className="w-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            size="default"
          >
            <LogIn className="w-4 h-4 mr-2" strokeWidth={2} />
            立即登录
          </Button>

          <Button
            variant="outline"
            className="w-full bg-white/60 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 backdrop-blur-sm border-neutral-200/80 dark:border-neutral-800/80 shadow-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-neutral-900/80 transition-all duration-200"
            size="default"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
            返回上一页
          </Button>
        </div>

        {/* 底部文字 */}
        <div className="text-center px-4">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            💡 遇到问题？欢迎
            <Link
              href="/support"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors underline decoration-dotted underline-offset-2 ml-1"
            >
              联系客服
            </Link>
            获取帮助
          </p>
        </div>
      </div>
    </div>
  );
};
