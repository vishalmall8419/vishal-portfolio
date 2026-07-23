import { useEffect, useState } from "react";
import "./Loader.css";

function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            if (onComplete) {
              onComplete();
            }
          }, 500);

          return 100;
        }

        return prev + 1;
      });
    }, 22);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`vm-loader ${progress === 100 ? "vm-loader-hide" : ""}`}>

      {/* Background Glow */}

      <div className="vm-loader-bg">
        <div className="vm-glow glow-1"></div>
        <div className="vm-glow glow-2"></div>
        <div className="vm-glow glow-3"></div>
      </div>

      {/* Center */}

      <div className="vm-loader-center">

        {/* Orb */}

        <div className="vm-loader-orb">

          <svg
            className="vm-loader-ring"
            width="220"
            height="220"
          >
            <circle
              cx="110"
              cy="110"
              r="96"
              className="vm-ring-bg"
            />

            <circle
              cx="110"
              cy="110"
              r="96"
              className="vm-ring-progress"
              style={{
                strokeDashoffset:
                  603 - (603 * progress) / 100,
              }}
            />
          </svg>

          <div className="vm-loader-percentage">

            {progress}

            <span>%</span>

          </div>

        </div>

        {/* Name */}

        <h1 className="vm-loader-title">
          VISHAL MALL
        </h1>

        <p className="vm-loader-role">
          Java Full Stack Developer
        </p>

        {/* Progress */}

        <div className="vm-progress-wrapper">

          <div
            className="vm-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          ></div>

        </div>

        <p className="vm-loading-text">

          Initializing Experience...

        </p>

      </div>

    </div>
  );
}

export default Loader;