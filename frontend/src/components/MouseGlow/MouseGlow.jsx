import { useEffect, useState } from "react";
import "./MouseGlow.css";

function MouseGlow() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const move = (e) => {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <div
      className="vm-mouse-glow"
      style={{
        left: position.x,
        top: position.y,
      }}
    />
  );
}

export default MouseGlow;