"use client";
import { useForm } from "@tanstack/react-form";
import ky, { HTTPError } from "ky";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import { toast } from "sonner";
import { object, url } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GITHUB_UNAUTHORIZED_CODE } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { errorParse } from "@/utils/error-parse";

import type { Id } from "../../../../../../convex/_generated/dataModel";

const formSchema = object({
  url: url("请输入正确的 Github 仓库链接").min(1, "请输入 Github 仓库链接"),
});

interface ImportGithubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportGithubDialog: FC<ImportGithubDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter();

  const form = useForm({
    validators: {
      onSubmit: formSchema,
    },
    defaultValues: {
      url: "",
    },
    async onSubmit({ value }) {
      try {
        const { projectId } = await ky
          .post("/api/github/import", {
            json: { url: value.url },
          })
          .json<{
            success: boolean;
            projectId: Id<"projects">;
            eventId: string;
          }>();
        toast.success("项目导入成功");
        onOpenChange(false);
        form.reset();
        router.push(`/projects/${projectId}`);
      } catch (error) {
        if (error instanceof HTTPError) {
          const body = await error.response.json<{
            error: string;
            code?: string;
          }>();
          if (body?.code === GITHUB_UNAUTHORIZED_CODE) {
            toast.error("Github 授权无效或已过期，请重新连接账号", {
              action: {
                label: "连接 Github 账号",
                onClick: async () => {
                  await authClient.linkSocial({
                    provider: "github",
                  });
                },
              },
            });
            onOpenChange(false);
          } else {
            toast.error(body.error || "导入失败，请稍后重试");
          }
        } else {
          errorParse(error);
        }
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>从 GitHub 导入项目</DialogTitle>
          <DialogDescription>
            请输入您要导入的 GitHub
            仓库地址。系统将基于该仓库的内容为您创建一个新的项目。
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={ev => {
            ev.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="url">
            {field => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>仓库地址</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={ev => field.handleChange(ev.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="https://github.com/owner/repo"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              取消
            </Button>
            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "正在导入..." : "导入"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
