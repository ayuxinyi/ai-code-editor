import { useRouter } from "next/navigation";
import type { FC } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useProjects } from "../../hooks/use-projects";
import { ProjectIcon } from "./project-icon";

interface ProjectCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectCommandDialog: FC<ProjectCommandDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter();

  const projects = useProjects();

  const handleSelected = (projectId: string) => {
    router.push(`/projects/${projectId}`);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="查询项目"
      description="搜索并导航到您的项目"
    >
      <CommandInput placeholder="如：xxx-xxx-xxx" />
      <CommandList>
        <CommandEmpty>很抱歉，未发现相关项目。</CommandEmpty>
        <CommandGroup heading="项目列表">
          {projects?.map(project => (
            <CommandItem
              key={project._id}
              value={`${project.name}-${project._id}`}
              onSelect={() => handleSelected(project._id)}
            >
              <ProjectIcon importStatus={project.importStatus} size="sm" />
              <span>{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
