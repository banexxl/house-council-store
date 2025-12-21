'use client';

import * as React from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';

type RevealProps = {
     children: React.ReactNode;
     delay?: number;
     y?: number;
     x?: number;
     duration?: number;
     once?: boolean;
};

export function Reveal({
     children,
     delay = 0,
     y = 18,
     x = 0,
     duration = 0.65,
     once = true,
}: RevealProps) {
     const reduce = useReducedMotion();

     const variants: Variants = {
          hidden: { opacity: 0, y: reduce ? 0 : y, x: reduce ? 0 : x, filter: 'blur(6px)' },
          show: {
               opacity: 1,
               y: 0,
               x: 0,
               filter: 'blur(0px)',
               transition: { duration: reduce ? 0 : duration, delay },
          },
     };

     return (
          <motion.div
               variants={variants}
               initial="hidden"
               whileInView="show"
               viewport={{ once, amount: 0.3 }}
          >
               {children}
          </motion.div>
     );
}

type StaggerProps = {
     children: React.ReactNode;
     stagger?: number;
     delayChildren?: number;
     once?: boolean;
};

export function Stagger({
     children,
     stagger = 0.08,
     delayChildren = 0.05,
     once = true,
}: StaggerProps) {
     const reduce = useReducedMotion();

     const variants: Variants = {
          hidden: {},
          show: {
               transition: {
                    staggerChildren: reduce ? 0 : stagger,
                    delayChildren: reduce ? 0 : delayChildren,
               },
          },
     };

     return (
          <motion.div
               variants={variants}
               initial="hidden"
               whileInView="show"
               viewport={{ once, amount: 0.25 }}
          >
               {children}
          </motion.div>
     );
}

export const itemVariants: Variants = {
     hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
     show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.55 },
     },
};

export const MotionBox = motion.div;
