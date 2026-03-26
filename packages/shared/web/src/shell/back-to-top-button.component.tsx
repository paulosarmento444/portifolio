"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { IconButton } from "../ui";

export function BackToTopButton() {
  const [show, setShow] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleScroll = useCallback(() => {
    if (!show && window.scrollY > 500) setShow(true);
    if (show && window.scrollY <= 500) setShow(false);
  }, [show]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed right-4 bottom-4 z-20"
          initial={{ opacity: 0, right: -10 }}
          animate={{ opacity: 1, right: 16 }}
          exit={{ opacity: 0, right: -10 }}
        >
          <IconButton
            onClick={scrollToTop}
            icon={<ArrowUp className="h-5 w-5" />}
            label="Voltar ao topo"
            variant="secondary"
            className="shadow-lg shadow-emerald-400/20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
