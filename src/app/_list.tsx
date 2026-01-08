"user client";

import { useMutation, useQuery } from "convex/react";

import { Button } from "@/components/ui/button";

import { api } from "../../convex/_generated/api";

export const List = () => {
  const projects = useQuery(api.projects.get);
  const create = useMutation(api.projects.create);
  return (
    <div>
      <h1>项目列表</h1>
      <ul>
        {projects?.map(project => (
          <li key={project._id}>{project.name}</li>
        ))}
      </ul>
      <Button onClick={() => create({ name: "你好" })}>创建项目</Button>
    </div>
  );
};
