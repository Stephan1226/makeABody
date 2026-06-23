export default function Spinner() {
  return (
    <div className="flex h-[60dvh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}
