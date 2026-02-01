import ky from "ky";
import {
  CopyCheckIcon,
  CopyIcon,
  HistoryIcon,
  LoaderIcon,
  PlusIcon,
} from "lucide-react";
import { type FC, useState } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  // PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { errorParse } from "@/utils/error-parse";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "../../../../../convex/utils/constants";
import {
  useConversationById,
  useConversationByProject,
  useCreateConversation,
  useMessages,
} from "../../hooks/use-conversations";
import { ConversationDialog } from "../components/conversation-dialog";

interface Props {
  projectId: Id<"projects">;
}

interface CancelResponse {
  success: boolean;
  message?: string;
  cancelled?: boolean;
  error?: string;
  messageIds?: Id<"messages">[];
}

export const ConversationSection: FC<Props> = ({ projectId }) => {
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [input, setInput] = useState("");
  // 创建聊天
  const createConversation = useCreateConversation();
  // 获取项目下的所有聊天
  const conversations = useConversationByProject(projectId);
  // 选中的聊天
  const activeConversationId =
    selectedConversationId ?? conversations?.[0]?._id ?? null;
  const activeConversation = useConversationById(activeConversationId);
  // 获取选中聊天的所有消息
  const conversationMessages = useMessages(activeConversationId);
  // 判断消息中是否存在正在处理中的
  const isProcessing = conversationMessages?.some(
    message => message.status === "processing",
  );

  const [pastConversationsOpen, setPastConversationsOpen] = useState(false);

  const handleCreateConversation = async () => {
    try {
      const conversationId = await createConversation({
        projectId,
        title: DEFAULT_CONVERSATION_TITLE,
      });
      setSelectedConversationId(conversationId);
      return conversationId;
    } catch (error) {
      errorParse(error);
      return null;
    }
  };

  // 提交消息
  const handleSubmit = async (message: PromptInputMessage) => {
    // 如果用户已经发送了一条消息，并且AI正在处理中，那么当我们再次点击时，我们需要取消处理
    if (isProcessing && !message.text) {
      await handleCancel();
      return;
    }
    let conversationId = activeConversationId;
    // 如果用户没有选中任何聊天，那么我们需要创建一个新的聊天
    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) return;
    }

    // 触发Inngest任务，交给AI去处理消息
    try {
      await ky.post("/api/messages", {
        method: "post",
        json: {
          conversationId,
          message: message.text,
        },
      });
    } catch (error) {
      errorParse(error);
    } finally {
      setInput("");
    }
  };

  const handleCancel = async () => {
    try {
      const res = await ky
        .post("/api/messages/cancel", {
          method: "post",
          json: {
            projectId,
          },
        })
        .json<CancelResponse>();
      if (res.success) {
        toast.success(res.message ?? "取消成功");
      } else {
        toast.error(res.error ?? "取消失败");
      }
    } catch (error) {
      errorParse(error);
    }
  };

  return (
    <>
      <ConversationDialog
        projectId={projectId}
        open={pastConversationsOpen}
        onOpenChange={setPastConversationsOpen}
        onSelect={setSelectedConversationId}
      />
      <div className="flex flex-col h-full bg-sidebar">
        <div className="h-8.75 flex items-center justify-between  border-b">
          <div className="text-sm truncate pl-3">
            {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
          </div>
          <div className="flex items-center px-1 gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="highlight"
                  onClick={() => setPastConversationsOpen(true)}
                >
                  <HistoryIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-sm">历史记录</div>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="highlight"
                  onClick={handleCreateConversation}
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-sm">新建聊天</div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <Conversation className="flex-1">
          <ConversationContent>
            {conversationMessages?.map((message, messageIndex) => (
              <Message key={message._id} from={message.role}>
                <MessageContent>
                  {message.status === "processing" ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LoaderIcon className="animate-spin size-4" />
                      <span>思考中...</span>
                    </div>
                  ) : message.status === "cancelled" ? (
                    <span className="text-muted-foreground italic">
                      Request Cancelled
                    </span>
                  ) : (
                    <MessageResponse>{message.content}</MessageResponse>
                  )}
                </MessageContent>
                {message.role === "assistant" &&
                  message.status === "completed" &&
                  messageIndex === (conversationMessages?.length ?? 0) - 1 && (
                    <MessageActions>
                      <MessageAction
                        label="复制"
                        onClick={async () => {
                          if (isCopied) return;
                          await navigator.clipboard.writeText(message.content);
                          setIsCopied(true);
                          toast.success("复制成功");
                          setTimeout(() => {
                            setIsCopied(false);
                          }, 2000);
                        }}
                      >
                        {isCopied ? (
                          <CopyCheckIcon className="size-3" />
                        ) : (
                          <CopyIcon className="size-3" />
                        )}
                      </MessageAction>
                    </MessageActions>
                  )}
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="p-3">
          <PromptInput onSubmit={handleSubmit} className="mt-2">
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="描述您想要做什么，或询问项目相关问题..."
                onChange={ev => setInput(ev.target.value)}
                value={input}
                disabled={isProcessing}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <div className="flex items-center gap-2">
                {/* <PromptInputSpeechButton /> */}
                <PromptInputSubmit
                  disabled={isProcessing ? false : !input.trim() ? true : false}
                  status={isProcessing ? "streaming" : undefined}
                />
              </div>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
};
