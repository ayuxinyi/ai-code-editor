import type { FC } from "react";
import { Suspense } from "react";

import { ProjectIdSection } from "@/features/projects/ui/sections/project-id-section";

import type { Id } from "../../../../../convex/_generated/dataModel";

interface Props {
  params: Promise<{
    projectId: Id<"projects">;
  }>;
}

export const ProjectIdSuspense: FC<Props> = async ({ params }) => {
  const { projectId } = await params;
  return <ProjectIdSection projectId={projectId} />;
};

const ProjectIdPage: FC<Props> = async ({ params }) => {
  return (
    <Suspense>
      <ProjectIdSuspense params={params} />
    </Suspense>
  );
};

export default ProjectIdPage;
