import "./Button.css";

function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`
        vm-btn
        vm-btn-${variant}
        vm-btn-${size}
        ${fullWidth ? "vm-btn-full" : ""}
      `}
      disabled={disabled || loading}
      onClick={onClick}
    >
      <span className="vm-btn-bg"></span>

      <span className="vm-btn-content">

        {loading && (
          <span className="vm-btn-loader"></span>
        )}

        {!loading && icon && (
          <span className="vm-btn-icon">
            {icon}
          </span>
        )}

        <span>{children}</span>

      </span>
    </button>
  );
}

export default Button;