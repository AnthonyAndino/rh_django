import { Outlet, useLocation } from 'react-router-dom'

// Layout persistente para auth: se monta una sola vez como <Route> padre.
// Evita el flash blanco porque el fondo oscuro + esferas nunca se desmontan
// al navegar entre /login, /registro y /recuperar — solo cambia <Outlet />.
// La variante de esferas se define por ruta para invertir posiciones en registro.
export default function AuthLayout() {
  const location = useLocation()
  const layoutClass = location.pathname === '/registro'
    ? 'auth-layout auth-layout--inverted'
    : 'auth-layout auth-layout--default'

  return (
    <div className={layoutClass}>
      <Outlet />
    </div>
  )
}
