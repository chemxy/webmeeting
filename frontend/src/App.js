import './App.css';
import {createBrowserRouter} from "react-router-dom";
import RootPage from "./RootPage";
import HomePage from "./pages/Hompage";
import DirectCallPage from "./pages/DirectCallPage";

const routes = createBrowserRouter(
    {
        path: '', element: RootPage, children: [
            {path: '', element: HomePage},
            {path: 'direct-call', element: DirectCallPage},
        ]
    }
)

function App() {


}

export default App;
