"use client";

import ky from "ky";
import { useRouter } from "next/navigation";
import { type FC, useState } from "react";
import { toast } from "sonner";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { errorParse } from "@/utils/error-parse";

import type { Id } from "../../../../../convex/_generated/dataModel";

interface ProjectWithPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectWithPrompt: FC<ProjectWithPromptProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter();

  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text) return;
    setIsSubmitting(true);
    try {
      const { projectId } = await ky
        .post("/api/projects/create-with-prompt", {
          json: {
            prompt: message.text.trim(),
          },
        })
        .json<{
          projectId: Id<"projects">;
        }>();

      toast.success("项目已创建，项目内容正在后台生成，请稍后查看。");

      onOpenChange(false);
      setInput("");
      router.push(`/projects/${projectId}`);
    } catch (error) {
      errorParse(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg p-0">
        {/* Header 虽然隐藏，但为了无障碍访问 (Screen Readers) 依然需要翻译 */}
        <DialogHeader className="hidden">
          <DialogTitle>你想构建什么？</DialogTitle>
          <DialogDescription>
            描述你的创意，AI 将协助你完成构建。
          </DialogDescription>
        </DialogHeader>

        <PromptInput onSubmit={handleSubmit} className="border-none!">
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={ev => setInput(ev.target.value)}
              disabled={isSubmitting}
              placeholder="告诉 Polaris 你想构建什么... (例如：一个待办事项应用)"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit disabled={isSubmitting || !input} />
          </PromptInputFooter>
        </PromptInput>
      </DialogContent>
    </Dialog>
  );
};
