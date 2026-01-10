import { GitHubIcon } from "@daveyplate/better-auth-ui";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { AlertCircleIcon, GlobeIcon, Loader2Icon } from "lucide-react";
import type { FC } from "react";

import { cn } from "@/lib/utils";

import type { Doc } from "../../../../../convex/_generated/dataModel";

const iconVariants = cva("", {
  variants: {
    size: {
      default: "size-3.5",
      xs: "size-3",
      sm: "size-4",
      lg: "size-5",
      xl: "size-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface ProjectIconProps extends VariantProps<typeof iconVariants> {
  importStatus: Doc<"projects">["importStatus"];
  className?: string;
}

export const ProjectIcon: FC<ProjectIconProps> = ({
  importStatus,
  className = "text-muted-foreground",
  size,
}) => {
  if (importStatus === "completed")
    return <GitHubIcon className={cn(iconVariants({ size, className }))} />;

  if (importStatus === "failed")
    return (
      <AlertCircleIcon className={cn(iconVariants({ size, className }))} />
    );

  if (importStatus === "importing")
    return (
      <Loader2Icon
        className={cn(iconVariants({ size, className }), "animate-spin")}
      />
    );

  return <GlobeIcon className={cn(iconVariants({ size, className }))} />;
};
