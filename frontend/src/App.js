import './App.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import RootPage from "./pages/RootPage";
import HomePage from "./pages/Hompage";
import DirectCallPage from "./pages/DirectCallPage";

const router = createBrowserRouter([
        {
            path: '/', element: <RootPage/>, children: [
                {path: '', element: <HomePage/>},
                {path: 'call', element: <DirectCallPage/>},
            ]
        }
    ]
)

function App() {

    return (
        <RouterProvider router={router}></RouterProvider>
    );
}

export default App;
