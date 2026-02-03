import { WebContainer } from "@webcontainer/api";
import { useCallback, useEffect, useRef, useState } from "react";

import { useFiles } from "@/features/projects/hooks/use-files";

import type { Id } from "../../../../convex/_generated/dataModel";
import { buildFileTree, getFileFullPath } from "../utils/file-tree";

// 定义webcontainer实例和启动promise
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

/**
 * 获取webcontainer实例
 * @returns webcontainer实例
 */
const getWebContainer = async () => {
  // 如果实例已存在，直接返回
  if (webcontainerInstance) return webcontainerInstance;
  // 如果promise不存在，创建一个新的promise
  if (!bootPromise) {
    // 创建启动promise，用于等待webcontainer实例的创建
    bootPromise = WebContainer.boot({ coep: "credentialless" });
  }
  // 等待webcontainer实例的创建
  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
};

/**
 * 销毁webcontainer实例
 */
const teardownWebContainer = () => {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
  bootPromise = null;
};

interface UseWebContainerProps {
  projectId: Id<"projects">;
  enabled: boolean;
  settings?: {
    installCommand?: string;
    devCommand?: string;
  };
}

type WebContainerStatus =
  | "idle" // 空闲状态
  | "booting" // 启动中状态
  | "installing" // 安装中状态
  | "running" // 运行中状态
  | "error"; // 错误状态

export const useWebContainer = ({
  projectId,
  enabled,
  settings,
}: UseWebContainerProps) => {
  // 定义webcontainer状态
  const [status, setStatus] = useState<WebContainerStatus>("idle");
  // 定义预览url
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // 定义错误信息
  const [error, setError] = useState<string | null>(null);
  // 定义重启键，用于触发重启操作,当改变组件的key时，组件会重新渲染
  const [restartKey, setRestartKey] = useState(0);
  // 定义终端输出，用于显示webcontainer的输出信息
  const [terminalOutput, setTerminalOutput] = useState("");

  // 定义webcontainer实例引用，用于进行webcontainer操作
  const containerRef = useRef<WebContainer | null>(null);
  // 定义是否已启动引用，用于判断是否需要启动webcontainer
  const hasStartedRef = useRef(false);

  // 从convex中获取文件
  const files = useFiles(projectId);

  // 初始化webcontainer实例,并进行挂载
  useEffect(() => {
    if (!enabled || !files || files.length === 0 || hasStartedRef.current)
      return;
    hasStartedRef.current = true;

    // 定义启动webcontainer的异步函数
    const start = async () => {
      try {
        // 1.初始化状态
        setStatus("booting");
        setError(null);
        setTerminalOutput("");
        // 设置终端输出
        const appendOutput = (output: string) => {
          setTerminalOutput(prev => prev + output);
        };

        // 2.获取webcontainer实例
        const container = await getWebContainer();
        containerRef.current = container;

        // 3.挂载文件系统
        const willMountFileTree = buildFileTree(files);
        await container.mount(willMountFileTree);

        // 4. 监听server-ready事件，获取预览url
        container.on("server-ready", (_port, url) => {
          setPreviewUrl(url);
          setStatus("running");
        });

        // 5. 改变状态为安装中
        setStatus("installing");

        // 6.解析安装命令(默认：npm install)
        const installCmd = settings?.installCommand || "npm install";
        // 例如：["npm","install"]
        const [installBin, ...installArgs] = installCmd.split(" ");

        // 7.设置命令行输出
        appendOutput(`${installCmd}\n`);

        // 8. 执行安装命令
        const installProcess = await container.spawn(installBin, installArgs);

        // 9. 监听安装进程的输出,并将输出添加到终端输出
        installProcess.output.pipeTo(
          new WritableStream({
            write: chunk => appendOutput(chunk),
          }),
        );

        // 10. 等待安装进程退出
        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error(
            `终端命令${installCmd}执行失败，错误编码为：${installExitCode}`,
          );
        }

        // 11. 解析开发命令(默认：npm run dev)
        const devCmd = settings?.devCommand || "npm run dev";
        // 例如：["npm","run","dev"]
        const [devBin, ...devArgs] = devCmd.split(" ");

        // 12. 设置命令行输出
        appendOutput(`${devCmd}\n`);

        // 13. 执行开发命令
        const devProcess = await container.spawn(devBin, devArgs);

        // 14. 监听开发进程的输出,并将输出添加到终端输出
        devProcess.output.pipeTo(
          new WritableStream({
            write: chunk => appendOutput(chunk),
          }),
        );
      } catch (error) {
        setError(error instanceof Error ? error.message : "未知错误");
        setStatus("error");
      }
    };
    // 15. 启动webcontainer
    start();
  }, [
    enabled,
    files,
    settings?.devCommand,
    settings?.installCommand,
    restartKey,
  ]);

  // 文件改变时，同步webcontainer容器的内容
  useEffect(() => {
    // 1. 判断是否需要同步webcontainer容器的内容
    const container = containerRef.current;
    if (
      !container ||
      !enabled ||
      !files ||
      files.length === 0 ||
      status !== "running"
    )
      return;

    // 2. 定义文件映射表，用于快速查找文件
    const filesMap = new Map(files.map(file => [file._id, file]));

    // 3. 遍历文件，将文件内容写入到webcontainer容器中
    for (const file of files) {
      // 3.1 跳过非文件类型或已存储文件或无内容的文件
      if (file.type !== "file" || file.storageId || !file.content) continue;
      // 3.2 获取文件完整路径
      const filePath = getFileFullPath(file, filesMap);
      // 3.3 将文件内容写入到webcontainer容器中
      container.fs.writeFile(filePath, file.content);
    }
  }, [enabled, files, status]);

  // 当禁用时，重置状态
  useEffect(() => {
    // 当禁用时，重置状态
    if (!enabled) {
      hasStartedRef.current = false;
      setStatus("idle");
      setPreviewUrl("");
      setError(null);
    }
  }, [enabled]);
  // 重启整个webcontainer容器
  const restartWebContainer = useCallback(() => {
    // 1. 销毁webcontainer容器
    teardownWebContainer();
    containerRef.current = null;
    hasStartedRef.current = false;
    // 2. 重置状态
    setStatus("idle");
    setPreviewUrl("");
    setError(null);
    // 3. 增加重启键，触发组件的重新渲染
    setRestartKey(prev => prev + 1);
  }, []);

  return {
    previewUrl,
    status,
    error,
    terminalOutput,
    restartWebContainer,
  };
};
