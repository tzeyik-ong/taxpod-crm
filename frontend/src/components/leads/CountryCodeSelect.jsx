import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export default function CountryCodeSelect({ options, value, onChange }) {
  const [open,   setOpen]   = useState(false)
  const [query,  setQuery]  = useState('')
  const containerRef        = useRef(null)
  const searchRef           = useRef(null)
  const listRef             = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const filtered = query.trim()
    ? options.filter(o =>
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        o.code.includes(query) ||
        o.countryCode.toLowerCase().includes(query.toLowerCase())
      )
    : options

  const selected = options.find(o => o.code === value) ?? options[0]

  // Open → focus search + reset
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => searchRef.current?.focus(), 0)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const item = listRef.current.children[activeIdx]
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function select(code) {
    onChange(code)
    setOpen(false)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[activeIdx]) select(filtered[activeIdx].code)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Reset active index when query changes
  useEffect(() => { setActiveIdx(0) }, [query])

  function highlight(text, q) {
    if (!q.trim()) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-gray-900 rounded">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <div ref={containerRef} className="relative w-52 shrink-0">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-1 border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
      >
        <span className="truncate">
          {selected ? `${selected.code} (${selected.countryCode})` : 'Select'}
        </span>
        <ChevronDown size={14} className="shrink-0 text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search country or code…"
                className="flex-1 text-sm bg-transparent outline-none"
              />
            </div>
          </div>

          {/* List */}
          <ul ref={listRef} className="overflow-y-auto max-h-52 py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No results</li>
            ) : (
              filtered.map((o, i) => (
                <li
                  key={o.countryCode}
                  onMouseDown={() => select(o.code)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer ${
                    i === activeIdx ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base leading-none">{o.flag}</span>
                  <span className="font-mono text-xs w-10 shrink-0 text-gray-500">{o.code}</span>
                  <span className="truncate">{highlight(o.name, query)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
