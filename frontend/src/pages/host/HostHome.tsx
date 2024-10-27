import React, { useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch";
import Checkbox from "@/components/Checkbox";
import Textfield from "@/components/Textfield";
import CustomButton from "@/components/CustomButton";
import CustomTooltip from "@/components/CustomTooltip";

const HostHome = () => {
  const [checkbox, toggleSwitch] = React.useState(false);
  const [name, setName] = useState("윤예리");

  return (
    <>
      {/* <ToggleSwitch>하이</ToggleSwitch>
      <Checkbox checked={checkbox} onChange={toggleSwitch}>
        하이
      </Checkbox> */}
      {/* <Textfield
        label="이름"
        helpMessage="이름을 입력하세요"
        placeholder="홍길동"
        trailingIcon={true}
        onChange={(value) => setName(value)}
      >
        {name}
      </Textfield> */}
      {/* <CustomButton label="ggg" onClick={() => alert("Button clicked!")} /> */}
      <CustomTooltip id="인사" content="하이" place="top-end">
        하이
      </CustomTooltip>
      <div>
        <h2>주최자 페이지</h2>
        <p>여기는 주최자를 위한 페이지입니다.</p>
      </div>
    </>
  );
};

export default HostHome;
