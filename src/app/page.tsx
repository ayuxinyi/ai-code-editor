import { UserAvatar, UserButton } from "@daveyplate/better-auth-ui";
import { connection } from "next/server";
import { Suspense } from "react";

import { fetchAuthQuery } from "@/lib/auth-server";

import { api } from "../../convex/_generated/api";

const Home = () => {
  return (
    <Suspense>
      <HomeSuspense />
    </Suspense>
  );
};
export default Home;

const HomeSuspense = async () => {
  await connection();
  const user = await fetchAuthQuery(api.auth.getCurrentUser);
  return <UserButton />;
};
