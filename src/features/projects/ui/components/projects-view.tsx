"use client";
import { GitHubIcon } from "@daveyplate/better-auth-ui";
import { SparklesIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { FONT } from "@/constants";
import { cn } from "@/lib/utils";

import { ImportGithubDialog } from "./github/import-github-dialog";
import { ProjectCommandDialog } from "./project-command-dialog";
import { ProjectWithPrompt } from "./project-with-prompt";
import { ProjectsList } from "./projects-list";

export const ProjectsView = () => {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);

  const handleNewProjectWithPrompt = (open: boolean) => {
    setPromptDialogOpen(open);
  };

  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.metaKey || ev.ctrlKey) {
        if (ev.key.toLowerCase() === "k") {
          ev.preventDefault();
          setCommandDialogOpen(true);
        }
        if (ev.key.toLowerCase() === "j") {
          ev.preventDefault();
          handleNewProjectWithPrompt(true);
        }
        if (ev.key.toLowerCase() === "i") {
          ev.preventDefault();
          setImportDialogOpen(true);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <ImportGithubDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
      <ProjectCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <ProjectWithPrompt
        open={promptDialogOpen}
        onOpenChange={setPromptDialogOpen}
      />
      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4 items-center">
          {/* 页面标题 */}
          <div className="flex justify-between gap-4 w-full items-center">
            <div className="flex items-center gap-2 w-full group/logo">
              <Image
                src="/logo.svg"
                alt="Vercel"
                width={32}
                height={32}
                className="md:size-8 sm:size-11.5!"
              />
              <h1
                className={cn(
                  "text-4xl md:text-5xl font-semibold",
                  FONT.className,
                )}
              >
                Polaris
              </h1>
            </div>
          </div>
          <div className="flex flex-col w-full">
            {/* 项目操作按钮 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleNewProjectWithPrompt(true)}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <SparklesIcon className="size-4" />
                  <Kbd className="bg-accent border">⌘J / ctrl+J</Kbd>
                </div>
                <div className="text-sm text-text-secondary">新建项目</div>
              </Button>
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <GitHubIcon className="size-4" />
                  <Kbd className="bg-accent border">⌘I / ctrl+I</Kbd>
                </div>
                <div className="text-sm text-text-secondary">导入项目</div>
              </Button>
            </div>
            {/* 项目列表 */}
            <ProjectsList onViewAll={() => setCommandDialogOpen(true)} />
          </div>
        </div>
      </div>
    </>
  );
};
