export default function SwirlBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="swirl-shape swirl-shape-1" />
      <div className="swirl-shape swirl-shape-2" />
      <div className="swirl-shape swirl-shape-3" />
    </div>
  );
}
