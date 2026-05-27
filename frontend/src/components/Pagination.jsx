// Pagination component — renders page buttons with ellipsis truncation.
// getPageRange uses a siblings=1 window: [first] ... [prev, current, next] ... [last].
// Strings '...' are rendered as ellipsis spans instead of buttons.
import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageRange(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const siblings = 1;

  pages.push(1);

  const rangeStart = Math.max(2, current - siblings);
  const rangeEnd = Math.min(total - 1, current + siblings);

  if (rangeStart > 3) {
    pages.push('...');
  } else if (rangeStart > 2) {
    pages.push(2);
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < total - 2) {
    pages.push('...');
  } else if (rangeEnd < total - 1) {
    pages.push(total - 1);
  }

  pages.push(total);

  return pages;
}

export default function Pagination({ paginaActual, totalPaginas, onPageChange, total, inicio, fin }) {
  if (totalPaginas <= 1) return null;

  const pages = getPageRange(paginaActual, totalPaginas);

  return (
    <div className="d-flex align-items-center justify-content-between px-4 py-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
      <span className="text-secondary small">
        Mostrando {inicio + 1}-{fin} de {total} resultados
      </span>
      <nav className="d-flex align-items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, paginaActual - 1))}
          disabled={paginaActual === 1}
          className="btn btn-sm d-flex align-items-center gap-1 text-secondary"
          style={{ border: 'none', background: 'none' }}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        {pages.map((pag, i) =>
          pag === '...' ? (
            <span key={`ellipsis-${i}`} className="text-secondary" style={{ fontSize: '0.85rem', width: 24, textAlign: 'center', userSelect: 'none' }}>
              &hellip;
            </span>
          ) : (
            <button
              key={pag}
              onClick={() => onPageChange(pag)}
              className="btn btn-sm d-flex align-items-center justify-content-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                padding: 0,
                border: 'none',
                background: pag === paginaActual ? 'var(--primary-terracotta)' : 'transparent',
                color: pag === paginaActual ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: pag === paginaActual ? 700 : 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (pag !== paginaActual) {
                  e.currentTarget.style.background = 'var(--accent-cream)';
                  e.currentTarget.style.color = 'var(--text-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (pag !== paginaActual) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              {pag}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPaginas, paginaActual + 1))}
          disabled={paginaActual === totalPaginas}
          className="btn btn-sm d-flex align-items-center gap-1 text-secondary"
          style={{ border: 'none', background: 'none' }}
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
