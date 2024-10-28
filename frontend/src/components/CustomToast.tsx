import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 사용법
// import { CustomToast } from "@/components/CustomToast";
// const handleToast = () => {
//  CustomToast("Toast 내용");
// };
// <button onClick={handleToast}>안녕</button>

const CustomToast = (content: string) => {
  toast(content, {
    position: "bottom-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
    theme: "dark",
    closeButton: false,
    style: {
      borderRadius: "40px",
      height: "40px",
      minHeight: 0,
      padding: 0,
      textAlign: "center",
      backgroundColor: "var(--GRAY_800)",
      font: "inherit",
    },
  });
};

export { CustomToast };
