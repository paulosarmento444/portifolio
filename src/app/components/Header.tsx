"use client";
import React, { useEffect, useState } from "react";
import { useScroll } from "../hooks/useScroll";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import Link from "next/link";
import { UserProfile } from "./UserProfile";
import { getUserName } from "../server-actions/auth.action";
import { MdShoppingBasket } from "react-icons/md";

export default function Header() {
  const [userName, setUserName] = useState<string>("Kids");
  const isScrolled = useScroll();

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      const fetchUserName = async () => {
        try {
          const name = await getUserName();
          setUserName(name);
          localStorage.setItem("userName", name);
        } catch (error) {
          console.error("Error fetching user name:", error);
          setUserName("Kids");
        }
      };
      fetchUserName();
    }
  }, []);

  return (
    <header
      className={`${isScrolled && "bg-yellow-500"}
     fixed top-0 z-50
     flex w-full items-center justify-between bg-gradient-to-t from-transparent to-yellow-500 p-2 px-4 transition-all lg:px-16 lg:py-4`}
    >
      <div className="flex items-center space-x-2 md:space-x-8">
        <Link href="/">
          <Logo />
        </Link>
        <NavLinks />
      </div>
      <div className="flex items-center space-x-2 md:space-x-8">
        <Link href="/my-cart">
          <MdShoppingBasket size={36} color="#FFF" />
        </Link>
        <UserProfile name={userName} />
      </div>
    </header>
  );
}
