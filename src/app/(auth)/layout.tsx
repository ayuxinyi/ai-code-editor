import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { FC, PropsWithChildren } from "react";

import { Button } from "@/components/ui/button";

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-5 left-5">
        <Button asChild variant="secondary">
          <Link href="/">
            <ArrowLeftIcon className="size-4" />
            返回首页
          </Link>
        </Button>
      </div>
      <section className="w-full max-w-md mx-auto">{children}</section>
    </div>
  );
};
export default AuthLayout;
