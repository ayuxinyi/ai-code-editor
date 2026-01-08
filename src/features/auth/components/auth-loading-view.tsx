import { Loader2 } from "lucide-react";

export const AuthLoadingView = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden fixed inset-0 z-100">
      {/* 背景装饰层 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />

        {/* 光晕效果 */}
        <div className="absolute top-1/4 left-1/4 size-96 bg-linear-to-br from-neutral-200/60 to-transparent dark:from-neutral-800/60 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 size-125 bg-linear-to-tl from-neutral-300/40 to-transparent dark:from-neutral-700/40 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 bg-linear-to-r from-neutral-200/30 via-neutral-300/30 to-neutral-200/30 dark:from-neutral-800/30 dark:via-neutral-700/30 dark:to-neutral-800/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* 主加载内容 */}
      <div className="relative flex flex-col items-center space-y-6">
        {/* 多层旋转圈 */}
        <div className="relative size-28">
          {/* 外圈背景 */}
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 shadow-lg" />

          {/* 旋转圈 - 外层 */}
          <div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-neutral-400/80 dark:border-t-neutral-600/80 animate-spin"
            style={{ animationDuration: "2s" }}
          />

          {/* 旋转圈 - 中层 */}
          <div
            className="absolute inset-3 rounded-full border-[3px] border-transparent border-t-neutral-500/70 dark:border-t-neutral-500/70 animate-spin"
            style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
          />

          {/* 旋转圈 - 内层 */}
          <div
            className="absolute inset-6 rounded-full border-2 border-transparent border-t-neutral-600/80 dark:border-t-neutral-400/80 animate-spin"
            style={{ animationDuration: "1s" }}
          />

          {/* 中心图标容器 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-full shadow-md">
              <Loader2
                className="w-7 h-7 text-neutral-700 dark:text-neutral-300 animate-spin"
                strokeWidth={2.5}
                style={{ animationDuration: "1.2s" }}
              />
            </div>
          </div>
        </div>

        {/* 加载文字 */}
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 tracking-wide">
            正在为您准备
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            马上就好，请稍候片刻 ✨
          </p>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="w-2 h-2 bg-neutral-500 dark:bg-neutral-500 rounded-full animate-bounce" />
            <span
              className="w-2 h-2 bg-neutral-500 dark:bg-neutral-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="w-2 h-2 bg-neutral-500 dark:bg-neutral-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>

        {/* 进度提示 */}
        <div className="w-56 space-y-2">
          <div className="h-1.5 bg-neutral-200/80 dark:bg-neutral-800/80 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-linear-to-r from-neutral-300 via-neutral-500 to-neutral-300 dark:from-neutral-700 dark:via-neutral-500 dark:to-neutral-700 rounded-full animate-shimmer bg-size-[200%_100%]" />
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-600 text-center">
            正在验证身份信息...
          </p>
        </div>
      </div>

      {/* 自定义动画 */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
