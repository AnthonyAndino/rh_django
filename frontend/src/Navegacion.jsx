import { Link } from "react-router-dom";

export default function Navegacion() {
    return (
        <nav className="navbar navbar-expand-lg mb-4">
            <div className="container">
                <Link className="navbar-brand" to="/">RH React</Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div id="navMain" className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Listado</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/agregar">Agregar</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}