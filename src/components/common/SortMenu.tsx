import { useEffect, useRef, useState } from 'react'
import { IoSwapVerticalOutline } from 'react-icons/io5'

interface SortMenuProps<T extends string> {
  value: T
  options: Record<T, string>
  onChange: (key: T) => void
}

export function SortMenu<T extends string>({ value, options, onChange }: SortMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  const keys = Object.keys(options) as T[]

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Trier"
        className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
      >
        <IoSwapVerticalOutline size={18} />
      </button>
      {open && (
        <ul className="absolute right-0 z-20 mt-1 min-w-[10rem] rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 shadow-lg overflow-hidden">
          {keys.map((key) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => {
                  onChange(key)
                  setOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-violet-50 dark:hover:bg-violet-950 ${
                  key === value ? 'font-semibold text-violet-600' : ''
                }`}
              >
                {options[key]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
