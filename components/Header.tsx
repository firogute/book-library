import React from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/auth";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="my-10 flex justify-between gap-5">
      <Link href="/">
        <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
      </Link>

      <ul className="flex flex-row items-center gap-8">
        <li>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
            className="mb-10"
          >
            <Button>Logout</Button>
          </form>
          {/* <Link
            href="/my-profile"
            className="flex items-center justify-center gap-2"
          >
            <Avatar>
              <AvatarFallback className="bg-amber-100 text-xl">
                {getInitials(session?.user?.name || "IN")}{" "}
              </AvatarFallback>
            </Avatar>
            <p className="text-white">{session?.user?.name?.split(" ")[0]}</p>
          </Link> */}
        </li>
      </ul>
    </header>
  );
};

export default Header;
