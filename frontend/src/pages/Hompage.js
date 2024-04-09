import {Link} from "react-router-dom";

export default function HomePage() {

    return (
        <>
            <div className="row">
                <Link to="/call"><button>Make a new call</button></Link>
            </div>
        </>
    );
}