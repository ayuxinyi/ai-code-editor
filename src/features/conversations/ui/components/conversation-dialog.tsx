"use client";

import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { FC } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { useConversationByProject } from "../../hooks/use-conversations";

interface ConversationDialogProps {
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (conversationId: Id<"conversations">) => void;
}

export const ConversationDialog: FC<ConversationDialogProps> = ({
  projectId,
  open,
  onOpenChange,
  onSelect,
}) => {
  // 获取该项目下的对话
  const conversations = useConversationByProject(projectId);

  // 处理选择对话
  const handleSelect = (conversationId: Id<"conversations">) => {
    onSelect(conversationId);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="历史对话"
      description="搜索并选择一段历史对话"
    >
      <Command>
        <CommandInput placeholder="搜索历史对话..." />
        <CommandList>
          <CommandEmpty>未找到相关对话。</CommandEmpty>
          <CommandGroup heading="对话列表">
            {conversations?.map(conversation => (
              <CommandItem
                key={conversation._id}
                value={`${conversation.title}-${conversation._id}`}
                onSelect={() => handleSelect(conversation._id)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{conversation.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(conversation._creationTime, {
                      locale: zhCN,
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
