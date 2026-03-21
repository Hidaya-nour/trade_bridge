import { motion } from "framer-motion"

export function AnimatedClouds() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Large Circle */}
      <motion.div
        className="absolute top-10 left-10 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl"
        animate={{
          x: [0, 80, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Semi Circle Top */}
      <motion.div
        className="absolute top-20 right-0 w-[28rem] h-[14rem] bg-cyan-400/20 rounded-t-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Medium Circle */}
      <motion.div
        className="absolute bottom-20 left-1/4 w-64 h-64 rounded-full bg-purple-400/20 blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -50, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Semi Circle Bottom */}
      <motion.div
        className="absolute bottom-0 right-10 w-[30rem] h-[15rem] bg-pink-400/20 rounded-t-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, -40, 0],
          rotate: [0, -6, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Small Floating Circle */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-blue-300/20 blur-2xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

    </div>
  )
}