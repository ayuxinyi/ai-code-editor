"use client";

import { useForm } from "@tanstack/react-form";
import { SettingsIcon } from "lucide-react";
import { type FC, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpdateProjectSettings } from "@/features/projects/hooks/use-projects";
import { ProjectSettingsFormSchema } from "@/schemas";
import { errorParse } from "@/utils/error-parse";

import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

interface PreviewSettingsPopoverProps {
  projectId: Id<"projects">;
  initialValues?: Doc<"projects">["settings"];
  onSave?: () => void;
}

export const PreviewSettingsPopover: FC<PreviewSettingsPopoverProps> = ({
  projectId,
  initialValues,
  onSave,
}) => {
  const [open, setOpen] = useState(false);
  const updateSettings = useUpdateProjectSettings();

  const form = useForm({
    validators: {
      onSubmit: ProjectSettingsFormSchema,
    },
    defaultValues: {
      installCommand: initialValues?.installCommand ?? "",
      devCommand: initialValues?.devCommand ?? "",
    },
    async onSubmit({ value }) {
      try {
        await updateSettings({
          settings: {
            installCommand: value.installCommand || undefined,
            devCommand: value.devCommand || undefined,
          },
          id: projectId,
        });
        setOpen(false);
        onSave?.();
        toast.success("项目预览设置更新成功");
      } catch (error) {
        errorParse(error);
      }
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({
        installCommand: initialValues?.installCommand ?? "",
        devCommand: initialValues?.devCommand ?? "",
      });
    }
    setOpen(isOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          className="h-full rounded-none"
          size="sm"
          variant="ghost"
          title="预览设置"
          aria-label="预览设置"
        >
          <SettingsIcon className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <form
          onSubmit={ev => {
            ev.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">预览设置</h4>
              <p className="text-xs text-muted-foreground">
                Configure how your project runs in the preview environment.
              </p>
            </div>
            <form.Field name="installCommand">
              {field => (
                <Field>
                  <FieldLabel htmlFor={field.name}>安装命令</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={ev => field.handleChange(ev.target.value)}
                    placeholder="npm install"
                  />
                  <FieldDescription>
                    Command to install dependencies.
                  </FieldDescription>
                </Field>
              )}
            </form.Field>
            <form.Field name="devCommand">
              {field => (
                <Field>
                  <FieldLabel htmlFor={field.name}>启动命令</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={ev => field.handleChange(ev.target.value)}
                    placeholder="npm run dev"
                  />
                  <FieldDescription>
                    Command to start the development server.
                  </FieldDescription>
                </Field>
              )}
            </form.Field>
            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "保存中..." : "保存更改"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
