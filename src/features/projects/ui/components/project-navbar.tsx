"use client";
import { UserButton } from "@daveyplate/better-auth-ui";
import { CloudCheckIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { KeyboardEvent } from "react";
import { type FC, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FONT } from "@/constants";
import { cn } from "@/lib/utils";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { useProjectById, useProjectRename } from "../../hooks/use-projects";
import { formatTimestamp } from "../../utils/project-helper";

interface Props {
  projectId: Id<"projects">;
}

export const ProjectNavbar: FC<Props> = ({ projectId }) => {
  const project = useProjectById(projectId);
  const rename = useProjectRename(projectId);

  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState("");

  const handleStartRename = () => {
    if (!project) return;
    setIsRenaming(true);
    setName(project.name);
  };

  const handleSubmit = () => {
    if (!project) return;
    setIsRenaming(false);
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === project.name) return;
    rename({ projectId, name: trimmedName });
  };

  const handleKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === "Enter") handleSubmit();
    if (ev.key === "Escape") setIsRenaming(false);
  };

  return (
    <div className="flex justify-between items-center gap-x-2 p-2 bg-sidebar border-b">
      <div className="flex items-center gap-x-2">
        <Breadcrumb>
          <BreadcrumbList className="gap-0!">
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center gap-1.5" asChild>
                <Button variant="ghost" className="w-fit! p-1.5! h-7!" asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center"
                    prefetch
                  >
                    <Image
                      src="/logo.svg"
                      alt="logo"
                      width={20}
                      height={20}
                      className="block dark:hidden"
                    />
                    <Image
                      src="/logo-alt.svg"
                      alt="logo"
                      width={20}
                      height={20}
                      className="hidden dark:block object-cover"
                    />
                    <span className={cn("text-sm font-medium", FONT.className)}>
                      Polaris
                    </span>
                  </Link>
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="ml-0! mr-1" />
            <BreadcrumbItem>
              {isRenaming ? (
                <Input
                  value={name}
                  onChange={ev => setName(ev.target.value)}
                  autoFocus
                  type="text"
                  onFocus={ev => ev.currentTarget.select()}
                  onBlur={handleSubmit}
                  onKeyDown={handleKeyDown}
                  className="text-sm bg-transparent text-foreground outline-none! focus:ring-1! focus:ring-inset! font-medium max-w-40 truncate"
                />
              ) : (
                <BreadcrumbPage
                  onClick={handleStartRename}
                  className="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate"
                >
                  {project?.name ?? "加载中..."}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {project?.importStatus === "importing" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Loader2Icon className="size-4 text-muted-foreground animate-spin" />
            </TooltipTrigger>
            <TooltipContent>导入中...</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <CloudCheckIcon className="size-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              最后更新:{" "}
              {project?.updatedAt
                ? formatTimestamp(project.updatedAt)
                : "时间未知"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        <UserButton size="icon" />
      </div>
    </div>
  );
};
