import styles from "@/styles/HostHome.module.css";
import logo from "@/assets/mainLogo.svg";

interface HostNavBarProps {}

const HostNavBar = ({}: HostNavBarProps) => {
  return (
    <div className="container">
      <div className="wrap">
        <img src={logo} alt="logo" />
        <div className="menu"></div>
      </div>
    </div>
  );
};

export default HostNavBar;
