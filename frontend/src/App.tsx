import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CustomToast } from "@/components/CustomToast";
import Home from "@/pages/Home";
import TakerHome from "./pages/taker/TakerHome";
import TakerHome2 from "./pages/taker/TakerHome2";
import PrivateRoute from "./components/PrivateRoute";
import { injectColors, injectFonts, injectShadows } from "./constants";
import "./App.css";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExamPage from "./pages/taker/ExamPage";

// host
import AccountInfo from "./pages/host/mypages/AccountInfo";
import MyCoin from "./pages/host/mypages/MyCoin";
import Mypage from "./pages/host/mypages/Mypage";
import MakeTest from "./pages/host/testpages/MakeTest";
import MyTest from "./pages/host/testpages/MyTest";
import TestDetail from "./pages/host/testpages/TestDetail";
import Helpdesk from "./pages/host/helpdesks/Helpdesk";

function App() {
  useEffect(() => {
    injectColors(); // 색상 변수를 설정
    injectFonts(); // 폰트 변수를 설정
    injectShadows(); // 그림자 변수를 설정

    // const handleCopy = (e: ClipboardEvent) => {
    //   e.preventDefault();
    //   CustomToast("감시 모듈이 작동중입니다.");
    // };
    // const handlePaste = (e: ClipboardEvent) => {
    //   e.preventDefault();
    //   CustomToast("감시 모듈이 작동중입니다.");
    // };

    // document.addEventListener("copy", handleCopy);
    // document.addEventListener("paste", handlePaste);

    // return () => {
    //   document.removeEventListener("copy", handleCopy);
    //   document.removeEventListener("paste", handlePaste);
    // };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* taker */}
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
          path="/taker/:examId"
          element={
            <PrivateRoute allowedRoles={["taker"]}>
              <ExamPage />
            </PrivateRoute>
          }
        />

        {/* host */}
        <Route
          path="/host/mypage/"
          element={
            <PrivateRoute allowedRoles={["host"]}>
              <Mypage />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/myPage/accounfInfo"
          element={
            <PrivateRoute allowedRoles={["host"]}>
              <AccountInfo />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/myPage/coinInfo"
          element={
            <PrivateRoute allowedRoles={["host"]}>
              <MyCoin />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/newTest/"
          element={
            <PrivateRoute allowedRoles={["host"]}>
              <MakeTest />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/myTest/"
          element={
            <PrivateRoute allowedRoles={["host"]}>
              <MyTest />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/test/:id"
          element={
            <PrivateRoute allowedRoles={["host"]}>
              <TestDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/host/helpdesk"
          element={
            <PrivateRoute allowedRoles={["host"]}>
              <Helpdesk />
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
