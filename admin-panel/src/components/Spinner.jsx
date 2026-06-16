export default function Spinner({ className = '' }) {
  return (
    <div className={`flex justify-center py-12 ${className}`} role="status" aria-label="Yükleniyor">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-red-800" />
    </div>
  )
}
