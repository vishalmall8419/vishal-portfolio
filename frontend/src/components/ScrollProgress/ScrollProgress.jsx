import { useEffect, useState } from "react";
import "./ScrollProgress.css";

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const current =
        (window.scrollY / total) * 100;

      setProgress(current);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  return (
    <div
      className="vm-scroll-progress"
      style={{
        width: `${progress}%`,
      }}
    />
  );
}

export default ScrollProgress;