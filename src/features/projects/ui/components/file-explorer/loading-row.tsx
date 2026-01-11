import { Spinner } from "@/components/ui/spinner";
import { getItemPadding } from "@/constants";
import { cn } from "@/lib/utils";

interface Props {
  level: number;
  className?: string;
}

export const LoadingRow = ({ level, className }: Props) => {
  return (
    <div
      className={cn("h-5.5 items-center text-muted-foreground", className)}
      style={{
        paddingLeft: getItemPadding(level, true),
      }}
    >
      <Spinner className="size-4 text-ring ml-0.5" />
    </div>
  );
};
