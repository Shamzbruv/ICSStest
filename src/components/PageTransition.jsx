import React, { useState, Suspense } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Keeps the outgoing route's element so it can animate out while the new route is active
function Frozen({ children }) {
  const [frozen] = useState(children);
  return frozen;
}

export default function PageTransition() {
  const { pathname } = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -32, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Suspense
          fallback={
            <div className="grid place-items-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <Frozen>{outlet}</Frozen>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}