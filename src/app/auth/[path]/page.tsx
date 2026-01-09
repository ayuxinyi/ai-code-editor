import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

export function generateStaticParams() {
  return Object.values(authViewPaths).map(path => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6 min-h-screen shadow-md border-transparent border-0">
      <AuthView
        path={path}
        localization={{
          SIGN_IN: "登录",
          SIGN_IN_DESCRIPTION: "欢迎回来！开始你的编码之旅吧 🚀",
          SIGN_IN_ACTION: "立即登录 🎉",
          SIGN_IN_WITH: "",
          OR_CONTINUE_WITH: "或者继续使用",
          DONT_HAVE_AN_ACCOUNT: "还没有账号？",
          SIGN_UP: "注册",
          EMAIL: "邮箱账号",
          PASSWORD: "登录密码",
          EMAIL_PLACEHOLDER: "your.email@example.com",
          PASSWORD_PLACEHOLDER: "********",
          FORGOT_PASSWORD_LINK: "忘记密码？",
          SIGN_UP_ACTION: "立即注册",
          NAME: "账号名称",
          NAME_PLACEHOLDER: "admin",
          ALREADY_HAVE_AN_ACCOUNT: "已有账号？",
        }}
        redirectTo="/dashboard"
        otpSeparators={2}
        socialLayout="horizontal"
      />
    </main>
  );
}
