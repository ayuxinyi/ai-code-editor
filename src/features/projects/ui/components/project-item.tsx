import Link from "next/link";
import type { FC } from "react";

import type { Doc } from "../../../../../convex/_generated/dataModel";
import { formatTimestamp } from "../../utils/project-helper";
import { ProjectIcon } from "./project-icon";

interface ProjectItemProps {
  data: Doc<"projects">;
}

export const ProjectItem: FC<ProjectItemProps> = ({ data }) => {
  return (
    <Link
      href={`/projects/${data._id}`}
      className="text-sm text-foreground/60 font-medium hover:text-foreground py-1 flex items-center justify-between w-full group"
    >
      <div className="flex items-center gap-2">
        <ProjectIcon importStatus={data.importStatus} />
        <span className="truncate">{data.name}</span>
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
        {formatTimestamp(data.updatedAt)}
      </span>
    </Link>
  );
};
