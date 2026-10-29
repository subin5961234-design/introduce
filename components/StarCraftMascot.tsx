"use client";

import React from "react";
import { motion } from "motion/react";

interface MascotProps {
  mood?: "happy" | "working" | "cheering" | "thinking";
  size?: number;
  className?: string;
}

export function StarCraftMascot({ mood = "happy", size = 120, className = "" }: MascotProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background soft glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300/30 via-orange-300/30 to-emerald-300/20 blur-xl animate-pulse" />

      <motion.svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        animate={
          mood === "working"
            ? { rotate: [-2, 2, -2], y: [0, -3, 0] }
            : mood === "cheering"
            ? { y: [0, -9, 0], scale: [1, 1.05, 1] }
            : { y: [0, -4, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: mood === "working" ? 0.6 : mood === "cheering" ? 0.8 : 2.5,
          ease: "easeInOut",
        }}
      >
        <defs>
          {/* Guinea pig body warm caramel gradient */}
          <linearGradient id="furBrown" x1="40" y1="30" x2="130" y2="130" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5A623" />
            <stop offset="0.6" stopColor="#E08316" />
            <stop offset="1" stopColor="#C2610A" />
          </linearGradient>

          {/* White fur patch gradient */}
          <linearGradient id="furWhite" x1="60" y1="40" x2="100" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFF4E6" />
          </linearGradient>

          {/* Golden Star Gradient */}
          <linearGradient id="starGleam" x1="60" y1="70" x2="100" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF7A1" />
            <stop offset="0.5" stopColor="#FFD13B" />
            <stop offset="1" stopColor="#FF9F1C" />
          </linearGradient>

          {/* Pink Ears/Paws */}
          <linearGradient id="pinkSoft" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFB8B8" />
            <stop offset="1" stopColor="#FF8E8E" />
          </linearGradient>
        </defs>

        {/* Ambient floating sparkles */}
        <motion.circle
          cx="24"
          cy="40"
          r="3.5"
          fill="#FFD166"
          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
        <motion.circle
          cx="138"
          cy="36"
          r="4"
          fill="#06D6A0"
          animate={{ scale: [1.2, 0.7, 1.2], opacity: [0.8, 0.3, 0.8] }}
          transition={{ repeat: Infinity, duration: 2.1, delay: 0.3 }}
        />
        <motion.circle
          cx="140"
          cy="110"
          r="3"
          fill="#FF9F43"
          animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* --- GUINEA PIG BODY & SHAPE --- */}

        {/* Tiny Back Feet Peeking Under Belly */}
        <ellipse cx="50" cy="134" rx="10" ry="6" fill="#F8A5A5" stroke="#E07070" strokeWidth="1.5" />
        <ellipse cx="110" cy="134" rx="10" ry="6" fill="#F8A5A5" stroke="#E07070" strokeWidth="1.5" />

        {/* Plump, Chubby Guinea Pig Main Body */}
        <path
          d="M80 34 C44 34 32 64 30 96 C28 124 50 136 80 136 C110 136 132 124 130 96 C128 64 116 34 80 34 Z"
          fill="url(#furBrown)"
          stroke="#A84C00"
          strokeWidth="3.5"
        />

        {/* Chubby White Belly / Face Blaze Fur Patch (Classic Guinea Pig markings) */}
        <path
          d="M80 36 C68 36 60 52 64 74 C66 94 56 112 62 134 C68 136 92 136 98 134 C104 112 94 94 96 74 C100 52 92 36 80 36 Z"
          fill="url(#furWhite)"
        />

        {/* Guinea Pig Cute Floppy Ears */}
        {/* Left Ear */}
        <g>
          <ellipse
            cx="34"
            cy="48"
            rx="11"
            ry="8"
            transform="rotate(-25 34 48)"
            fill="#E08316"
            stroke="#A84C00"
            strokeWidth="3"
          />
          <ellipse
            cx="34"
            cy="48"
            rx="7"
            ry="5"
            transform="rotate(-25 34 48)"
            fill="url(#pinkSoft)"
          />
        </g>
        {/* Right Ear */}
        <g>
          <ellipse
            cx="126"
            cy="48"
            rx="11"
            ry="8"
            transform="rotate(25 126 48)"
            fill="#E08316"
            stroke="#A84C00"
            strokeWidth="3"
          />
          <ellipse
            cx="126"
            cy="48"
            rx="7"
            ry="5"
            transform="rotate(25 126 48)"
            fill="url(#pinkSoft)"
          />
        </g>

        {/* Chubby Cheeks (Rosy Blush) */}
        <ellipse cx="48" cy="80" rx="9" ry="6" fill="#FF7675" opacity="0.65" />
        <ellipse cx="112" cy="80" rx="9" ry="6" fill="#FF7675" opacity="0.65" />

        {/* Delicate Whiskers */}
        <line x1="32" y1="78" x2="18" y2="74" stroke="#D35400" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="32" y1="83" x2="16" y2="85" stroke="#D35400" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="128" y1="78" x2="142" y2="74" stroke="#D35400" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="128" y1="83" x2="144" y2="85" stroke="#D35400" strokeWidth="1.8" strokeLinecap="round" />

        {/* Tiny Pink Guinea Pig Nose */}
        <polygon points="76,73 84,73 80,78" fill="#FF7675" />

        {/* Guinea Pig Y-shaped Cute Mouth */}
        <path d="M80 78 L80 82 M76 84 Q80 82 80 82 Q80 82 84 84" stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* --- MOOD SPECIFIC EYES --- */}
        {mood === "happy" && (
          <g>
            {/* Happy twinkling closed smile eyes */}
            <path d="M52 64 Q60 56 68 64" stroke="#2D3436" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M92 64 Q100 56 108 64" stroke="#2D3436" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {mood === "working" && (
          <g>
            {/* Focused determined round eyes */}
            <circle cx="58" cy="62" r="5" fill="#2D3436" />
            <circle cx="56" cy="60" r="2" fill="#FFFFFF" />
            <circle cx="102" cy="62" r="5" fill="#2D3436" />
            <circle cx="100" cy="60" r="2" fill="#FFFFFF" />
            {/* Tiny focus sweat drop */}
            <motion.path
              d="M116 50 C116 46 121 43 121 43 C121 43 126 46 126 50 C126 53 123.5 55 121 55 C118.5 55 116 53 116 50 Z"
              fill="#74B9FF"
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </g>
        )}

        {mood === "cheering" && (
          <g>
            {/* Big gleaming joyful eyes */}
            <ellipse cx="58" cy="62" rx="6" ry="7.5" fill="#2D3436" />
            <circle cx="56" cy="59" r="2.8" fill="#FFFFFF" />
            <circle cx="61" cy="64" r="1.2" fill="#FFFFFF" />
            <ellipse cx="102" cy="62" rx="6" ry="7.5" fill="#2D3436" />
            <circle cx="100" cy="59" r="2.8" fill="#FFFFFF" />
            <circle cx="105" cy="64" r="1.2" fill="#FFFFFF" />
            {/* Joyful open mouth */}
            <path d="M75 83 Q80 91 85 83 Z" fill="#E17055" stroke="#2D3436" strokeWidth="1.5" />
          </g>
        )}

        {mood === "thinking" && (
          <g>
            {/* Curious eyes looking up */}
            <circle cx="59" cy="60" r="5" fill="#2D3436" />
            <circle cx="61" cy="58" r="2" fill="#FFFFFF" />
            <circle cx="103" cy="60" r="5" fill="#2D3436" />
            <circle cx="105" cy="58" r="2" fill="#FFFFFF" />
            {/* Idea lightbulb */}
            <text x="110" y="38" fill="#F39C12" fontSize="20" fontWeight="bold">💡</text>
          </g>
        )}

        {/* --- THE SHINING STAR CLASPED IN FRONT OF CHUBBY TUMMY --- */}
        <g
          transform={
            mood === "cheering"
              ? "translate(0, -6)"
              : mood === "working"
              ? "translate(0, 2)"
              : "translate(0, 0)"
          }
        >
          {/* Star Glow Behind */}
          <circle cx="80" cy="104" r="24" fill="#FFEAA7" opacity="0.45" />

          {/* Golden Star Body */}
          <polygon
            points="80,78 87,95 106,96 91,108 97,126 80,115 63,126 69,108 54,96 73,95"
            fill="url(#starGleam)"
            stroke="#D35400"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Star Cute Face */}
          <circle cx="75" cy="102" r="1.8" fill="#5A381A" />
          <circle cx="85" cy="102" r="1.8" fill="#5A381A" />
          <path d="M78 107 Q80 109 82 107" stroke="#5A381A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <circle cx="72" cy="105" r="1.5" fill="#FF7675" opacity="0.7" />
          <circle cx="88" cy="105" r="1.5" fill="#FF7675" opacity="0.7" />

          {/* Star Sparkle Highlight */}
          <polygon
            points="73,88 75,93 78,93 75,96 77,101 73,98 69,101 71,96 68,93 71,93"
            fill="#FFFFFF"
            opacity="0.8"
          />

          {/* --- CUTE CHUBBY GUINEA PIG PAWS HOLDING THE STAR --- */}
          {/* Left Paw holding star corner */}
          <ellipse cx="62" cy="104" rx="7" ry="5.5" transform="rotate(20 62 104)" fill="#FFAAA6" stroke="#C2610A" strokeWidth="2" />
          {/* Right Paw holding star corner */}
          <ellipse cx="98" cy="104" rx="7" ry="5.5" transform="rotate(-20 98 104)" fill="#FFAAA6" stroke="#C2610A" strokeWidth="2" />
        </g>

        {/* Small writing pencil for 'working' mood */}
        {mood === "working" && (
          <g transform="translate(104, 88) rotate(35)">
            <rect x="0" y="0" width="6" height="22" rx="2" fill="#0984E3" />
            <polygon points="0,22 6,22 3,28" fill="#FFEAA7" />
            <polygon points="1.5,25 4.5,25 3,28" fill="#2D3436" />
            <rect x="0" y="0" width="6" height="4" fill="#FF7675" />
          </g>
        )}
      </motion.svg>
    </div>
  );
}
