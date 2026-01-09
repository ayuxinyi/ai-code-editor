"use client";

import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

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
      <Button
        onClick={async () => {
          try {
            await create({ name: "你好" });
          } catch {
            toast.error("创建失败");
          }
        }}
      >
        创建项目2
      </Button>
    </div>
  );
};
