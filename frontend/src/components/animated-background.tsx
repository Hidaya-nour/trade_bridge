import { motion } from "framer-motion"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">

      {/* Main Glass Background */}
      <div className="absolute inset-0 bg-[#d9ebfb]" />

      {/* Soft Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e7f2ff] via-[#dcecff] to-[#c8e0ff]" />

      {/* Left Blue Glow */}
      <motion.div
        className="absolute -top-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-[#6db7ff]/40 blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Right Bottom Glow */}
      <motion.div
        className="absolute bottom-0 right-0 w-[34rem] h-[34rem] rounded-full bg-[#59adff]/35 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Center Soft Mirror Effect */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-[26rem] h-[26rem] rounded-full bg-white/20 blur-3xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Small Floating Glow */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-52 h-52 rounded-full bg-cyan-200/30 blur-2xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Extra Glass Reflection */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
    </div>
  )
}