import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import Overview from "./pages/Overview.jsx";
import RealTimeMomentum from "./pages/RealTimeMomentum.jsx";
import StarGrowth from "./pages/StarGrowth.jsx";
import Repositories from "./pages/Repositories.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Dashboard />}>
        <Route index element={<Overview />} />
        <Route path="momentum" element={<RealTimeMomentum />} />
        <Route path="growth" element={<StarGrowth />} />
        <Route path="repositories" element={<Repositories />} />
      </Route>
    </Routes>
  );
}
