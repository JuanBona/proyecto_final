"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section id="cta" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-border bg-card p-8 text-center md:p-12"
      >
        <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">Listo para modernizar tus viajes corporativos</h3>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Inicia sesión y activa un flujo completo desde la solicitud hasta la rendición de gastos.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/login">
            <Button size="lg">Comenzar ahora</Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
