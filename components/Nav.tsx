"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  signIn,
  signOut,
  useSession,
  getProviders,
  ClientSafeProvider,
  LiteralUnion,
} from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";

const Nav = () => {
  const isUserLoggedIn = true;

  // const [providers, setProviders] = useState(null);
  const [providers, setProviders] = useState<null | Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  >>(null);
  const [toggleDropdown, setToggleDropdown] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      const response = await getProviders();
      setProviders(response);
    };

    fetchProviders();
  }, []);

  return (
    <nav className="flex-between w-full mb-16 pt-3">
      <Link href={"/"} className="flex gap-2 flex-center">
        <Image
          src={"/assets/images/logo.svg"}
          height={"30"}
          width={"30"}
          alt="Logo"
          className="object-contain"
        ></Image>
        <p className="logo_text">PromptLab</p>
      </Link>

      {/* Desktop Navigation */}
      <div className="sm:flex hidden">
        {isUserLoggedIn ? (
          <div className="flex gap-3 md:gap-5">
            <Link href={"/create-prompt"} className="black_btn">
              Create Post
            </Link>

            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              className="outline_btn"
            >
              Sign Out
            </button>
            <Link href={"/profile"}>
              <Image
                src={"/assets/images/logo.svg"}
                width={37}
                height={37}
                className="rounded-full"
                alt="profile"
              ></Image>
            </Link>
          </div>
        ) : (
          <>
            {providers &&
              Object.values(providers).map((providers) => (
                // eslint-disable-next-line react/jsx-key
                <button
                  type="button"
                  key={providers.name}
                  onClick={() => signIn(providers.id)}
                  className="black-btn"
                >
                  Sign In
                </button>
              ))}
          </>
        )}
      </div>
      {/* Mobile Nav */}
      <div className="sm:hidden flex relative">
        {isUserLoggedIn ? (
          <div className="flex">
            <Image
              src={"/assets/images/logo.svg"}
              width={37}
              height={37}
              className="rounded-full"
              alt="profile"
              onClick={() => setToggleDropdown((prev) => !prev)}
            ></Image>
            {toggleDropdown && (
              <div className="dropdown">
                <Link
                  href={"/profile"}
                  className="dropdown_link"
                  onClick={() => setToggleDropdown(false)}
                >
                  My Profile
                </Link>
                <Link
                  href={"/create-prompt"}
                  className="dropdown_link"
                  onClick={() => setToggleDropdown(false)}
                >
                  Create Prompt
                </Link>
                <button type="button" onClick={()=> {
                  setToggleDropdown(false);
                  signOut();}} className="mt-5 w-full black_btn">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <>
            {" "}
            {providers &&
              Object.values(providers).map((providers) => (
                // eslint-disable-next-line react/jsx-key
                <button
                  type="button"
                  key={providers.name}
                  onClick={() => signIn(providers.id)}
                  className="black-btn"
                >
                  Sign In
                </button>
              ))}
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
