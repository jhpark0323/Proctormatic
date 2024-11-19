import HeaderWhite from "@/components/HeaderWhite";
import Faqs from "./faqs";
import Manuals from "./manuals";
import Questions from "./questions";
import styles from "@/styles/Helpdesk.module.css";

const Helpdesk = () => {
  return (
    <>
      <HeaderWhite />
      <div className={styles.helpdeskContainer}>
        <Faqs />
        <Manuals />
        <Questions />
      </div>
    </>
  );
};

export default Helpdesk;
