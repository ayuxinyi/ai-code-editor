import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export const formatTimestamp = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: zhCN,
  });
};
