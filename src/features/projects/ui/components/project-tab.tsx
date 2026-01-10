import type { FC } from "react";

import { cn } from "@/lib/utils";

interface Props {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const ProjectTab: FC<Props> = ({ label, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 h-full px-3 cursor-pointer text-muted-foreground border-r hover:bg-accent/30",
        isActive && "bg-background text-foreground"
      )}
    >
      <span className="text-sm">{label}</span>
    </div>
  );
};
