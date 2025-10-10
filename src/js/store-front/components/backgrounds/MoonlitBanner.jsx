import React from "react";
import { motion } from "framer-motion";

const MoonlitBanner = () => {
  return (
    <div className="xpo_relative xpo_w-full xpo_h-[360px] xpo_overflow-hidden xpo_bg-gradient-to-b xpo_from-[#0a1d37] xpo_to-[#1a2b40]">
      
      {/* Moon Glow */}
      <div className="xpo_absolute xpo_right-24 xpo_top-16">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="xpo_w-32 xpo_h-32 xpo_bg-white xpo_rounded-full xpo_shadow-[0_0_60px_20px_rgba(255,255,255,0.5)]"
        />
      </div>

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity }}
          className="xpo_absolute xpo_bg-white xpo_rounded-full"
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
          className="xpo_absolute xpo_w-2 xpo_h-2 xpo_bg-yellow-300 xpo_rounded-full xpo_shadow-[0_0_6px_2px_rgba(255,235,59,0.8)]"
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
      <div className="xpo_absolute xpo_bottom-0 xpo_left-0 xpo_w-full xpo_h-28 xpo_bg-gradient-to-t xpo_from-[#0b241f] xpo_to-transparent" />

      {/* Girl Silhouette sitting */}
      <motion.svg
        viewBox="0 0 200 200"
        className="xpo_absolute xpo_bottom-0 xpo_left-1/4 xpo_h-48 xpo_w-auto xpo_fill-[#0c1629]"
        initial={{ y: 0 }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {/* Girl sitting in meadow silhouette */}
        <path d="M90 160c-8-12-20-28-12-44s32-20 44-6c4 6 4 16 0 24-2 4-8 8-6 14 6 14 14 20 12 28-8 4-24 0-38-16z" />
        <circle cx="116" cy="100" r="14" /> {/* Head */}
      </motion.svg>

      {/* Title Text */}
      <div className="xpo_absolute xpo_bottom-6 xpo_left-8">
        <motion.h1
          className="xpo_text-white xpo_text-3xl xpo_font-bold xpo_drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          MoonlitMeadow
        </motion.h1>
        <p className="xpo_text-gray-300 xpo_text-sm">
          All-in-One Solution for Your Daily Needs
        </p>
      </div>
    </div>
  );
};

export default MoonlitBanner;
