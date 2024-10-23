import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import Home from "./pages/Home";
import TakerHome from "./pages/taker/TakerHome";
import HostHome from "./pages/host/HostHome";
import PrivateRoute from "./components/PrivateRoute";
import { injectColors, injectFonts } from "./constants";
import "./App.css";

function App() {
  useEffect(() => {
    injectColors(); // 색상 변수를 설정
    injectFonts(); // 폰트 변수를 설정
  }, []);


  // const fetchUser = useAuthStore((state) => state.fetchUser);

  // useEffect(() => {
  //   fetchUser();
  // }, [fetchUser]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/taker"
          element={
            // <PrivateRoute allowedRoles={["taker"]}>
              <TakerHome />
            // </PrivateRoute>
          }
        />
        <Route
          path="/host"
          element={
            // <PrivateRoute allowedRoles={["host"]}>
              <HostHome />
            // </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
