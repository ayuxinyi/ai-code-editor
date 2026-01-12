import { Vue } from "@react-symbols/icons/files";
import { FileIcon } from "@react-symbols/icons/utils";
import { type FC, Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useFilePath } from "@/features/projects/hooks/use-files";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { useEditor } from "../../hooks/use-editor";

interface Props {
  projectId: Id<"projects">;
}

export const FileBreadcrumbs: FC<Props> = ({ projectId }) => {
  const { activeTabId } = useEditor(projectId);
  const filePath = useFilePath(activeTabId);

  return (
    <div className="p-2 bg-background pl-4 border-b">
      <Breadcrumb>
        <BreadcrumbList className="sm:gap-0.5 gap-0.5">
          {filePath === undefined || !activeTabId ? (
            <BreadcrumbItem className="text-sm">
              <BreadcrumbPage> </BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            filePath.map((item, index) => {
              const isLast = index === filePath.length - 1;
              return (
                <Fragment key={item._id}>
                  <BreadcrumbItem className="text-sm">
                    {isLast ? (
                      <BreadcrumbPage className="flex items-center gap-1">
                        <FileIcon
                          fileName={item.name}
                          autoAssign
                          className="size-4"
                          editFileExtensionData={{ vue: Vue }}
                        />
                        {item.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href="#">{item.name}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
