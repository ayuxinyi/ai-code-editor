import { type FC, type PropsWithChildren, Suspense } from "react";

import { ProjectIdLayoutView } from "@/features/projects/ui/layouts/project-id-layout-view";

import type { Id } from "../../../../../convex/_generated/dataModel";

interface Props {
  params: Promise<{
    projectId: Id<"projects">;
  }>;
}

const ProjectIdLayoutSuspense: FC<PropsWithChildren<Props>> = async ({
  children,
  params,
}) => {
  const { projectId } = await params;
  return (
    <div>
      <ProjectIdLayoutView projectId={projectId}>
        {children}
      </ProjectIdLayoutView>
    </div>
  );
};

const ProjectIdLayout: FC<PropsWithChildren<Props>> = ({
  children,
  params,
}) => {
  return (
    <Suspense>
      <ProjectIdLayoutSuspense params={params}>
        {children}
      </ProjectIdLayoutSuspense>
    </Suspense>
  );
};
export default ProjectIdLayout;
