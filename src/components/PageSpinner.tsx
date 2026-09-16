export default function PageSpinner() {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <span className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
