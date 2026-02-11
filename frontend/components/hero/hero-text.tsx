import { motion } from "motion/react";
import "./hero-text.css";

interface HeroTextProps {
    text?: string;
    className?: string;
}

export default function HeroText({
    text = "IMMERSE",
    className = "",
}: HeroTextProps) {
    const characters = text.split("");

    return (
        <div className={`hero-text-container ${className}`}>
            <div className="hero-grid-bg" />

            <div className="hero-text-wrapper">
                <motion.div
                    className="hero-word"
                >
                    {characters.map((char, i) => (
                        <div
                            key={i}
                            className="hero-char-container group"
                        >
                            {/* Main Character */}
                            <motion.span
                                initial={{ opacity: 0, filter: "blur(10px)" }}
                                animate={{ opacity: 1, filter: "blur(0px)" }}
                                transition={{ delay: i * 0.04 + 0.3, duration: 0.8 }}
                                className="hero-char"
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>

                            {/* Top Slice Layer */}
                            <motion.span
                                initial={{ x: "-100%", opacity: 0 }}
                                animate={{ x: "100%", opacity: [0, 1, 0] }}
                                transition={{
                                    duration: 0.7,
                                    delay: i * 0.04,
                                    ease: "easeInOut",
                                }}
                                className="hero-slice slice-top"
                            >
                                {char}
                            </motion.span>

                            {/* Middle Slice Layer */}
                            <motion.span
                                initial={{ x: "100%", opacity: 0 }}
                                animate={{ x: "-100%", opacity: [0, 1, 0] }}
                                transition={{
                                    duration: 0.7,
                                    delay: i * 0.04 + 0.1,
                                    ease: "easeInOut",
                                }}
                                className="hero-slice slice-middle"
                            >
                                {char}
                            </motion.span>

                            {/* Bottom Slice Layer */}
                            <motion.span
                                initial={{ x: "-100%", opacity: 0 }}
                                animate={{ x: "100%", opacity: [0, 1, 0] }}
                                transition={{
                                    duration: 0.7,
                                    delay: i * 0.04 + 0.2,
                                    ease: "easeInOut",
                                }}
                                className="hero-slice slice-bottom"
                            >
                                {char}
                            </motion.span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Corner Accents */}
            <div className="corner-accent corner-tl" />
            <div className="corner-accent corner-br" />
        </div>
    );
}
