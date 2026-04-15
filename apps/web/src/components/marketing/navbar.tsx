"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur"
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        aria-label="Navegación principal"
      >
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Viajes Corporativos
        </Link>
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Funcionalidades
          </a>
          <a href="#cta" className="hover:text-foreground">
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
