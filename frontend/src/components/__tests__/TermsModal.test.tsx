import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TermsModal from "@/components/TermsModal";

// useNavigate 모의 함수를 통해 이동 기능 테스트
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("TermsModal 컴포넌트 테스트", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (isOpen = true) =>
    render(
      <MemoryRouter>
        <TermsModal isOpen={isOpen} onClose={mockOnClose} onConfirm={mockOnConfirm} dataTestId="terms-modal" />
      </MemoryRouter>
    );

  it("모달이 열릴 때 정상적으로 렌더링되는지 확인", () => {
    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("이용약관 및 개인정보 처리 방침에 동의해 주세요.")
    ).toBeInTheDocument();
  });

  it("모달 외부 클릭 시 모달이 닫히는지 확인", () => {
    renderModal();
    fireEvent.click(screen.getByRole("dialog"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("‘모두 동의’ 체크박스를 선택하면 모든 체크박스가 선택되는지 확인", () => {
    renderModal();
    const allCheckbox = screen.getByLabelText("모두 동의합니다.");
    fireEvent.click(allCheckbox);

    expect(screen.getByLabelText("[필수] 이용약관 동의")).toBeChecked();
    expect(screen.getByLabelText("[필수] 위치기반 서비스 이용약관 동의")).toBeChecked();
    expect(screen.getByLabelText("[필수] 개인정보처리방침 동의")).toBeChecked();
    expect(screen.getByLabelText("[필수] 본석을 위한 영상 및 사진 활용에 동의")).toBeChecked();
    expect(screen.getByLabelText("[필수] 만 14세 이상이에요.")).toBeChecked();
  });

  it("개별 체크박스를 선택하면 ‘모두 동의’ 체크박스가 상태를 올바르게 업데이트하는지 확인", () => {
    renderModal();
    const termsCheckbox = screen.getByLabelText("[필수] 이용약관 동의");

    fireEvent.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();

    const allCheckbox = screen.getByLabelText("모두 동의합니다.");
    expect(allCheckbox).not.toBeChecked();

    fireEvent.click(screen.getByLabelText("[필수] 위치기반 서비스 이용약관 동의"));
    fireEvent.click(screen.getByLabelText("[필수] 개인정보처리방침 동의"));
    fireEvent.click(screen.getByLabelText("[필수] 본석을 위한 영상 및 사진 활용에 동의"));
    fireEvent.click(screen.getByLabelText("[필수] 만 14세 이상이에요."));

    expect(allCheckbox).toBeChecked();
  });

  it("필수 항목을 모두 체크하지 않고 ‘다음으로’ 버튼 클릭 시 툴팁이 표시되는지 확인", async () => {
    renderModal();

    const confirmButton = screen.getByText("다음으로");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      const tooltipContent = screen.getByTestId("tooltip-content");
      expect(tooltipContent).toHaveAttribute("data-tooltip-content", "필수 내용을 모두 동의해주세요");
    });
  });

  it("모든 필수 항목 동의 시 약관 페이지로 이동되는지 확인", async () => {
    renderModal();
    const allCheckbox = screen.getByLabelText("모두 동의합니다.");
    fireEvent.click(allCheckbox);

    const confirmButton = screen.getByText("다음으로");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/taker2");
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });
});
