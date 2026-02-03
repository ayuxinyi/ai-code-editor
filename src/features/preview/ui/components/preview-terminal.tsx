"use client";
import "@xterm/xterm/css/xterm.css";

// 调整终端大小插件
import { FitAddon } from "@xterm/addon-fit";
// 终端组件
import { Terminal } from "@xterm/xterm";
import { useTheme } from "next-themes";
import { type FC, useEffect, useRef } from "react";

interface PreviewTerminalProps {
  output: string;
}

export const PreviewTerminal: FC<PreviewTerminalProps> = ({ output }) => {
  // 终端容器ref
  const containerRef = useRef<HTMLDivElement>(null);
  // 终端实例ref
  const terminalRef = useRef<Terminal>(null);
  // 调整终端大小插件ref
  const fitAddonRef = useRef<FitAddon>(null);
  // 上次输出长度ref
  const lastLengthRef = useRef(0);

  // 获取当前主题
  const { theme, resolvedTheme } = useTheme();

  // 初始化终端
  useEffect(() => {
    // 1. 如果容器或终端实例已存在，则不初始化
    if (!containerRef.current || terminalRef.current) return;

    // 2. 初始化终端实例
    const terminal = new Terminal({
      // 启用换行符转换
      convertEol: true,
      // 禁用标准输入
      disableStdin: true,
      // 字体大小
      fontSize: 12,
      // 字体-family
      fontFamily: "monospace",
      // 主题
      theme: {
        background:
          theme === "dark" || (theme === "system" && resolvedTheme === "dark")
            ? "#1f2228"
            : "#f5f5f5",
      },
    });

    // 3. 初始化调整终端大小插件
    const fitAddon = new FitAddon();
    // 4. 加载调整终端大小插件
    terminal.loadAddon(fitAddon);
    // 5. 打开终端实例
    terminal.open(containerRef.current);
    // 6. 保存终端实例和调整终端大小插件实例
    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // 7. 添加输出内容
    if (output) {
      terminal.write(output);
      lastLengthRef.current = output.length;
    }
    // 8. 通过requestAnimationFrame调整终端大小
    requestAnimationFrame(() => fitAddon.fit());

    // 9. 监听容器大小变化，调整终端大小
    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      fitAddon.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps -- output仅仅是用来初始化终端，将终端挂载到容器上，后续不会再变化
  }, [theme, resolvedTheme]);

  // 写入输出内容
  useEffect(() => {
    if (!terminalRef.current) return;
    // 1. 如果输出内容变短，清空终端
    if (output.length < lastLengthRef.current) {
      terminalRef.current.clear();
      lastLengthRef.current = 0;
    }

    // 2. 写入输出内容
    const newData = output.slice(lastLengthRef.current);
    if (newData) {
      terminalRef.current.write(newData);
      lastLengthRef.current = output.length;
    }
  }, [output]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 p-3 [&_.xterm]:h-full! [&_.xterm-viewport]:h-full! [&_.xterm-screen]:h-full! bg-sidebar"
    />
  );
};
