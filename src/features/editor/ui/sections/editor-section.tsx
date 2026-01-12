import Image from "next/image";
import { type FC, useEffect, useRef } from "react";

import {
  useFileById,
  useUpdateFile,
} from "@/features/projects/hooks/use-files";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { useEditor } from "../../hooks/use-editor";
import { CodeEditor } from "../components/code-editor";
import { FileBreadcrumbs } from "../components/file-breadcrumbs";
import { TopNavigation } from "../components/top-navigation";

interface Props {
  projectId: Id<"projects">;
}

const DEBOUNCE_MS = 1500;

export const EditorSection: FC<Props> = ({ projectId }) => {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useFileById(activeTabId);
  const updateFile = useUpdateFile();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveFileBinary = activeFile && activeFile.storageId;
  const isActiveFileText = activeFile && !activeFile.storageId;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTabId]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 标签栏 */}
      <div className="flex items-center">
        <TopNavigation projectId={projectId} />
      </div>
      {/* 文件路径 */}
      {activeTabId && <FileBreadcrumbs projectId={projectId} />}
      {/* 编辑器 */}
      {/* 这里要加 min-h-0 才能让编辑器的高度自适应 */}
      <div className="flex-1 bg-background shrink-0 min-h-0">
        {/* 无文件时显示logo */}
        {!activeFile && (
          <div className="size-full flex items-center justify-center">
            <Image
              src="/logo-alt.svg"
              alt="Polaris"
              width={70}
              height={70}
              className="opacity-25"
            />
          </div>
        )}
        {isActiveFileText && (
          <CodeEditor
            filename={activeFile.name}
            initialValue={activeFile.content}
            onChange={content => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              timeoutRef.current = setTimeout(() => {
                updateFile({ id: activeFile._id, content });
              }, DEBOUNCE_MS);
            }}
          />
        )}
        {isActiveFileBinary && <p>TODO: 二进制文件暂不支持编辑</p>}
      </div>
    </div>
  );
};
