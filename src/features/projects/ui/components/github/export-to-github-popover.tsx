"use client";
import { useForm } from "@tanstack/react-form";
import ky, { HTTPError } from "ky";
import {
  CheckCheckIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  LoaderIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { type FC, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import { enum as enum_, object, string } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GITHUB_UNAUTHORIZED_CODE } from "@/constants";
import { useProjectById } from "@/features/projects/hooks/use-projects";
import { authClient } from "@/lib/auth-client";
import { errorParse } from "@/utils/error-parse";

import type { Id } from "../../../../../../convex/_generated/dataModel";

const formSchema = object({
  repoName: string()
    .min(1, "仓库名称不能为空")
    .max(100, "仓库名称长度限制在 100 字符以内")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "格式无效：仅支持字母、数字、下划线(_)、点(.)及连字符(-)",
    ),
  visibility: enum_(["public", "private"]),
  description: string().max(350, "描述内容长度限制在 350 字符以内"),
});

interface ExportToGithubFormValues {
  projectId: Id<"projects">;
}

export const ExportToGithubPopover: FC<ExportToGithubFormValues> = ({
  projectId,
}) => {
  const project = useProjectById(projectId);
  const [open, setOpen] = useState(false);

  const exportStatus = project?.exportStatus;
  const exportRepoUrl = project?.exportRepoUrl;

  const form = useForm({
    validators: { onSubmit: formSchema },
    defaultValues: {
      repoName: project?.name?.replace(/[^a-zA-Z0-9._-]/g, "-") ?? "",
      visibility: "private",
      description: "",
    },
    async onSubmit({ value }) {
      try {
        await ky.post("/api/github/export", {
          json: {
            projectId,
            repoName: value.repoName,
            visibility: value.visibility,
            description: value.description || undefined,
          },
        });
        toast.success("导出任务已提交，后台正在处理中");
      } catch (error) {
        if (error instanceof HTTPError) {
          const body = await error.response.json<{
            error: string;
            code?: string;
          }>();
          if (body?.code === GITHUB_UNAUTHORIZED_CODE) {
            toast.error("GitHub 授权验证失败", {
              description: "当前的访问令牌无效或已过期，请重新授权。",
              action: {
                label: "重新连接 GitHub",
                onClick: async () => {
                  await authClient.linkSocial({
                    provider: "github",
                  });
                },
              },
            });
            setOpen(false);
          } else {
            toast.error("导出请求失败", {
              description: body.error || "服务器遇到未知错误，请稍后重试。",
            });
          }
        } else {
          errorParse(error);
        }
      }
    },
  });

  const handleCancelExport = async () => {
    try {
      await ky.post("/api/github/export/cancel", {
        json: { projectId },
      });
      toast.info("导出任务已取消");
      setOpen(false);
    } catch (error) {
      errorParse(error);
    }
  };

  const handleResetExport = async () => {
    try {
      await ky.post("/api/github/export/reset", {
        json: { projectId },
      });
      toast.success("状态已重置，可进行新的导出操作");
      setOpen(false);
    } catch (error) {
      errorParse(error);
    }
  };

  const renderContent = () => {
    // 状态：正在导出
    if (exportStatus === "exporting") {
      return (
        <div className="flex flex-col items-center gap-3 py-2">
          <LoaderIcon className="size-6 animate-spin text-primary" />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">正在推送到 GitHub...</p>
            <p className="text-xs text-muted-foreground">
              正在初始化仓库并上传文件，请勿关闭页面。
            </p>
          </div>
          <Button
            onClick={handleCancelExport}
            variant="outline"
            size="sm"
            className="w-full mt-2"
          >
            中止操作
          </Button>
        </div>
      );
    }

    // 状态：完成
    if (exportStatus === "completed" && exportRepoUrl) {
      return (
        <div className="flex flex-col items-center gap-3 py-2">
          <CheckCircle2Icon className="size-8 text-emerald-500" />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">仓库创建成功</p>
            <p className="text-xs text-muted-foreground px-2">
              项目代码已成功同步至 GitHub 仓库。
            </p>
          </div>
          <div className="flex flex-col w-full gap-2 mt-2">
            <Button
              onClick={handleCancelExport}
              size="sm"
              asChild
              className="w-full"
            >
              <Link
                href={exportRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="size-4 mr-2" />
                前往 GitHub 查看
              </Link>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={handleResetExport}
            >
              完成并关闭
            </Button>
          </div>
        </div>
      );
    }

    // 状态：失败
    if (exportStatus === "failed") {
      return (
        <div className="flex flex-col items-center gap-3 py-2">
          <XCircleIcon className="size-8 text-destructive" />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">导出失败</p>
            <p className="text-xs text-muted-foreground">
              创建仓库过程中发生错误，请检查网络或授权。
            </p>
          </div>
          <Button
            onClick={handleResetExport}
            variant="outline"
            size="sm"
            className="w-full mt-2"
          >
            重置并重试
          </Button>
        </div>
      );
    }

    // 状态：初始表单
    return (
      <form
        onSubmit={ev => {
          ev.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="space-y-4">
          <div className="space-y-1 border-b pb-3 mb-3">
            <h4 className="font-semibold text-sm">导出至 GitHub</h4>
            <p className="text-xs text-muted-foreground">
              配置仓库信息以创建新的 GitHub 仓库。
            </p>
          </div>

          <form.Field name="repoName">
            {field => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} className="font-medium">
                    仓库名称 <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={ev => field.handleChange(ev.target.value)}
                    placeholder="例如：my-awesome-project"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="visibility">
            {field => {
              return (
                <Field>
                  <FieldLabel htmlFor={field.name} className="font-medium">
                    可见性
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value: "public" | "private") =>
                      field.handleChange(value)
                    }
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="选择可见性" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <span className="font-medium">Public</span>
                        <span className="ml-2 text-muted-foreground text-xs">
                          (所有人可见)
                        </span>
                      </SelectItem>
                      <SelectItem value="private">
                        <span className="font-medium">Private</span>
                        <span className="ml-2 text-muted-foreground text-xs">
                          (仅自己可见)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="description">
            {field => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} className="font-medium">
                    仓库描述{" "}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      (可选)
                    </span>
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={ev => field.handleChange(ev.target.value)}
                    rows={2}
                    placeholder="请输入仓库的简要描述..."
                    aria-invalid={isInvalid}
                    className="resize-none"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="pt-2">
            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderIcon className="mr-2 size-4 animate-spin" />
                      正在创建...
                    </>
                  ) : (
                    "创建仓库"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </form>
    );
  };

  const getStatusIcon = () => {
    if (exportStatus === "exporting") {
      return <LoaderIcon className="size-3.5 animate-spin" />;
    }
    if (exportStatus === "completed") {
      return <CheckCheckIcon className="size-3.5 text-emerald-500" />;
    }
    if (exportStatus === "failed") {
      return <XCircleIcon className="size-3.5 text-destructive" />;
    }
    return <FaGithub className="size-3.5" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 h-full px-3 cursor-pointer text-muted-foreground border-l hover:bg-accent/50 hover:text-foreground transition-colors">
          {getStatusIcon()}
          <span className="text-sm font-medium">导出项目</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        {renderContent()}
      </PopoverContent>
    </Popover>
  );
};
