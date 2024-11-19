import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PwdResetModal from "@/components/PwdResetModal";
import { usePwdResetStore } from '@/store/usePwdResetModal';
import axiosInstance from '@/utils/axios';
import { CustomToast } from "@/components/CustomToast";

jest.mock('@/utils/axios');
jest.mock('@/store/usePwdResetModal');
jest.mock('@/components/CustomToast', () => ({
  CustomToast: jest.fn()
}));

const mockUsePwdResetStore = usePwdResetStore as jest.MockedFunction<typeof usePwdResetStore>;
const mockStore = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  nameError: false,
  emailError: false,
  passwordError: false,
  confirmPasswordError: false,
  validateName: jest.fn(),
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
  validateConfirmPassword: jest.fn(),
  resetStore: jest.fn(),
};

mockUsePwdResetStore.mockReturnValue(mockStore);

describe("PwdResetModal 컴포넌트 테스트", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("제목과 서브타이틀이 정상적으로 표시되는지 확인", () => {
    render(<PwdResetModal onClose={mockOnClose} title="비밀번호 재설정" subtitle="비밀번호를 재설정하세요" />);
    expect(screen.getByText("비밀번호 재설정")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 재설정하세요")).toBeInTheDocument();
  });

  it("이름 입력 시 유효성 검사 함수가 호출되는지 확인", () => {
    render(<PwdResetModal onClose={mockOnClose} title="비밀번호 재설정" subtitle="비밀번호를 재설정하세요" />);
    fireEvent.change(screen.getByPlaceholderText("이름 입력"), { target: { value: "홍길동" } });
    expect(mockStore.validateName).toHaveBeenCalledWith("홍길동");
  });

  it("이메일 인증 버튼 클릭 시 로딩 상태로 변경되고 성공 메시지가 표시되는지 확인", async () => {
    (axiosInstance.post as jest.Mock).mockResolvedValueOnce({ status: 200 });
    render(<PwdResetModal onClose={mockOnClose} title="비밀번호 재설정" subtitle="비밀번호를 재설정하세요" />);
    mockStore.email = "test@example.com";
    
    fireEvent.click(screen.getByText("이메일 인증"));
    await waitFor(() => expect(CustomToast).toHaveBeenCalledWith("인증번호가 발송되었습니다."));
  });

  it("이메일 인증 실패 시 오류 메시지가 표시되는지 확인", async () => {
    (axiosInstance.post as jest.Mock).mockRejectedValueOnce(new Error("Request failed"));
    render(<PwdResetModal onClose={mockOnClose} title="비밀번호 재설정" subtitle="비밀번호를 재설정하세요" />);

    fireEvent.click(screen.getByText("이메일 인증"));
    await waitFor(() => {
      expect(CustomToast).toHaveBeenCalledWith("인증번호 발송에 실패했습니다.");
    });
  });
  
  it("컴포넌트 언마운트 시 Store가 초기화되는지 확인", () => {
    const { unmount } = render(<PwdResetModal onClose={mockOnClose} title="비밀번호 재설정" subtitle="비밀번호를 재설정하세요" />);
    unmount();
    expect(mockStore.resetStore).toHaveBeenCalled();
  });

  it("비밀번호 재설정 요청 성공 시 성공 메시지와 함께 모달 닫힘 확인", async () => {
    render(<PwdResetModal onClose={mockOnClose} title="비밀번호 재설정" subtitle="비밀번호를 재설정하세요" />);
    
    // 모든 필수 상태 설정
    mockUsePwdResetStore.mockReturnValue({
      ...mockStore,
      name: "홍길동",
      email: "test@example.com",
      password: "NewPassword123!",
      confirmPassword: "NewPassword123!",
      nameError: false,
      emailError: false,
      passwordError: false,
      confirmPasswordError: false,
    });

    // isEmailVerified 상태를 true로 설정
    const setEmailVerified = true;
    
    // API 모킹
    (axiosInstance.put as jest.Mock).mockResolvedValueOnce({ 
      status: 200,
      data: { message: "비밀번호가 성공적으로 변경되었습니다." }
    });

    const form = screen.getByTestId("reset-password-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(CustomToast).toHaveBeenCalledWith("비밀번호가 성공적으로 변경되었습니다.");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("비밀번호 재설정 요청 실패 시 오류 메시지가 표시되는지 확인", async () => {
    // API 에러 응답 모킹
    (axiosInstance.put as jest.Mock).mockRejectedValueOnce({
      response: { 
        status: 400,
        data: { message: "비밀번호 변경에 실패했습니다." }
      }
    });
  
    // 유효한 상태로 설정
    const validMockStore = {
      ...mockStore,
      name: "홍길동",
      email: "test@example.com",
      password: "NewPassword123!",
      confirmPassword: "NewPassword123!",
      nameError: false,
      emailError: false,
      passwordError: false,
      confirmPasswordError: false,
    };
    mockUsePwdResetStore.mockReturnValue(validMockStore);
  
    const { rerender } = render(
      <PwdResetModal onClose={mockOnClose} title="비밀번호 재설정" subtitle="비밀번호를 재설정하세요" />
    );
  
    // 이메일 인증 상태 설정
    const setEmailVerified = true;
    rerender(
      <PwdResetModal onClose={mockOnClose} title="비밀번호 재설정" subtitle="비밀번호를 재설정하세요" />
    );
  
    // form submit 이벤트 발생
    const form = screen.getByTestId("reset-password-form");
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(CustomToast).toHaveBeenCalledWith("비밀번호 변경에 실패했습니다.");
    });
  });

  it("비밀번호와 확인 비밀번호가 일치하지 않으면 오류 메시지가 표시되는지 확인", () => {
    // 초기 상태 설정
    const updatedMockStore = {
      ...mockStore,
      password: "password123!",
      confirmPassword: "differentPassword!",
      confirmPasswordError: true
    };
    mockUsePwdResetStore.mockReturnValue(updatedMockStore);
  
    render(<PwdResetModal onClose={mockOnClose} title="비밀번호 재설정" subtitle="비밀번호를 재설정하세요" />);
  
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "password123!" } });
    fireEvent.change(screen.getByTestId("new-password-input"), { target: { value: "differentPassword!" } });
  
    expect(screen.getByTestId("check-password")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 다시 입력해주세요.")).toBeInTheDocument();
  });
});
