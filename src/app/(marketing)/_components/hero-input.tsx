"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";

export const HeroInput = () => {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    create.mutate({
      name: "项目名称",
      initialPrompt: input,
    });
  };

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const create = useMutation(
    trpc.project.create.mutationOptions({
      onSuccess: async data => {
        queryClient.invalidateQueries(
          trpc.project.getMany.infiniteQueryOptions({})
        );
        queryClient.invalidateQueries(trpc.user.getCredits.queryOptions());
        setInput("");
        toast.success("项目创建请求已发送，AI正在处理中...");
        router.push(`/plans/${data.projectId}`);
      },
      onError(error) {
        console.error("🚀 ~ error:", { error });
        toast.error(error.message || "项目创建失败，请稍后重试。");
      },
    })
  );

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="告诉AI你想要什么样的网站..."
          className="min-h-40 w-full resize-none rounded-xl border-2 border-border bg-muted/50 backdrop-blur-sm px-6 py-4 pb-16 text-base shadow-lg shadow-zinc-950/5 hover:border-zinc-400 focus:bg-background focus:border-zinc-400 focus:shadow-xl dark:hover:border-zinc-600 dark:focus:border-zinc-600 dark:shadow-zinc-950/50 transition-all focus:outline-none focus-visible:ring-0"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute bottom-3 right-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-600 to-violet-600 blur-md opacity-50" />
            <Button
              size="lg"
              type="submit"
              className="relative rounded-xl px-6 bg-linear-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-700 hover:via-violet-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
              disabled={create.isPending || !input.trim()}
            >
              {create.isPending ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  网站生成中...
                </>
              ) : (
                <>
                  <SparklesIcon className="mr-2 size-4 animate-pulse" />
                  开始生成
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
