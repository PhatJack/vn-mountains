"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type AuthSceneProps = {
  children: ReactNode;
};

const clouds = [
  { src: "/cloudy-1.png", position: "-left-24 top-[12%] w-72", opacity: 0.45 },
  { src: "/cloudy-2.png", position: "-right-32 top-[22%] w-80", opacity: 0.34 },
  { src: "/cloudy-3.png", position: "left-[12%] top-[34%] w-64", opacity: 0.38 },
  { src: "/cloudy-1.png", position: "-right-20 top-[46%] w-96", opacity: 0.35 },
  { src: "/cloudy-2.png", position: "left-[28%] top-[58%] w-72", opacity: 0.39 },
  { src: "/cloudy-3.png", position: "-left-28 top-[70%] w-[22rem]", opacity: 0.5 },
];

export function AuthScene({ children }: AuthSceneProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/mountain-banner.png')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-br from-background via-primary/30 to-accent/30"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-radial-[circle_at_50%_20%] from-accent/30 to-transparent"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[46%] bg-linear-to-t from-foreground/70 via-primary/30 to-transparent opacity-90"
      />

      {clouds.map((cloud, index) => (
        <motion.div
          key={`${cloud.src}-${cloud.position}`}
          aria-hidden="true"
          className={`pointer-events-none absolute ${cloud.position} -z-5`}
          initial={{ x: index % 2 === 0 ? -24 : 24, opacity: cloud.opacity * 0.7 }}
          animate={
            shouldReduceMotion
              ? { opacity: cloud.opacity }
              : {
                  x: index % 2 === 0 ? [-80, 80, -80] : [80, -80, 80],
                  opacity: [cloud.opacity * 0.7, cloud.opacity, cloud.opacity * 0.7],
                }
          }
          transition={{
            duration: 12 + index * 2,
            delay: index * 0.5,
            ease: "linear",
            repeat: shouldReduceMotion ? 0 : Infinity,
          }}
        >
          <img src={cloud.src} alt="" className="block h-auto w-full" draggable={false} />
        </motion.div>
      ))}

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </main>
  );
}
