import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import Home from "./pages/home";
import TakerHome from "./pages/taker/TakerHome";
import HostHome from "./pages/host/HostHome";
import PrivateRoute from "./components/PrivateRoute";
import { injectColors, injectFonts, injectShadows } from "./constants";
import "./App.css";
// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "@/styles/Buttons.module.css";

function App() {
  useEffect(() => {
    injectColors(); // 색상 변수를 설정
    injectFonts(); // 폰트 변수를 설정
    injectShadows(); // 그림자 변수를 설정
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
            <PrivateRoute allowedRoles={["taker"]}>
              <TakerHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/host"
          element={
            <PrivateRoute allowedRoles={["host"]}>
              <HostHome />
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
