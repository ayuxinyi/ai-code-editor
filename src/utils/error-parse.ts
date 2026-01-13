import { ConvexError } from "convex/values";
import { toast } from "sonner";

export const errorParse = (error: unknown) => {
  console.error(error);
  let message = "未知错误";
  if (error instanceof ConvexError) {
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }
  toast.error(message);
};
