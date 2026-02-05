import { Vue } from "@react-symbols/icons/files";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { ChevronRightIcon } from "lucide-react";
import { type FC, useState } from "react";

import { getItemPadding } from "@/constants";
import { useEditor } from "@/features/editor/hooks/use-editor";
import {
  useDeleteFile,
  useFileCreate,
  useFolderContents,
  useFolderCreate,
  useRenameFile,
} from "@/features/projects/hooks/use-files";
import { cn } from "@/lib/utils";
import { errorParse } from "@/utils/error-parse";

import type { Doc, Id } from "../../../../../../convex/_generated/dataModel";
import { CreateInput } from "./create-input";
import { LoadingRow } from "./loading-row";
import { RenameInput } from "./rename-input";
import { TreeItemWrap } from "./tree-item-wrap";

interface TreeProps {
  projectId: Id<"projects">;
  level: number;
  item: Doc<"files">;
}

export const Tree: FC<TreeProps> = ({ projectId, level, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  // file相关操作
  const renameFile = useRenameFile({ projectId, parentId: item.parentId });
  const deleteFile = useDeleteFile({ projectId, parentId: item.parentId });
  const createFile = useFileCreate();
  const createFolder = useFolderCreate();
  const folderContents = useFolderContents({
    projectId,
    parentId: item._id,
    enabled: isOpen && item.type === "folder",
  });

  // 编辑器相关操作
  const { openFile, closeTab, activeTabId } = useEditor(projectId);

  const handleCreate = async (name: string) => {
    try {
      if (creating === "file") {
        await createFile({
          projectId,
          parentId: item._id,
          name,
          content: "",
        });
      } else {
        await createFolder({
          projectId,
          parentId: item._id,
          name,
        });
      }
      setCreating(null);
    } catch (error) {
      errorParse(error);
    }
  };

  const handleRename = async (newName: string) => {
    try {
      setIsRenaming(false);
      if (newName === item.name) {
        return;
      }
      await renameFile({ id: item._id, name: newName });
    } catch (error) {
      errorParse(error);
    }
  };

  const startCreating = (type: "file" | "folder") => {
    setIsOpen(true);
    setCreating(type);
  };

  // 文件
  if (item.type === "file") {
    const fileName = item.name;
    const isActive = activeTabId === item._id;

    if (isRenaming) {
      return (
        <RenameInput
          level={level}
          type="file"
          defaultValue={fileName}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
      );
    }

    return (
      <TreeItemWrap
        item={item}
        level={level}
        isActive={isActive}
        // 单机打开文件，只是预览，不固定在tab上
        onClick={() => openFile(item._id, { pinned: false })}
        // 双击打开文件，固定在tab上
        onDoubleClick={() => {
          openFile(item._id, { pinned: true });
        }}
        onRename={() => setIsRenaming(true)}
        onDelete={async () => {
          // 关闭文件tab
          closeTab(item._id);
          // 删除文件
          await deleteFile({ id: item._id });
        }}
      >
        <FileIcon
          fileName={fileName}
          autoAssign
          className="size-4"
          editFileExtensionData={{ vue: Vue }}
        />
        <span className="text-sm truncate">{fileName}</span>
      </TreeItemWrap>
    );
  }

  const folderName = item.name;
  // 文件夹
  const folderRender = (
    <>
      <div className="flex items-center gap-0.5">
        <ChevronRightIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            isOpen && "rotate-90",
          )}
        />
        <FolderIcon folderName={folderName} className="size-4" />
      </div>
      <span className="text-sm truncate">{folderName}</span>
    </>
  );
  if (creating) {
    return (
      <>
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="group flex items-center gap-1 h-5.5 hover:bg-accent/30 w-full"
          style={{ paddingLeft: getItemPadding(level, false) }}
        >
          {folderRender}
        </button>
        {isOpen && (
          <>
            {folderContents === undefined && <LoadingRow level={level + 1} />}
            <CreateInput
              type={creating}
              level={level + 1}
              onSubmit={handleCreate}
              onCancel={() => setCreating(null)}
            />
            {folderContents?.map(child => (
              <Tree
                key={child._id}
                item={child}
                level={level + 1}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </>
    );
  }
  if (isRenaming) {
    return (
      <>
        <RenameInput
          level={level}
          type="folder"
          defaultValue={folderName}
          onSubmit={handleRename}
          isOpen={isOpen}
          onCancel={() => setIsRenaming(false)}
        />
        {isOpen && (
          <>
            {folderContents === undefined && <LoadingRow level={level + 1} />}
            {folderContents?.map(child => (
              <Tree
                key={child._id}
                item={child}
                level={level + 1}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </>
    );
  }
  return (
    <>
      <TreeItemWrap
        item={item}
        level={level}
        onClick={() => {
          setIsOpen(prev => !prev);
        }}
        onRename={() => setIsRenaming(true)}
        onDelete={async () => {
          // 删除文件夹下的所有文件
          await deleteFile({ id: item._id });
        }}
        onCreateFile={() => startCreating("file")}
        onCreateFolder={() => startCreating("folder")}
      >
        {folderRender}
      </TreeItemWrap>
      {isOpen && (
        <>
          {folderContents === undefined && <LoadingRow level={level + 1} />}
          {folderContents?.map(child => (
            <Tree
              key={child._id}
              item={child}
              level={level + 1}
              projectId={projectId}
            />
          ))}
        </>
      )}
    </>
  );
};
