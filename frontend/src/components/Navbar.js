import {Link} from "react-router-dom";

export default function Navbar() {

    return (
        <div className="navbar">
            <nav>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link to="/" className="text-capitalize nav-link">home</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/" className="text-capitalize nav-link">call</Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}