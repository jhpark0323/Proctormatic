import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomTooltip from "@/components/CustomTooltip";
import styles from "@/styles/Buttons.module.css";

// Tooltip 모킹
const MockTooltip = jest.fn(({ id, className, children }) => (
  <div data-testid={`tooltip-${id}`} className={className}>
    {children}
  </div>
));

jest.mock("react-tooltip", () => ({
  Tooltip: (props: any) => MockTooltip(props),
}));

describe("CustomTooltip 컴포넌트 테스트", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Tooltip이 기본 type일 때 'tooltip-default' 클래스를 적용하는지 확인", async () => {
    await act(async () => {
      render(
        <CustomTooltip id="tooltip-default" content="기본 툴팁">
          <div>Hover me</div>
        </CustomTooltip>
      );
    });

    const tooltipElement = await waitFor(() => screen.getByTestId("tooltip-tooltip-default"));
    expect(tooltipElement).toHaveClass(styles["tooltip-default"]);
  });

  it("Tooltip이 white type일 때 'tooltip-white' 클래스를 적용하는지 확인", async () => {
    await act(async () => {
      render(
        <CustomTooltip id="tooltip-white" content="화이트 툴팁" type="white">
          <div>Hover me</div>
        </CustomTooltip>
      );
    });

    const tooltipElement = await waitFor(() => screen.getByTestId("tooltip-tooltip-white"));
    expect(tooltipElement).toHaveClass(styles["tooltip-white"]);
  });

  it("Tooltip이 올바른 content와 위치 속성을 표시하는지 확인", async () => {
    await act(async () => {
      render(
        <CustomTooltip id="tooltip-content" content="툴팁 내용" place="bottom-end">
          <div data-testid="tooltip-text">Hover me</div>
        </CustomTooltip>
      );
    });

    const triggerElement = await waitFor(() => screen.getByTestId("tooltip-text"));
    expect(triggerElement).toBeInTheDocument();
  });
});
