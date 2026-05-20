export default function LoadingSpinner({ size = 'md', text = '' }) {
  const px = { sm: 20, md: 28, lg: 40 }[size] || 28;
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="spinner" style={{ width: px, height: px }}></div>
      {text && <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{text}</p>}
    </div>
  );
}
