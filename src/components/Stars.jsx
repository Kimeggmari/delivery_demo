export default function Stars({ rating, size = 12 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <span style={{ fontSize: size, letterSpacing: -1, lineHeight: 1 }}>
      {"★".repeat(full)}
      {half ? "☆" : ""}
      <span style={{ color: "#d1d5db" }}>
        {"★".repeat(5 - full - (half ? 1 : 0))}
      </span>
    </span>
  );
}
