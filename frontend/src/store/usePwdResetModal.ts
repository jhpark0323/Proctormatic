import { create } from 'zustand';

interface PwdResetState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;

  nameError: boolean;
  emailError: boolean;
  passwordError: boolean;
  confirmPasswordError: boolean;

  validateName: (name: string) => void;
  validateEmail: (email: string) => void;
  validatePassword: (password: string) => void;
  validateConfirmPassword: (confirmPassword: string) => void;

  resetStore: () => void;
}

const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  nameError: false,
  emailError: false,
  passwordError: false,
  confirmPasswordError: false,
};

export const usePwdResetStore = create<PwdResetState>()((set, get) => ({
  ...initialState,

  validateName: (name: string) => {
    const nameError = !/^[가-힣]{2,10}$/.test(name);
    set({ name, nameError });
  },

  validateEmail: (email: string) => {
    const emailError = !/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i.test(email);
    set({ email, emailError });
  },

  validatePassword: (password: string) => {
    const passwordError = !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
    set({ password, passwordError });
    const { confirmPassword } = get();
    if (confirmPassword) {
      set({ confirmPasswordError: confirmPassword !== password });
    }
  },

  validateConfirmPassword: (confirmPassword: string) => {
    const { password } = get();
    set({
      confirmPassword,
      confirmPasswordError: confirmPassword !== password
    });
  },

  resetStore: () => set(initialState),
}));
