// Custom date picker — renders a dropdown calendar with month navigation.
// Uses a 42-cell grid (6 weeks) for consistent layout.
// Supports compact variant for filter bars.
// Closes on click-outside and Escape key.
import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function toDateStr(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getTodayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

export default function MinimalDatePicker({ value, onChange, label, placeholder, style, compact }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const todayStr = getTodayStr();

  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false });

  const weeks = [];
  for (let i = 0; i < 42; i += 7) weeks.push(cells.slice(i, i + 7));

  function handleSelect(day, current) {
    if (!current) return;
    const dateStr = toDateStr(year, month, day);
    onChange(dateStr);
    setIsOpen(false);
  }

  const displayText = value ? formatDisplay(value) : (placeholder || 'Seleccionar fecha');

  return (
    <div className={`minimal-datepicker${compact ? ' minimal-datepicker--compact' : ''}`} style={style} ref={containerRef}>
      {label && <label className="form-label">{label}</label>}
      <button
        type="button"
        className="minimal-datepicker__trigger"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className={`minimal-datepicker__text ${!value ? 'minimal-datepicker__text--placeholder' : ''}`}>
          {displayText}
        </span>
        <Calendar size={16} className="minimal-datepicker__icon" />
      </button>
      {isOpen && (
        <div className="minimal-datepicker__dropdown">
          <div className="minimal-datepicker__header">
            <button type="button" className="minimal-datepicker__nav" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
              <ChevronLeft size={16} />
            </button>
            <span className="minimal-datepicker__month-year">
              {MONTHS[month]} {year}
            </span>
            <button type="button" className="minimal-datepicker__nav" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="minimal-datepicker__days-header">
            {DAYS.map(d => <span key={d} className="minimal-datepicker__day-name">{d}</span>)}
          </div>
          <div className="minimal-datepicker__grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="minimal-datepicker__week">
                {week.map((cell, ci) => {
                  const ds = cell.current ? toDateStr(year, month, cell.day) : '';
                  const classes = [
                    'minimal-datepicker__day',
                    cell.current ? 'minimal-datepicker__day--current' : 'minimal-datepicker__day--other',
                    ds === value ? 'minimal-datepicker__day--selected' : '',
                    ds === todayStr ? 'minimal-datepicker__day--today' : '',
                  ].filter(Boolean).join(' ');
                  return (
                    <button
                      key={ci}
                      type="button"
                      className={classes}
                      onClick={() => handleSelect(cell.day, cell.current)}
                      disabled={!cell.current}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
