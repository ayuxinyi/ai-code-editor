// 语言扩展，用于扩展编辑器的语言支持
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { less } from "@codemirror/lang-less";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { sass } from "@codemirror/lang-sass";
import { sql } from "@codemirror/lang-sql";
import { vue } from "@codemirror/lang-vue";
import type { Extension } from "@codemirror/state";

export const getLanguageExtensions = (filename: string): Extension => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
      return javascript();
    case "jsx":
      return javascript({ jsx: true });
    case "ts":
      return javascript({ typescript: true });
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "css":
      return css();
    case "html":
      return html();
    case "java":
      return java();
    case "json":
      return json();
    case "less":
      return less();
    case "mdx":
    case "md":
      return markdown();
    case "py":
      return python();
    case "sass":
      return sass();
    case "sql":
      return sql();
    case "vue":
      return vue();
    default:
      return [];
  }
};
