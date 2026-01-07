"use client";

import { GitHubIcon, GoogleIcon } from "@daveyplate/better-auth-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code2Icon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { LoginSchema } from "@/schemas";

const SignIn = () => {
  const { signIn, signInWithSocial, loading } = useAuth();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginSchema) => {
    await signIn(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg relative overflow-hidden">
          {/* Logo 和标题 */}
          <CardHeader className="text-center space-y-3 pb-4 pt-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 text-white mx-auto shadow-lg shadow-purple-500/20">
              <Code2Icon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                在线代码编辑器 ✨
              </CardTitle>
              <CardDescription className="text-sm">
                欢迎回来！开始你的编码之旅吧 🚀
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6">
            {/* 社交登录 */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-9 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                onClick={() => signInWithSocial("google")}
                disabled={loading}
              >
                <GoogleIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">Google</span>
              </Button>
              <Button
                variant="outline"
                className="h-9 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                onClick={() => signInWithSocial("github")}
                disabled={loading}
              >
                <GitHubIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">GitHub</span>
              </Button>
            </div>

            {/* 分割线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  或使用邮箱
                </span>
              </div>
            </div>

            {/* 表单 */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        邮箱
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@example.com"
                          className="h-9"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium">
                          密码
                        </FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                          忘记密码？
                        </Button>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="h-9"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 记住我 */}
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    记住我
                  </label>
                </div>

                <Button
                  type="submit"
                  className="h-10 w-full text-sm font-medium mt-4 relative overflow-hidden bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]"
                  disabled={form.formState.isSubmitting || loading}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {form.formState.isSubmitting || loading ? (
                      <>
                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      <>立即登录 🎉</>
                    )}
                  </span>
                </Button>
              </form>
            </Form>

            {/* 底部链接 */}
            <div className="text-center text-sm pt-2">
              <span className="text-muted-foreground">还没有账号？</span>{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm font-medium bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600"
              >
                立即注册 ✨
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
