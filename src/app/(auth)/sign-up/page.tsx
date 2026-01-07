"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
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
import { RegisterSchema } from "@/schemas";

export default function RegisterPage() {
  const { signUp, loading, signInWithSocial } = useAuth();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterSchema) => {
    await signUp(values);
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-4 dark:bg-zinc-950">
      {/* 背景装饰 - subtle蓝灰色调 */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* 渐变圆圈 1 - 带一点蓝色 */}
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-linear-to-br from-slate-300/15 to-slate-500/15 blur-3xl dark:from-slate-700/15 dark:to-slate-500/15" />
        {/* 渐变圆圈 2 */}
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-linear-to-br from-zinc-300/10 to-slate-400/10 blur-3xl dark:from-zinc-700/10 dark:to-slate-600/10" />
        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative w-full max-w-md"
        >
          {/* 卡片光晕效果 - subtle蓝灰 */}
          <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-slate-400/20 via-zinc-400/20 to-slate-500/20 opacity-0 blur-xl transition-opacity duration-500 hover:opacity-100 dark:from-slate-600/20 dark:via-zinc-600/20 dark:to-slate-500/20" />

          {/* 主卡片 */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/90 backdrop-blur-xl shadow-2xl shadow-zinc-900/5 dark:border-zinc-800/80 dark:bg-zinc-900/90 dark:shadow-zinc-950/50">
            <div className="px-8 py-4 sm:px-10">
              {/* Logo 和标题区域 */}
              <div className="text-center">
                <Link
                  href="/"
                  aria-label="回到首页"
                  className="mx-auto mb-3 flex  items-center justify-center "
                >
                  <Image
                    src="/images/logo.svg"
                    alt="logo"
                    width={140}
                    height={96}
                    className="object-cover invert-100 dark:invert-0"
                  />
                </Link>

                <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  创建新账号
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  注册账号，开始享受AI设计的乐趣
                </p>
              </div>

              {/* 社交登录按钮 */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className=" rounded-md border-2 transition-all hover:scale-105 hover:border-slate-400 hover:bg-slate-50/50 hover:shadow-md dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
                  onClick={() => signInWithSocial("google")}
                  disabled={form.formState.isSubmitting || loading}
                >
                  <FcGoogle className="size-5" />
                  <span className="font-medium">Google</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md border-2 transition-all hover:scale-105 hover:border-slate-400 hover:bg-slate-50/50 hover:shadow-md dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
                  onClick={() => signInWithSocial("github")}
                  disabled={form.formState.isSubmitting || loading}
                >
                  <FaGithub className="size-5" />
                  <span className="font-medium">GitHub</span>
                </Button>
              </div>

              {/* 分隔线 */}
              <div className="my-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  或使用邮箱注册
                </span>
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
              </div>

              {/* 表单字段 */}
              <div className="space-y-4">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        用户名
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="请输入用户名"
                          required
                          className="h-11 rounded-xl border-2 bg-zinc-50/50 transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-400/20 dark:bg-zinc-800/50 dark:focus:border-slate-500 dark:focus:bg-zinc-800 dark:focus:ring-slate-500/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        邮箱地址
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="user@example.com"
                          required
                          type="email"
                          className="h-11 rounded-xl border-2 bg-zinc-50/50 transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-400/20 dark:bg-zinc-800/50 dark:focus:border-slate-500 dark:focus:bg-zinc-800 dark:focus:ring-slate-500/20"
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
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        密码
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="请输入密码"
                          required
                          type="password"
                          className="h-11 rounded-xl border-2 bg-zinc-50/50 transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-400/20 dark:bg-zinc-800/50 dark:focus:border-slate-500 dark:focus:bg-zinc-800 dark:focus:ring-slate-500/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="confirmPassword"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        确认密码
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="请再次输入密码"
                          required
                          type="password"
                          className="h-11 rounded-xl border-2 bg-zinc-50/50 transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-400/20 dark:bg-zinc-800/50 dark:focus:border-slate-500 dark:focus:bg-zinc-800 dark:focus:ring-slate-500/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 注册按钮 - slate蓝灰渐变 */}
                <Button
                  className="h-12 w-full rounded-xl bg-linear-to-r from-slate-700 via-slate-800 to-slate-700 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] hover:from-slate-800 hover:via-slate-900 hover:to-slate-800 hover:shadow-xl hover:shadow-slate-900/30 disabled:opacity-50 disabled:hover:scale-100 dark:from-slate-300 dark:via-slate-200 dark:to-slate-300 dark:text-slate-900 dark:shadow-slate-700/30 dark:hover:from-slate-200 dark:hover:via-slate-100 dark:hover:to-slate-200"
                  type="submit"
                  disabled={form.formState.isSubmitting || loading}
                >
                  {form.formState.isSubmitting || loading ? (
                    <>
                      <Loader2Icon className="size-5 animate-spin" />
                      <span>注册中...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="size-5" />
                      <span>立即注册</span>
                    </>
                  )}
                </Button>
              </div>

              {/* 登录链接 */}
              <div className="mt-4 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  已经有账号了?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                  >
                    立即登录
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
