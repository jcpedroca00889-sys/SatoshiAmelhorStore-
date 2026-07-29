import { motion } from "framer-motion";

const items = [
  { icon: "⚡", name: "Fast Delivery" },
  { icon: "🔒", name: "Secure Payment" },
  { icon: "💎", name: "Premium Quality" },
  { icon: "🎯", name: "Instant Access" },
  { icon: "🌐", name: "Global Reach" },
  { icon: "🛡️", name: "Protected" },
  { icon: "🚀", name: "Quick Setup" },
  { icon: "💫", name: "Exclusive" },
  { icon: "⭐", name: "Top Rated" },
  { icon: "🔥", name: "Trending" },
  { icon: "✨", name: "Curated" },
  { icon: "🎨", name: "Creative" },
];

export default function Marquee() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

      {/* Top border line */}
      <div className="border-t border-border/30 mb-8" />

      <div className="relative">
        <motion.div
          className="flex gap-12 sm:gap-20 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Double the items for seamless loop */}
          {[...items, ...items].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 shrink-0 group"
              whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <span className="text-xl sm:text-2xl">{item.icon}</span>
              <span className="text-sm sm:text-base text-text-tertiary group-hover:text-text-secondary transition-colors duration-300 whitespace-nowrap">
                {item.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500/30" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom border line */}
      <div className="border-t border-border/30 mt-8" />
    </section>
  );
}
