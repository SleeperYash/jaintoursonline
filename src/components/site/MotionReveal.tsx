import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  amount?: number;
}

export const MotionReveal = ({
  children,
  className,
  as = "div",
  amount = 0.15,
}: MotionRevealProps) => {
  const Comp = as === "section" ? motion.section : motion.div;
  return (
    <Comp
      className={className}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </Comp>
  );
};

interface MotionStaggerProps {
  children: ReactNode;
  className?: string;
  amount?: number;
}

export const MotionStagger = ({
  children,
  className,
  amount = 0.1,
}: MotionStaggerProps) => (
  <motion.div
    className={className}
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount }}
  >
    {children}
  </motion.div>
);

export const MotionItem = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div className={className} variants={itemVariants}>
    {children}
  </motion.div>
);

export default MotionReveal;