import "./SectionTitle.css";

function SectionTitle({
  subtitle,
  title,
  highlight,
  description,
  align = "left",
}) {
  return (
    <div className={`vm-section-title vm-${align}`}>

      {subtitle && (
        <span className="vm-section-subtitle">
          {subtitle}
        </span>
      )}

      <h2 className="vm-section-heading">
        {title}{" "}
        {highlight && (
          <span className="vm-highlight">
            {highlight}
          </span>
        )}
      </h2>

      {description && (
        <p className="vm-section-description">
          {description}
        </p>
      )}

    </div>
  );
}

export default SectionTitle;