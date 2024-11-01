import { create } from 'zustand';

// 상태 인터페이스 정의
interface RegisterState {
  // 입력 필드 상태
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birth: string;

  // 에러 상태
  nameError: boolean;
  emailError: boolean;
  passwordError: boolean;
  confirmPasswordError: boolean;

  // 약관 동의 상태
  allChecked: boolean;
  requiredChecks: boolean[];
  marketingChecked: boolean;
  policy: boolean;
  marketing: boolean;

  // 상태 업데이트를 위한 액션들
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setBirthYear: (year: string) => void;
  setBirthMonth: (month: string) => void;
  setBirthDay: (day: string) => void;
  updateBirth: () => void;

  // 유효성 검사를 위한 액션들
  validateName: (name: string) => void;
  validateEmail: (email: string) => void;
  validatePassword: (password: string) => void;
  validateConfirmPassword: (confirmPassword: string) => void;

  // 약관 동의 처리를 위한 액션들
  handleAllCheck: (checked: boolean) => void;
  handleRequiredCheck: (index: number, checked: boolean) => void;
  handleMarketingCheck: (checked: boolean) => void;

  // 상태 초기화 액션
  resetStore: () => void;

  // 어디가 부족한지 확인하려고
  validateAllFields: () => boolean;
}

// 초기 상태 값
const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthYear: '2000',
  birthMonth: '1',
  birthDay: '1',
  birth: '2000-01-01',
  
  nameError: false,
  emailError: false,
  passwordError: false,
  confirmPasswordError: false,
  
  allChecked: false,
  requiredChecks: [false, false, false, false],
  marketingChecked: false,
  policy: false,
  marketing: false,
};



// Zustand 스토어 생성
export const useRegisterStore = create<RegisterState>()((set, get) => ({
  ...initialState,

  // 입력 필드 상태 업데이트
  setName: (name: string) => set({ name }),
  setEmail: (email: string) => set({ email }),
  setPassword: (password: string) => set({ password }),
  setConfirmPassword: (confirmPassword: string) => set({ confirmPassword }),
  setBirthYear: (birthYear: string) => set({ birthYear }),
  setBirthMonth: (birthMonth: string) => set({ birthMonth }),
  setBirthDay: (birthDay: string) => set({ birthDay }),

  // 생년월일 포맷 업데이트
  updateBirth: () => {
    const { birthYear, birthMonth, birthDay } = get();
    const formattedBirth = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    set({ birth: formattedBirth });
  },

  // 이름 유효성 검사
  validateName: (name: string) => {
    const nameError = !/^[가-힣]{2,10}$/.test(name);
    set({ name, nameError });
  },

  // 이메일 유효성 검사
  validateEmail: (email: string) => {
    const emailError = !/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i.test(email);
    set({ email, emailError });
  },

  // 비밀번호 유효성 검사
  validatePassword: (password: string) => {
    const passwordError = !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
    set({ password, passwordError });
    const { confirmPassword } = get();
    if (confirmPassword) {
      set({ confirmPasswordError: confirmPassword !== password });
    }
  },

  // 비밀번호 확인 유효성 검사
  validateConfirmPassword: (confirmPassword: string) => {
    const { password } = get();
    set({
      confirmPassword,
      confirmPasswordError: confirmPassword !== password
    });
  },

  // 전체 약관 동의 처리
  handleAllCheck: (checked: boolean) => set({
    allChecked: checked,
    requiredChecks: Array(4).fill(checked),
    marketingChecked: checked,
    policy: checked,
    marketing: checked
  }),

  // 필수 약관 동의 처리
  handleRequiredCheck: (index: number, checked: boolean) => {
    const newRequiredChecks = [...get().requiredChecks];
    newRequiredChecks[index] = checked;
    const allRequired = newRequiredChecks.every(check => check);
    
    set({
      requiredChecks: newRequiredChecks,
      policy: allRequired,
      allChecked: allRequired && get().marketingChecked
    });
  },

  // 마케팅 동의 처리
  handleMarketingCheck: (checked: boolean) => set(state => ({
    marketingChecked: checked,
    marketing: checked,
    allChecked: state.requiredChecks.every(check => check) && checked
  })),

  // 상태 초기화
  resetStore: () => set(initialState),

  // 모든 필드 유효성 검사
  validateAllFields: () => {
    const { name, email, password, confirmPassword } = get();
    const nameError = !/^[가-힣]{2,10}$/.test(name);
    const emailError = !/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i.test(email);
    const passwordError = !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
    const confirmPasswordError = password !== confirmPassword;

    set({
      nameError: !name || nameError,
      emailError: !email || emailError,
      passwordError: !password || passwordError,
      confirmPasswordError: !confirmPassword || confirmPasswordError
    });

    return !(!name || !email || !password || !confirmPassword || 
            nameError || emailError || passwordError || confirmPasswordError);
  }
}));
