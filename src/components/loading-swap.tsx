import type { FC, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

import { Spinner } from "./ui/spinner";

interface Props {
  isLoading: boolean;
  className?: string;
  loadingText?: string;
}

export const LoadingSwap: FC<PropsWithChildren<Props>> = ({
  isLoading,
  children,
  className,
  loadingText,
}) => {
  return (
    <div className="grid items-center justify-items-center">
      <div
        className={cn(
          "col-start-1 col-end-1 row-start-1 row-end-1 flex items-center justify-center gap-2",
          isLoading ? "invisible" : "visible",
          className
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "col-start-1 col-end-1 row-start-1 row-end-1 flex items-center justify-center gap-2",
          isLoading ? "visible" : "invisible",
          className
        )}
      >
        <Spinner className="text-ring" />
        {loadingText && <span>{loadingText}</span>}
      </div>
    </div>
  );
};
