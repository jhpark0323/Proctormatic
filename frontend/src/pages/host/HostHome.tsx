import HostHeader from "@/components/HostHeader";
import Helpdesk from "./Helpdesk";
import Mypage from "./mypages/Mypage";
import MyTest from "./testpages/MyTest";

const HostHome = () => {
  return (
    <>
      <div style={{ overflowX: "hidden" }}>
        <HostHeader />
        {/* <Helpdesk /> */}
        {/* <Mypage /> */}
        <div style={{ marginTop: "75px" }}>
          <MyTest />
        </div>
      </div>
      {/* <div>
        <h2>주최자 페이지</h2>
        <p>여기는 주최자를 위한 페이지입니다.</p>
      </div> */}
    </>
  );
};

export default HostHome;
