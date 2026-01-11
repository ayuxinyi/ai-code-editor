import { Vue } from "@react-symbols/icons/files";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { ChevronRightIcon } from "lucide-react";
import { type FC, useState } from "react";

import { getItemPadding } from "@/constants";
import { cn } from "@/lib/utils";

interface Props {
  type: "file" | "folder";
  level: number;
  onSubmit: (name: string) => void;
  onCancel: () => void;
  defaultValue: string;
  isOpen?: boolean;
}

export const RenameInput: FC<Props> = ({
  type,
  level,
  onSubmit,
  onCancel,
  defaultValue,
  isOpen,
}) => {
  const [value, setValue] = useState(defaultValue ?? "");

  const handleSubmit = () => {
    const trimmedValue = value.trim() || defaultValue;
    onSubmit(trimmedValue);
  };

  return (
    <div
      className="w-full flex items-center gap-1 h-5.5 bg-accent/30"
      style={{ paddingLeft: getItemPadding(level, type === "file") }}
    >
      <div className="flex items-center gap-0.5">
        {type === "folder" && (
          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              isOpen && "rotate-90"
            )}
          />
        )}
        {type === "file" && (
          <FileIcon
            className="size-4"
            fileName={value}
            autoAssign
            editFileExtensionData={{ vue: Vue }}
          />
        )}
        {type === "folder" && (
          <FolderIcon className="size-4" folderName={value} />
        )}
      </div>
      <input
        autoFocus
        type="text"
        value={value}
        onChange={ev => setValue(ev.target.value)}
        className="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
        onBlur={handleSubmit}
        onKeyDown={ev => {
          if (ev.key === "Enter") {
            handleSubmit();
          }
          if (ev.key === "Escape") {
            onCancel();
          }
        }}
        onFocus={ev => {
          if (type === "folder") {
            // 文件夹选中所有文本
            ev.currentTarget.select();
          } else {
            const value = ev.currentTarget.value;
            // 获取文件名中的最后一个点
            const lastDotIndex = value.lastIndexOf(".");
            if (lastDotIndex > 0) {
              // 如果存在，那么在重命名时，选中文件名中的最后一个点之前的文本
              ev.currentTarget.setSelectionRange(0, lastDotIndex);
            } else {
              ev.currentTarget.select();
            }
          }
        }}
      />
    </div>
  );
};
