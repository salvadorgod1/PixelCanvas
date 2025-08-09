import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Viewer from "./pages/Viewer";


function App() {
  console.log(import.meta.env);
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/photo/:id" element={<Viewer />} />
      </Routes>
    </>
  );
}

export default App;
