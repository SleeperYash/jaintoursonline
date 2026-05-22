import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

const PageTransition = ({ children }: { children: ReactNode }) => {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const duration = mobile ? 0.3 : 1.5;
  const ease = mobile ? [0.25, 0.46, 0.45, 0.94] : [0.22, 1, 0.36, 1];
  const yOffset = mobile ? 8 : 16;
  const exitYOffset = mobile ? -8 : -12;

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: exitYOffset }}
      transition={{ duration, ease }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
