import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import type { LoginSchema, RegisterSchema } from "@/schemas";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signIn = async (data: LoginSchema) => {
    setLoading(true);
    await authClient.signIn.email(
      {
        ...data,
      },
      {
        onError(context) {
          setLoading(false);
          if (context.error.code === "EMAIL_NOT_VERIFIED") {
            toast.error(
              "很抱歉，您登陆使用的邮箱账号未验证，请验证邮箱后登录!"
            );
          } else if (context.error.code === "INVALID_EMAIL_OR_PASSWORD") {
            toast.error("很抱歉，您输入的邮箱或密码错误，请检查后重新输入!");
          } else {
            console.error("Login error:", { context });
            toast.error("很抱歉，登录过程中出现了未知错误，请稍后重试!");
          }
        },
        onSuccess() {
          setLoading(false);
          toast.success("恭喜您登录成功!");
          router.push("/");
        },
      }
    );
  };

  const signInWithSocial = async (provider: "github" | "google") => {
    setLoading(true);
    await authClient.signIn.social(
      {
        provider,
        callbackURL: "/",
      },
      {
        onError(context) {
          setLoading(false);
          if (context.error.status === 403) {
            toast.error(
              "很抱歉，您登陆使用的邮箱账号未验证，请验证邮箱后登录!"
            );
          } else {
            console.error("Social sign-in error:", { context });
            toast.error(context.error.message);
          }
        },
      }
    );
  };

  const signUp = async (data: RegisterSchema) => {
    setLoading(true);
    await authClient.signUp.email(
      {
        ...data,
      },
      {
        onSuccess() {
          setLoading(false);
          toast.success(
            "恭喜您注册成功，邮箱验证邮件已发送到您的注册邮箱，请验证邮箱后登录!"
          );
          router.push("/login");
        },
        onError(context) {
          setLoading(false);
          if (context.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
            toast.error("很抱歉，该邮箱已被注册，请使用其他邮箱注册!");
          } else {
            console.error("Sign-up error:", { context });
            toast.error("很抱歉，注册过程中出现了未知错误，请稍后重试!");
          }
        },
      }
    );
  };

  const signOut = async () => {
    await authClient.signOut();
    router.push("/");
    toast.success("您已成功退出登录!");
  };

  return {
    loading,
    signIn,
    signInWithSocial,
    signUp,
    signOut,
  };
};
