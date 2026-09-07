export default function BlinkingDots() {
  return (
    <span className="inline-flex gap-0.5 ml-0.5">
      <span className="animate-dotBlink" style={{ animationDelay: "0s" }}>.</span>
      <span className="animate-dotBlink" style={{ animationDelay: "0.2s" }}>.</span>
      <span className="animate-dotBlink" style={{ animationDelay: "0.4s" }}>.</span>
    </span>
  );
}
