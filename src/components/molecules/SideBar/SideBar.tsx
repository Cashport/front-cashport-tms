"use client";
import { useState } from "react";
import { Button, Flex } from "antd";

import { ArrowLineRight, Gear, Megaphone, User } from "phosphor-react";
import Image from "next/image";

import "./sidebar.scss";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const SideBar = () => {
  const [isSideBarLarge, setIsSideBarLarge] = useState(false);
  const path = usePathname();

  return (
    <div className={isSideBarLarge ? "mainLarge" : "main"}>
      <Flex vertical className="containerButtons">
        <Flex className="logoContainer">
          <Image
            width={isSideBarLarge ? 75 : 50}
            height={isSideBarLarge ? 75 : 50}
            alt="logo company"
            src="/images/cruz-verde.png"
          />
        </Flex>
        <Link href="/clientes/all" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<User size={26} />}
            className={path.startsWith("/clientes") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Clientes"}
          </Button>
        </Link>
        <Link href="/descuentos" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Megaphone size={32} />}
            className={path.startsWith("/descuentos") ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Descuentos"}
          </Button>
        </Link>
        <Link href="/" passHref legacyBehavior>
          <Button
            type="primary"
            size="large"
            icon={<Gear size={26} />}
            className={path === "/" ? "buttonIcon" : "buttonIconActive"}
          >
            {isSideBarLarge && "Ajustes"}
          </Button>
        </Link>
      </Flex>
      <Flex className="exit">
        <Button
          type="text"
          size="large"
          onClick={() => setIsSideBarLarge(!isSideBarLarge)}
          icon={<ArrowLineRight size={26} />}
          className="buttonExit"
        >
          {isSideBarLarge && "Salir"}
        </Button>
      </Flex>
    </div>
  );
};
