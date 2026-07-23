import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Cursor.css";

function Cursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const move = (e) => {
      x = e.clientX;
      y = e.clientY;

      gsap.to(cursor, {
        x,
        y,
        duration: 0.18,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return <div ref={cursorRef} className="vm-cursor"></div>;
}

export default Cursor;