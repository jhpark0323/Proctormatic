import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginModal from "@/components/LoginModal";
import { useAuthStore } from '@/store/useAuthStore';

jest.mock('@/store/useAuthStore');

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockHostLogin = jest.fn();
const mockTakerLogin = jest.fn();
mockUseAuthStore.mockReturnValue({
  hostLogin: mockHostLogin,
  takerLogin: mockTakerLogin,
});

describe("LoginModal 컴포넌트 테스트", () => {
  const mockOnClose = jest.fn();
  const mockOnRegisterClick = jest.fn();
  const mockOnEmailFindClick = jest.fn();
  const mockOnPwdResetClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("주최자 로그인을 선택 시 호스트 로그인 화면으로 전환되는지 확인", () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        onRegisterClick={mockOnRegisterClick}
        onEmailFindClick={mockOnEmailFindClick}
        onPwdResetClick={mockOnPwdResetClick}
        title="로그인"
        subtitle="로그인을 진행하세요"
      />
    );

    fireEvent.click(screen.getByTestId("host-login"));
    expect(screen.getByPlaceholderText("이메일 주소 입력")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("비밀번호 입력")).toBeInTheDocument();
  });

  it("응시자 로그인을 선택 시 takerLogin 함수 호출 및 모달 닫힘 확인", () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        onRegisterClick={mockOnRegisterClick}
        onEmailFindClick={mockOnEmailFindClick}
        onPwdResetClick={mockOnPwdResetClick}
        title="로그인"
        subtitle="로그인을 진행하세요"
      />
    );

    fireEvent.click(screen.getByTestId("taker-login-button"));
    expect(mockTakerLogin).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("이메일, 비밀번호 입력 후 로그인 버튼 클릭 시 hostLogin 호출 확인", async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        onRegisterClick={mockOnRegisterClick}
        onEmailFindClick={mockOnEmailFindClick}
        onPwdResetClick={mockOnPwdResetClick}
        title="로그인"
        subtitle="로그인을 진행하세요"
      />
    );

    fireEvent.click(screen.getByTestId("host-login"));

    fireEvent.change(screen.getByPlaceholderText("이메일 주소 입력"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("비밀번호 입력"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => expect(mockHostLogin).toHaveBeenCalledWith("test@example.com", "password123"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("이메일 또는 비밀번호가 누락된 경우 오류 메시지가 표시되는지 확인", () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        onRegisterClick={mockOnRegisterClick}
        onEmailFindClick={mockOnEmailFindClick}
        onPwdResetClick={mockOnPwdResetClick}
        title="로그인"
        subtitle="로그인을 진행하세요"
      />
    );

    fireEvent.click(screen.getByTestId("host-login"));

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    expect(screen.getByText("이메일과 비밀번호를 모두 입력해주세요.")).toBeInTheDocument();
  });

  it("로그인 실패 시 오류 메시지가 표시되는지 확인", async () => {
    mockHostLogin.mockRejectedValue(new Error("로그인 실패"));
    render(
      <LoginModal
        onClose={mockOnClose}
        onRegisterClick={mockOnRegisterClick}
        onEmailFindClick={mockOnEmailFindClick}
        onPwdResetClick={mockOnPwdResetClick}
        title="로그인"
        subtitle="로그인을 진행하세요"
      />
    );

    fireEvent.click(screen.getByTestId("host-login"));

    fireEvent.change(screen.getByPlaceholderText("이메일 주소 입력"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("비밀번호 입력"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() =>
      expect(screen.getByText("로그인 실패: 이메일 또는 비밀번호를 확인하세요.")).toBeInTheDocument()
    );
  });

  it("비밀번호 입력창의 취소 버튼 클릭 시 비밀번호가 초기화되는지 확인", () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        onRegisterClick={mockOnRegisterClick}
        onEmailFindClick={mockOnEmailFindClick}
        onPwdResetClick={mockOnPwdResetClick}
        title="로그인"
        subtitle="로그인을 진행하세요"
      />
    );

    fireEvent.click(screen.getByTestId("host-login"));

    const passwordInput = screen.getByPlaceholderText("비밀번호 입력");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput).toHaveValue("password123");

    fireEvent.click(screen.getByAltText("reset"));
    expect(passwordInput).toHaveValue("");
  });

  it("회원가입, 아이디 찾기, 비밀번호 재설정 링크 클릭 시 각각의 핸들러가 호출되는지 확인", () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        onRegisterClick={mockOnRegisterClick}
        onEmailFindClick={mockOnEmailFindClick}
        onPwdResetClick={mockOnPwdResetClick}
        title="로그인"
        subtitle="로그인을 진행하세요"
      />
    );

    fireEvent.click(screen.getByTestId("host-login"));
    fireEvent.click(screen.getByText("회원가입"));
    expect(mockOnRegisterClick).toHaveBeenCalled();

    fireEvent.click(screen.getByText("아이디 찾기"));
    expect(mockOnEmailFindClick).toHaveBeenCalled();

    fireEvent.click(screen.getByText("비밀번호 재설정"));
    expect(mockOnPwdResetClick).toHaveBeenCalled();
  });

  it("모달 닫기 버튼 클릭 시 onClose가 호출되는지 확인", () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        onRegisterClick={mockOnRegisterClick}
        onEmailFindClick={mockOnEmailFindClick}
        onPwdResetClick={mockOnPwdResetClick}
        title="로그인"
        subtitle="로그인을 진행하세요"
      />
    );

    fireEvent.click(screen.getByAltText("close"));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
