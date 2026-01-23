import React from "react";
import { motion } from "framer-motion";

const MoonlitBanner = () => {
  return (
    <div className="relative w-full h-[360px] overflow-hidden bg-gradient-to-b from-[#0a1d37] to-[#1a2b40]">

      {/* Moon Glow */}
      <div className="absolute right-24 top-16">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="w-32 h-32 bg-white rounded-full shadow-[0_0_60px_20px_rgba(255,255,255,0.5)]"
        />
      </div>

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity }}
          className="absolute bg-white rounded-full"
          style={{
            width: "2px",
            height: "2px",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
          }}
        />
      ))}

      {/* Fireflies */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`firefly-${i}`}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_6px_2px_rgba(255,235,59,0.8)]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${50 + Math.random() * 40}%`,
          }}
          animate={{
            x: [0, Math.random() * 20 - 10],
            y: [0, Math.random() * 15 - 8],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}

      {/* Meadow Grass Silhouette */}
      <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-[#0b241f] to-transparent" />

      {/* Girl Silhouette sitting */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute bottom-0 left-1/4 h-48 w-auto fill-[#0c1629]"
        initial={{ y: 0 }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {/* Girl sitting in meadow silhouette */}
        <path d="M90 160c-8-12-20-28-12-44s32-20 44-6c4 6 4 16 0 24-2 4-8 8-6 14 6 14 14 20 12 28-8 4-24 0-38-16z" />
        <circle cx="116" cy="100" r="14" /> {/* Head */}
      </motion.svg>

      {/* Title Text */}
      <div className="absolute bottom-6 left-8">
        <motion.h1
          className="text-white text-3xl font-bold drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          MoonlitMeadow
        </motion.h1>
        <p className="text-gray-300 text-sm">
          All-in-One Solution for Your Daily Needs
        </p>
      </div>
    </div>
  );
};

export default MoonlitBanner;
