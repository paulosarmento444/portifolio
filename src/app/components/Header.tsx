"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useScroll } from "../hooks/useScroll";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { SearchForm } from "./SearchForm";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "./UserProfile";
import { FaShoppingBag } from "react-icons/fa"; // Ícone de sacola
import { getUserName } from "../server-actions/auth.action";
import { MdShoppingBasket } from "react-icons/md";

export default function Header() {
  const [userName, setUserName] = useState<string>("Kids");
  const isScrolled = useScroll();
  const router = useRouter();
  const params = useSearchParams();
  const initialSearchTerm = params.get("title") || "";
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);

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

  const onSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newParams = new URLSearchParams(params.toString());
    newParams.set("title", searchTerm);
    router.push(`/search?${newParams.toString()}`);
  };

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
        <SearchForm
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
          onSearch={onSearch}
        />
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
