import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RegisterModal from "@/components/RegisterModal";
import { useRegisterStore } from '@/store/useRegisterStore';
import axiosInstance from '@/utils/axios';

jest.mock('@/utils/axios');
jest.mock('@/store/useRegisterStore');

// Register store 상태 초기화
const mockUseRegisterStore = useRegisterStore as jest.MockedFunction<typeof useRegisterStore>;
const mockStore = {
  // 필드 값들
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthYear: '2000',
  birthMonth: '1',
  birthDay: '1',

  // 오류 상태들
  nameError: false,
  emailError: false,
  passwordError: false,
  confirmPasswordError: false,

  // 동의 상태
  allChecked: false,
  requiredChecks: false,
  marketingChecked: false,
  policy: false,
  marketing: false,

  // 동작 함수들
  validateName: jest.fn(),
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
  validateConfirmPassword: jest.fn(),
  setBirthYear: jest.fn(),
  setBirthMonth: jest.fn(),
  setBirthDay: jest.fn(),
  handleAllCheck: jest.fn(),
  handleRequiredCheck: jest.fn(),
  handleMarketingCheck: jest.fn(),
  updateBirth: jest.fn(),
  resetStore: jest.fn(),
  validateAllFields: jest.fn(),
};

mockUseRegisterStore.mockReturnValue(mockStore);

describe("RegisterModal 컴포넌트 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("제목과 서브타이틀이 렌더링 되는지 확인", () => {
    render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);
    expect(screen.getByTestId("modal-title")).toHaveTextContent("회원가입");
    expect(screen.getByTestId("modal-subtitle")).toHaveTextContent("회원가입 내용을 입력하세요");
  });

  it("이름 입력 후 유효성 검사 실행", () => {
    render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);
    fireEvent.change(screen.getByPlaceholderText("이름 입력"), { target: { value: "홍길동" } });
    expect(mockStore.validateName).toHaveBeenCalledWith("홍길동");
  });

  it("이메일 입력 후 인증 요청 버튼 클릭 시 로딩 상태로 변경", async () => {
    // axiosInstance.post를 성공 응답으로 모킹
    (axiosInstance.post as jest.Mock).mockResolvedValueOnce({ status: 200 });

    render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);
    mockStore.email = "test@example.com";
    // 이메일 인증 버튼 클릭
    fireEvent.click(screen.getByTestId('email-send-button'));
    // info-box의 텍스트가 표시되는지 확인
    await waitFor(() => expect(screen.getByTestId('info-box')).toBeInTheDocument());
  });

  // it("모든 필드가 유효하지 않으면 오류 메시지 표시", () => {
  //   render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);

  //   fireEvent.click(screen.getByText("회원가입"));
  //   expect(screen.getByText("올바른 이름을 입력해주세요.")).toBeInTheDocument();
  //   expect(screen.getByText("올바른 이메일을 입력해주세요.")).toBeInTheDocument();
  //   expect(screen.getByText("문자, 숫자, 기호를 조합하여 8자 이상 입력하세요.")).toBeInTheDocument();
  // });

  // it("생년월일 입력 시 값이 업데이트되는지 확인", () => {
  //   render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);

  //   fireEvent.change(screen.getByDisplayValue("2000"), { target: { value: "1990" } });
  //   expect(mockStore.setBirthYear).toHaveBeenCalledWith("1990");
  // });

  // it("이메일 인증이 완료되면 '인증완료' 표시", () => {
  //   render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);
  //   mockStore.email = "test@example.com";
    
  //   fireEvent.click(screen.getByText("이메일 인증"));
  //   expect(screen.getByText("인증완료")).toBeInTheDocument();
  // });

  // it("필수 약관 체크하지 않고 회원가입 시도 시 오류 메시지 표시", () => {
  //   render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);

  //   fireEvent.click(screen.getByText("회원가입"));
  //   expect(screen.getByText("필수 항목에 동의해주세요.")).toBeInTheDocument();
  // });

  // it("유효한 정보로 회원가입 완료 후 닫기 동작 확인", async () => {
  //   const mockOnClose = jest.fn();
  //   render(<RegisterModal onClose={mockOnClose} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);

  //   mockStore.validateAllFields.mockReturnValue(true);
  //   mockStore.policy = true;
  //   mockStore.email = "test@example.com";
  //   mockStore.password = "ValidPass123!";
  //   mockStore.confirmPassword = "ValidPass123!";
  //   mockStore.name = "홍길동";

  //   fireEvent.click(screen.getByText("회원가입"));
  //   await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
  //   expect(screen.getByText("회원가입이 완료되었습니다.")).toBeInTheDocument();
  // });
});
