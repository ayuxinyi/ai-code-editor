"use client";
import { logger } from "@sentry/nextjs";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const Demo = () => {
  const [loading, setLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);

  const handleBlocking = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/demo/blocking", { method: "POST" });
      await res.json();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundJob = async () => {
    setBackgroundLoading(true);
    try {
      const res = await fetch("/api/demo/background", { method: "POST" });
      await res.json();
    } catch (error) {
      console.error(error);
    } finally {
      setBackgroundLoading(false);
    }
  };

  const handleSentryClientError = () => {
    logger.error("用户尝试点击客户端的按钮");
    throw new Error("Sentry 客户端错误测试");
  };

  const handleSentryApiError = async () => {
    await fetch("/api/demo/sentry-api", { method: "POST" });
  };

  const handleSentryInngestError = async () => {
    await fetch("/api/demo/sentry-inngest", { method: "POST" });
  };

  return (
    <div className="p-8 space-x-4">
      <Button onClick={handleBlocking} disabled={loading}>
        {loading ? "加载中" : "获取回复"}
      </Button>
      <Button onClick={handleBackgroundJob} disabled={backgroundLoading}>
        {backgroundLoading ? "开启中" : "后台作业"}
      </Button>
      <Button onClick={handleSentryClientError} variant="destructive">
        Sentry 客户端错误测试
      </Button>
      <Button onClick={handleSentryApiError} variant="destructive">
        Sentry 服务端错误测试
      </Button>
      <Button onClick={handleSentryInngestError} variant="destructive">
        Sentry Inngest 错误测试
      </Button>
    </div>
  );
};
export default Demo;
