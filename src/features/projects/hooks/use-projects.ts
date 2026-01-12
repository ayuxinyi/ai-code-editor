/* eslint-disable */

import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { LIMIT_NUMBER } from "@/constants";

export const useProjects = () => useQuery(api.projects.get);

export const useProjectsPartial = (limit: number = LIMIT_NUMBER) =>
  useQuery(api.projects.getPartial, { limit });

export const useCreateProject = () =>
  useMutation(api.projects.create).withOptimisticUpdate((localStore, args) => {
    const existingProjects = localStore.getQuery(api.projects.get);
    if (existingProjects !== undefined) {
      const now = Date.now();
      const newProject = {
        _id: crypto.randomUUID() as Id<"projects">,
        _creationTime: now,
        name: args.name,
        ownerId: "anonymous",
        updatedAt: now,
      };
      localStore.setQuery(api.projects.get, {}, [
        newProject,
        ...existingProjects,
      ]);
    }
  });

export const useProjectById = (projectId: Id<"projects">) =>
  useQuery(api.projects.getProjectById, projectId ? { projectId } : "skip");

export const useProjectRename = () =>
  useMutation(api.projects.rename).withOptimisticUpdate(
    (localStore, { projectId, name }) => {
      // 从本地存储中获取当前项目
      const existingProject = localStore.getQuery(api.projects.getProjectById, {
        projectId,
      });
      const now = Date.now();
      // 如果项目存在，更新项目名称和更新时间
      if (existingProject !== undefined && existingProject !== null) {
        // 更新本地存储中的项目
        localStore.setQuery(
          api.projects.getProjectById,
          { projectId },
          {
            ...existingProject,
            name,
            updatedAt: now,
          }
        );
      }

      // 更新本地存储中的项目列表
      const existingProjects = localStore.getQuery(api.projects.get);
      if (existingProjects !== undefined) {
        localStore.setQuery(
          api.projects.get,
          {},
          existingProjects.map(project =>
            project._id === projectId
              ? { ...project, name, updatedAt: now }
              : project
          )
        );
      }
    }
  );
