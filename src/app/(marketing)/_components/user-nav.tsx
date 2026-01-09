"use client";
import type { User } from "better-auth";
import { CreditCardIcon, LogOutIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  user: User;
}

export const UserNav: FC<Props> = ({ user }) => {
  const { signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-xl hover:rounded-lg transition-all duration-200 bg-background/50 border-border/50 hover:bg-accent hover:text-accent-foreground"
        >
          <UserAvatar
            imageUrl={user?.image ?? ""}
            name={`${user?.name}`}
            seed={user?.email ?? ""}
            variant="botttsNeutral"
            className="size-6"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-50"
      >
        <DropdownMenuLabel className="font-normal flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserAvatar
            imageUrl={user?.image ?? ""}
            name={`${user?.name}`}
            seed={user?.email ?? ""}
            variant="botttsNeutral"
            className="relative size-8 rounded-md"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account/settings">
              <User2Icon />
              <span>个人中心</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <div>
              <CreditCardIcon />
              <span>账单管理</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild onClick={signOut}>
          <div>
            <LogOutIcon />
            <span>退出登录</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
