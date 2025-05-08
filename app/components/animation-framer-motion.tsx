"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Animate({ children }: { children: React.ReactNode }) {

     return (
          <motion.div
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
               {children}
          </motion.div >
     );
}
