export default function LoadingSpinner({ size = 'md', text = '' }) {
  const px = { sm: 16, md: 20, lg: 28 }[size] || 20;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="spinner" style={{ width: px, height: px }}></div>
      {text && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{text}</p>}
    </div>
  );
}
