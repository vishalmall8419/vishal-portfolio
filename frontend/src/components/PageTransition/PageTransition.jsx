import { motion } from "framer-motion";
import "./PageTransition.css";

function PageTransition({ children }) {
  return (
    <motion.div
      className="vm-page-transition"
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -40,
      }}
      transition={{
        duration: 0.6,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;