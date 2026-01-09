import type { FC, PropsWithChildren } from "react";

import { HeroHeader } from "./_components/header";
import { HeroFooter } from "./_components/hero-footer";

const MarketingLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <HeroHeader />
      <main className="py-16 md:py-32 ">{children}</main>
      <HeroFooter />
    </>
  );
};
export default MarketingLayout;
