// Sortable table header — click to sort; shows up/down arrow icon
// for active column and a dual-arrow icon for inactive columns.
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function ThSortable({ campo, sortField, sortDirection, onSort, children, style, className }) {
  const isActive = sortField === campo;

  return (
    <th
      onClick={() => onSort(campo)}
      style={{ cursor: 'pointer', userSelect: 'none', ...style }}
      className={className}
    >
      <div className="d-flex align-items-center gap-1">
        {children}
        {isActive ? (
          sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
        ) : (
          <ArrowUpDown size={14} className="opacity-50" />
        )}
      </div>
    </th>
  );
}
