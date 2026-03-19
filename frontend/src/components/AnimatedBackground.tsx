import { motion } from "framer-motion"

const shapes = [
  { size: 400, x: "10%", y: "20%", delay: 0 },
  { size: 300, x: "80%", y: "10%", delay: 2 },
  { size: 250, x: "50%", y: "70%", delay: 4 },
  { size: 350, x: "20%", y: "80%", delay: 1 },
]

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-purple-500/30 blur-3xl"
          style={{
            width: shape.size,
            height: shape.size,
            top: shape.y,
            left: shape.x,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  )
}