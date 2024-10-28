import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CustomToast } from "@/components/CustomToast";
import Home from "@/pages/Home";
import TakerHome from "./pages/taker/TakerHome";
import TakerHome2 from "./pages/taker/TakerHome2";
import HostHome from "./pages/host/HostHome";
import PrivateRoute from "./components/PrivateRoute";
import { injectColors, injectFonts, injectShadows } from "./constants";
import "./App.css";
// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  useEffect(() => {
    injectColors(); // 색상 변수를 설정
    injectFonts(); // 폰트 변수를 설정
    injectShadows(); // 그림자 변수를 설정

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      CustomToast("감시 모듈이 작동중입니다.");
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      CustomToast("감시 모듈이 작동중입니다.");
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

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
          path="/taker2"
          element={
            <PrivateRoute allowedRoles={["taker"]}>
              <TakerHome2 />
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
