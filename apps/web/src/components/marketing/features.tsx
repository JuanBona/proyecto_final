"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock3, ReceiptText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  {
    icon: Clock3,
    title: "Aprobaciones en minutos",
    description: "Cola clara para approvers con decisiones rápidas y trazables.",
  },
  {
    icon: CheckCircle2,
    title: "Solicitudes sin fricción",
    description: "Creación y envío de viajes con estructura consistente y validaciones.",
  },
  {
    icon: ReceiptText,
    title: "Gastos auditables",
    description: "Carga de gastos con feedback de estado para cumplimiento y control.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-10">
        <h2 className="text-3xl font-semibold tracking-tight">Todo el flujo en un mismo lugar</h2>
        <p className="mt-3 text-muted-foreground">Diseñado para equipos que priorizan velocidad, control y claridad.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <item.icon className="h-5 w-5 text-primary" aria-hidden />
                <CardTitle className="mt-4">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
