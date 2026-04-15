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
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-8 text-center shadow-[0_20px_52px_rgba(2,6,23,0.08)] md:p-12"
      >
        <div
          data-ui="cta-depth-layer"
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_48%)]"
        />
        <h3 className="relative text-2xl font-semibold tracking-tight md:text-3xl">
          Listo para modernizar tus viajes corporativos
        </h3>
        <p className="relative mx-auto mt-3 max-w-2xl text-muted-foreground">
          Inicia sesión y activa un flujo completo desde la solicitud hasta la rendición de gastos.
        </p>
        <div className="relative mt-6 flex justify-center">
          <Link href="/login">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg">Comenzar ahora</Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
