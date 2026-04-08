"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function FadeIn({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn(className)}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.09
            ,delayChildren: 0.02
          }
        }
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
