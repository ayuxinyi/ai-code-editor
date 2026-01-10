import type { FC } from "react";
import { Suspense } from "react";

interface Props {
  params: Promise<{
    projectId: string;
  }>;
}

export const ProjectIdSuspense: FC<Props> = async ({ params }) => {
  const { projectId } = await params;
  return <div>{projectId}</div>;
};

const ProjectIdPage: FC<Props> = async ({ params }) => {
  return (
    <Suspense>
      <ProjectIdSuspense params={params} />
    </Suspense>
  );
};

export default ProjectIdPage;
