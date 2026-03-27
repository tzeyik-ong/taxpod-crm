import { useState, useRef, useEffect } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function fromISO(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`
}

// Show 12 years centred around the current view year
function buildYearRange(centreYear) {
  const start = centreYear - 5
  return Array.from({ length: 12 }, (_, i) => start + i)
}

export default function DatePickerInput({ value, onChange, placeholder = 'Select date' }) {
  const today    = new Date()
  const selected = fromISO(value)

  const [open,      setOpen]     = useState(false)
  const [viewYear,  setViewYear] = useState((selected ?? today).getFullYear())
  const [viewMonth, setViewMonth]= useState((selected ?? today).getMonth())
  const [mode,      setMode]     = useState('day') // 'day' | 'year'
  const containerRef             = useRef(null)

  // Sync view when opening
  useEffect(() => {
    if (open) {
      const d = selected ?? today
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
      setMode('day')
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function selectDay(day) {
    onChange(toISO(new Date(viewYear, viewMonth, day)))
    setOpen(false)
  }

  function selectYear(year) {
    setViewYear(year)
    setMode('day')
  }

  function clearDate(e) {
    e.stopPropagation()
    onChange('')
  }

  // Day grid
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const yearRange = buildYearRange(viewYear)

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value ? formatDisplay(selected) : placeholder}
        </span>
        <span className="flex items-center gap-1.5">
          {value && (
            <span onMouseDown={clearDate} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={13} />
            </span>
          )}
          <CalendarDays size={14} className="text-gray-400 shrink-0" />
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={mode === 'day' ? prevMonth : () => setViewYear(y => y - 12)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Clicking the label toggles year picker */}
            <button
              type="button"
              onClick={() => setMode(m => m === 'day' ? 'year' : 'day')}
              className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors px-1 rounded"
            >
              {mode === 'day'
                ? <>{MONTHS[viewMonth]} {viewYear}</>
                : <>{yearRange[0]} – {yearRange[yearRange.length - 1]}</>
              }
              <ChevronDown size={13} className={`transition-transform ${mode === 'year' ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={mode === 'day' ? nextMonth : () => setViewYear(y => y + 12)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* ── Year grid ── */}
          {mode === 'year' && (
            <div className="grid grid-cols-3 gap-1">
              {yearRange.map(yr => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => selectYear(yr)}
                  className={[
                    'text-sm py-1.5 rounded-lg transition-colors font-medium',
                    yr === viewYear
                      ? 'bg-blue-600 text-white'
                      : yr === today.getFullYear()
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-100',
                  ].join(' ')}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          {/* ── Day view ── */}
          {mode === 'day' && (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, i) => {
                  if (!day) return <div key={`e${i}`} />

                  const isSelected = selected &&
                    selected.getFullYear() === viewYear &&
                    selected.getMonth()    === viewMonth &&
                    selected.getDate()     === day

                  const isToday =
                    today.getFullYear() === viewYear &&
                    today.getMonth()    === viewMonth &&
                    today.getDate()     === day

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={[
                        'text-sm text-center py-1.5 rounded-lg transition-colors',
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold'
                          : isToday
                            ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100'
                            : 'text-gray-700 hover:bg-gray-100',
                      ].join(' ')}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              {/* Today shortcut */}
              <div className="mt-2 pt-2 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => { onChange(toISO(today)); setOpen(false) }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Today
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
