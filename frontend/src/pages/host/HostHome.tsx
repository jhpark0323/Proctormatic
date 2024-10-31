import HostHeader from "@/components/HostHeader";
import Helpdesk from "./Helpdesk";
import Mypage from "./mypages/Mypage";
import MyTest from "./testpages/MyTest";
import MakeTest from "./testpages/MakeTest";

const HostHome = () => {
  return (
    <>
      <div style={{ overflowX: "hidden" }}>
        <HostHeader />
        <div style={{ marginTop: "75px" }}>
          <MakeTest />
        </div>
      </div>
    </>
  );
};

export default HostHome;
