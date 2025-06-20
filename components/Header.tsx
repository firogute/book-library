"use client";

import React from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { auth } from "@/auth";
import { Session } from "next-auth";

const Header = ({ session }: { session: Session }) => {
  const pathName = usePathname();

  return (
    <header className="my-10 flex justify-between gap-5">
      <Link href="/">
        <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
      </Link>

      <ul className="flex flex-row items-center gap-8">
        <li>
          <Link
            href="/library"
            className={cn(
              "text-base cursor-pointer capitalize",
              pathName === "/library" ? "text-light-200" : "text-light-100"
            )}
          >
            Library
          </Link>
        </li>
        <li className="flex items-center justify-center gap-2">
          <Link href="/my-profile">
            <Avatar>
              <AvatarFallback className="bg-amber-100 text-xl">
                {getInitials(session?.user?.name || "IN")}{" "}
              </AvatarFallback>
            </Avatar>
          </Link>
          <p className="text-white">{session?.user?.name?.split(" ")[0]}</p>
        </li>
      </ul>
    </header>
  );
};

export default Header;
