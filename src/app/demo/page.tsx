"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const Demo = () => {
  const [loading, setLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);

  const handleBlocking = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/demo/blocking", { method: "POST" });
      const data = await res.json();
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
      const data = await res.json();
    } catch (error) {
      console.error(error);
    } finally {
      setBackgroundLoading(false);
    }
  };

  return (
    <div className="p-8 space-x-4">
      <Button onClick={handleBlocking} disabled={loading}>
        {loading ? "加载中" : "获取回复"}
      </Button>
      <Button onClick={handleBackgroundJob} disabled={backgroundLoading}>
        {backgroundLoading ? "开启中" : "后台作业"}
      </Button>
    </div>
  );
};
export default Demo;
