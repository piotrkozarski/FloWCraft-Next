import { Fragment, useEffect } from "react"
import { X } from "lucide-react"

export default function Modal({
  open, onClose, title, children, width = "max-w-lg"
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string }) {
  
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full ${width} rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--glow)] transform transition-all duration-150 ease-out`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--accent)]">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md hover:bg-[color-mix(in_oklab,var(--primary) 20%,transparent)] text-[var(--accent)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  )
}