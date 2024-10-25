import React from "react";
import ToggleSwitch from "@/components/ToggleSwitch";
import Checkbox from "@/components/Checkbox";
import Textfield from "@/components/Textfield";

const HostHome = () => {
  const [checkbox, toggleSwitch] = React.useState(false);
  return (
    <>
      {/* <ToggleSwitch>하이</ToggleSwitch>
      <Checkbox checked={checkbox} onChange={toggleSwitch}>
        하이
      </Checkbox> */}
      <Textfield></Textfield>
      <div>
        <h2>주최자 페이지</h2>
        <p>여기는 주최자를 위한 페이지입니다.</p>
      </div>
    </>
  );
};

export default HostHome;
