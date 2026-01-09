import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { FC } from "react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "h-9 w-9",
      xs: "h-4 w-4",
      sm: "h-6 w-6",
      lg: "h-10 w-10",
      xl: "h-[160px] w-[160px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string;
  seed?: string;
  variant?: "botttsNeutral" | "initials";
  name: string;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: FC<UserAvatarProps> = memo(
  ({ imageUrl, name, className, onClick, size, seed, variant }) => {
    if (!imageUrl) {
      let avatar;
      if (variant === "botttsNeutral") {
        avatar = createAvatar(botttsNeutral, {
          seed: seed || name,
        });
      } else {
        avatar = createAvatar(initials, {
          seed: seed || name,
          fontWeight: 500,
          fontSize: 42,
        });
      }
      return (
        <Avatar className={cn(className)}>
          <AvatarImage src={avatar.toDataUri()} alt="Avatar" />
          <AvatarFallback>
            {(seed || name)?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <Avatar
        className={cn(avatarVariants({ size, className }))}
        onClick={onClick}
      >
        <AvatarImage src={imageUrl} alt={name} />
      </Avatar>
    );
  }
);
