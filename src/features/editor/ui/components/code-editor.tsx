import { indentWithTab } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { useTheme } from "next-themes";
import type { FC } from "react";
import { useEffect, useMemo, useRef } from "react";
import { clouds } from "thememirror";

import { customSetup } from "../../extensions/custom-setup";
import { getLanguageExtensions } from "../../extensions/language-extension";
import { minimap } from "../../extensions/minimap";
import { quickEdit } from "../../extensions/quick-edit";
import { selectionTooltip } from "../../extensions/selection-tooltip";
import { suggestion } from "../../extensions/suggestion";
import { customTheme } from "../../extensions/theme";

interface EditorProps {
  filename: string;
  // 初始内容
  initialValue?: string;
  // 内容改变时回调
  onChange: (value: string) => void;
}

export const CodeEditor: FC<EditorProps> = ({
  filename,
  initialValue = "",
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const languageExtensions = useMemo(
    () => getLanguageExtensions(filename),
    [filename],
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        // 主题
        theme === "dark" || (theme === "system" && resolvedTheme === "dark")
          ? oneDark
          : clouds,
        // 自定义主题
        customTheme,
        // 基础设置
        customSetup,
        // 语法插件
        languageExtensions,
        // AI 建议插件, 用于接受AI给出的建议，插件越靠前，优先级越高
        suggestion(filename),
        // 快速编辑插件，用户可以选中某块文本后输入修改建议，通过AI进行修改
        quickEdit(filename),
        // 选中区域提示插件，会弹出操作提示框，包含两个按钮，一个为添加到聊天区域，一个为快捷修改
        selectionTooltip(),
        // 绑定 Tab 键缩进
        keymap.of([indentWithTab]),
        // 最小地图插件
        minimap(),
        // 缩进标记插件
        indentationMarkers(),
        // 内容改变时回调
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });
    viewRef.current = view;
    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValue只是用来初始化编辑器的内容
  }, [theme, languageExtensions, resolvedTheme]);

  return <div ref={editorRef} className="pl-4 bg-background size-full" />;
};
