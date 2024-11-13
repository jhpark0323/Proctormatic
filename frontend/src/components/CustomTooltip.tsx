import styles from "@/styles/Buttons.module.css";
import { Tooltip } from "react-tooltip";

// 사용법
// content에는 tooltip 안에 넣을 내용을 적는다.
// <CustomTooltip id="인사" content="하이" type="white" place="top-end">
// tooltip이 뜰 컴포넌트를 적는다.
// </CustomTooltip> */}

interface CustomTooltipProps {
  id: string;
  content: string;
  place?:
    | "top"
    | "top-start"
    | "top-end"
    | "right"
    | "right-start"
    | "right-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-start"
    | "left-end";
  type?: "default" | "white";
  children: React.ReactNode;
}

const CustomTooltip = ({
  id,
  content,
  children,
  place = "top",
  type = "default",
}: CustomTooltipProps) => {
  return (
    <>
      <span
        data-tooltip-id={id}
        data-tooltip-content={content}
        data-tooltip-place={place}
        data-testid="tooltip-content"  // 테스트를 위해 추가
      >
        {children}
      </span>
      <Tooltip
        id={id}
        className={
          type === "white" ? styles["tooltip-white"] : styles["tooltip-default"]
        }
      />
    </>
  );
};

export default CustomTooltip;
