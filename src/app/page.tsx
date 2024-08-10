'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 min-h-screen">
      {/* Animated Wrapper for Heading */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="font-extrabold text-7xl text-bottomNavBarColor">Awajahi..</h1>
      </motion.div>

      <motion.div
        className="mr-4"
        initial={{ x: '-100vw' }}
        animate={{ x: 0 }}
        transition={{ duration: 1.5, ease: [0.42, 0, 0.58, 1], delay: 0.65 }}
      >
        <iframe
          src="https://lottie.host/embed/3d45f054-61ac-4d4e-837c-2fa3006e28cc/MeZ8JDXVB5.json"
        ></iframe>
      </motion.div>


      {/* Animated Wrapper for Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
      >
        <Button>
          <Link href="/login">Login</Link>
        </Button>
      </motion.div>

      {/* Animated Wrapper for Coming Soon Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
      >
        <p className="font font-semibold text-lightOrange">Coming Soon..</p>
      </motion.div>

      {/* Animated Wrapper for Lottie iframe */}

    </div>
  );
}
