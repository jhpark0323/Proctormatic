import { create } from 'zustand';
import { act } from '@testing-library/react';

// 상태 인터페이스 정의
interface RegisterState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birth: string;

  nameError: boolean;
  emailError: boolean;
  passwordError: boolean;
  confirmPasswordError: boolean;

  allChecked: boolean;
  requiredChecks: boolean[];
  marketingChecked: boolean;
  policy: boolean;
  marketing: boolean;

  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setBirthYear: (year: string) => void;
  setBirthMonth: (month: string) => void;
  setBirthDay: (day: string) => void;
  updateBirth: () => void;

  validateName: (name: string) => void;
  validateEmail: (email: string) => void;
  validatePassword: (password: string) => void;
  validateConfirmPassword: (confirmPassword: string) => void;

  handleAllCheck: (checked: boolean) => void;
  handleRequiredCheck: (index: number, checked: boolean) => void;
  handleMarketingCheck: (checked: boolean) => void;

  resetStore: () => void;
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

  setName: (name: string) => set({ name }),
  setEmail: (email: string) => set({ email }),
  setPassword: (password: string) => set({ password }),
  setConfirmPassword: (confirmPassword: string) => set({ confirmPassword }),
  setBirthYear: (birthYear: string) => set({ birthYear }),
  setBirthMonth: (birthMonth: string) => set({ birthMonth }),
  setBirthDay: (birthDay: string) => set({ birthDay }),

  updateBirth: () => {
    const { birthYear, birthMonth, birthDay } = get();
    const formattedBirth = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    act(() => {
      set({ birth: formattedBirth });
    });
  },

  validateName: (name: string) => {
    const nameError = !/^[가-힣]{2,10}$/.test(name);
    act(() => {
      set({ name, nameError });
    });
  },

  validateEmail: (email: string) => {
    const emailError = !/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i.test(email);
    act(() => {
      set({ email, emailError });
    });
  },

  validatePassword: (password: string) => {
    const passwordError = !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
    act(() => {
      set({ password, passwordError });
      const { confirmPassword } = get();
      if (confirmPassword) {
        set({ confirmPasswordError: confirmPassword !== password });
      }
    });
  },

  validateConfirmPassword: (confirmPassword: string) => {
    const { password } = get();
    act(() => {
      set({
        confirmPassword,
        confirmPasswordError: confirmPassword !== password,
      });
    });
  },

  handleAllCheck: (checked: boolean) => act(() => {
    set({
      allChecked: checked,
      requiredChecks: Array(4).fill(checked),
      marketingChecked: checked,
      policy: checked,
      marketing: checked,
    });
  }),

  handleRequiredCheck: (index: number, checked: boolean) => {
    const newRequiredChecks = [...get().requiredChecks];
    newRequiredChecks[index] = checked;
    const allRequired = newRequiredChecks.every((check) => check);

    act(() => {
      set({
        requiredChecks: newRequiredChecks,
        policy: allRequired,
        allChecked: allRequired && get().marketingChecked,
      });
    });
  },

  handleMarketingCheck: (checked: boolean) => act(() => {
    set((state) => ({
      marketingChecked: checked,
      marketing: checked,
      allChecked: state.requiredChecks.every((check) => check) && checked,
    }));
  }),

  resetStore: () => act(() => set(initialState)),

  validateAllFields: () => {
    const { name, email, password, confirmPassword } = get();
    const nameError = !/^[가-힣]{2,10}$/.test(name);
    const emailError = !/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i.test(email);
    const passwordError = !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
    const confirmPasswordError = password !== confirmPassword;

    act(() => {
      set({
        nameError: !name || nameError,
        emailError: !email || emailError,
        passwordError: !password || passwordError,
        confirmPasswordError: !confirmPassword || confirmPasswordError,
      });
    });

    return !(
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      nameError ||
      emailError ||
      passwordError ||
      confirmPasswordError
    );
  },
}));
