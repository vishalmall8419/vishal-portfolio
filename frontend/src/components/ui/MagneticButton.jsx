import { useRef } from "react";
import "./MagneticButton.css";

function MagneticButton({
  children,
  className = "",
  onClick,
}) {
  const buttonRef = useRef(null);

  const handleMove = (e) => {
    const button = buttonRef.current;

    const rect = button.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const moveX = (x - rect.width / 2) * 0.25;
    const moveY = (y - rect.height / 2) * 0.25;

    button.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  const handleLeave = () => {
    buttonRef.current.style.transform = "translate(0px,0px)";
  };

  return (
    <button
      ref={buttonRef}
      className={`vm-magnetic-btn ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      <span>{children}</span>
    </button>
  );
}

export default MagneticButton;