import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";

import type { Doc } from "../../../../convex/_generated/dataModel";
import { useProjectsPartial } from "../hooks/use-projects";
import { formatTimestamp } from "../utils/project-helper";
import { ProjectIcon } from "./project-icon";
import { ProjectItem } from "./project-item";

interface ProjectsListProps {
  onViewAll: () => void;
}

const ContinueCard = ({ data }: { data: Doc<"projects"> }) => {
  return (
    <div className="flex flex-col gap-2  mt-4">
      <span className="text-xs text-muted-foreground">最后更新</span>
      <Button
        variant="outline"
        asChild
        className="h-auto items-start justify-start p-4 bg-background border rounded-none flex flex-col gap-2"
      >
        <Link href={`/projects/${data._id}`} className="group">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ProjectIcon importStatus={data.importStatus} />
              <span className="font-medium truncate">{data.name}</span>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(data.updatedAt)}
          </span>
        </Link>
      </Button>
    </div>
  );
};

export const ProjectsList: FC<ProjectsListProps> = ({ onViewAll }) => {
  const projects = useProjectsPartial(6);

  if (projects === undefined) return <Spinner className="size-4 text-ring" />;

  const [mostRecent, ...rest] = projects;

  return (
    <div className="flex flex-col gap-4">
      {mostRecent && <ContinueCard data={mostRecent} />}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between gap-2 items-center">
            <span className="text-xs text-muted-foreground">最近项目</span>
            <button
              className="flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
              onClick={onViewAll}
            >
              查看所有
              <Kbd className="bg-accent border">⌘K / ctrl+K</Kbd>
            </button>
          </div>
          <ul className="flex flex-col">
            {rest.map(project => (
              <ProjectItem key={project._id} data={project} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
