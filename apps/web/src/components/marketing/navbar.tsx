"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const navLinkClass =
  "relative pb-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-primary/70 after:to-primary/10 after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/78 backdrop-blur-md"
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        aria-label="Navegación principal"
      >
        <Link href="/" className="text-sm font-semibold tracking-[0.01em]">
          Viajes Corporativos
        </Link>
        <div className="hidden items-center gap-8 text-sm md:flex">
          <a href="#features" className={navLinkClass}>
            Funcionalidades
          </a>
          <a href="#cta" className={navLinkClass}>
            Comenzar
          </a>
        </div>
        <Link href="/login">
          <Button size="sm">Iniciar sesión</Button>
        </Link>
      </nav>
    </motion.header>
  );
}
