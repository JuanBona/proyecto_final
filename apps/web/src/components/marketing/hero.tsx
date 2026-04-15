"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 md:py-28">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-fit rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
      >
        Aprobaciones, reservas y gastos en un solo flujo
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Viajes corporativos, sin fricción.
        </h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-base text-muted-foreground sm:text-lg"
      >
        Centraliza solicitudes, decisiones y comprobantes con una experiencia premium inspirada en productos de
        clase mundial.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Link href="/login">
          <Button size="lg">Entrar al producto</Button>
        </Link>
        <a href="#features">
          <Button variant="outline" size="lg">
            Ver beneficios
          </Button>
        </a>
      </motion.div>
    </section>
  );
}
