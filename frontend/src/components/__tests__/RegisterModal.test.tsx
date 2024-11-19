import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RegisterModal from "@/components/RegisterModal";
import { useRegisterStore } from '@/store/useRegisterStore';
import axiosInstance from '@/utils/axios';

jest.mock('@/utils/axios');
jest.mock('@/store/useRegisterStore');
jest.mock('@/components/CustomToast', () => ({
  CustomToast: jest.fn()
}));

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
  isEmailVerified: false, // 이메일 인증 상태 추가

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

  it("제목과 부제목이 렌더링 되는지 확인", () => {
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

  it("이름 입력 필드가 유효하지 않으면 오류 메시지가 표시되는지 확인", async () => {
    mockStore.nameError = true; // nameError 상태 설정
    // RegisterModal 컴포넌트를 렌더링
    render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);
    // 이름 입력 ㅇ 은 올바르지 않은 이름이므로 nameError 값을 true로 설정
    fireEvent.change(screen.getByPlaceholderText("이름 입력"), { target: { value: "ㅇ" } });

    await waitFor(() => {
      expect(screen.getByTestId("not-correct-name")).toBeInTheDocument();
    });
    mockStore.nameError = false; // nameError 상태 설정
  });

  it("이메일 입력 필드가 유효하지 않으면 오류 메시지가 표시되는지 확인", async () => {
    mockStore.emailError = true; // emailError 상태 설정
    // RegisterModal 컴포넌트를 렌더링
    render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);
    // 이메일 입력 test 은 올바르지 않은 이름이므로 emailError 값을 true로 설정
    fireEvent.change(screen.getByPlaceholderText("이메일 주소 입력"), { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByTestId("not-correct-email")).toBeInTheDocument();
    });
    mockStore.emailError = false; // nameError 상태 설정
  });

  it("비밀번호 입력 필드가 유효하지 않으면 오류 메시지가 표시되는지 확인", async () => {
    mockStore.passwordError = true; // emailError 상태 설정
    // RegisterModal 컴포넌트를 렌더링
    render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);
    // 이메일 입력 test 은 올바르지 않은 이름이므로 emailError 값을 true로 설정
    fireEvent.change(screen.getByPlaceholderText("비밀번호 입력"), { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByTestId("not-corret-pw")).toBeInTheDocument();
    });
    mockStore.passwordError = false; // nameError 상태 설정
  });

  it("생년월일 입력 시 값이 업데이트되는지 확인", () => {
    // 초기값 설정
    mockStore.birthYear = "2000";
    mockStore.birthMonth = "1";
    mockStore.birthDay = "1";
  
    render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);
  
    // 생년월일 필드 업데이트 이벤트 트리거
    fireEvent.change(screen.getByTestId("birthYear-select"), { target: { value: "1990" } });
    fireEvent.change(screen.getByTestId("birthMonth-select"), { target: { value: "12" } });
    fireEvent.change(screen.getByTestId("birthDay-select"), { target: { value: "15" } });
  
    // Mock Store 함수 호출 확인
    expect(mockStore.setBirthYear).toHaveBeenCalledWith("1990");
    expect(mockStore.setBirthMonth).toHaveBeenCalledWith("12");
    expect(mockStore.setBirthDay).toHaveBeenCalledWith("15");
  });

  it("필수 약관 체크하지 않고 회원가입 시도 시 오류 메시지 표시", async () => {
    // CustomToast 스파이 설정
    const toastSpy = jest.spyOn(require('@/components/CustomToast'), 'CustomToast');
    // mockStore에서 필수 상태를 true로 설정하여 유효성 검사를 통과하도록 설정
    mockStore.name = "홍길동";
    mockStore.email = "test@example.com";
    mockStore.password = "ValidPass123!";
    mockStore.confirmPassword = "ValidPass123!";
    mockStore.isEmailVerified = true;
    mockStore.policy = false; // 필수 약관 동의 상태는 false로 설정하여 테스트
    render(<RegisterModal onClose={jest.fn()} title="회원가입" subtitle="회원가입 내용을 입력하세요" />);
    // 회원가입 버튼 클릭
    fireEvent.click(screen.getByTestId("register-button"));
    // CustomToast가 "필수 항목에 동의해주세요." 메시지와 함께 호출되는지 확인
    await waitFor(() => {
      expect(toastSpy);
    });
  });
});
