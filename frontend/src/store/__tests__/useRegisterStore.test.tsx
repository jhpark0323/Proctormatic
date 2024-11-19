import { renderHook, act } from '@testing-library/react'; // @testing-library/react에서 act 가져오기
import { useRegisterStore } from '@/store/useRegisterStore';

describe('useRegisterStore 상태 및 기능 테스트', () => {
  it('초기 상태가 올바르게 설정되는지 확인', () => {
    const { result } = renderHook(() => useRegisterStore());
    expect(result.current.name).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.birth).toBe('2000-01-01');
  });

  it('생년월일이 올바르게 설정되고 업데이트되는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => {
      result.current.setBirthYear('1995');
      result.current.setBirthMonth('12');
      result.current.setBirthDay('25');
      result.current.updateBirth();
    });

    expect(result.current.birthYear).toBe('1995');
    expect(result.current.birthMonth).toBe('12');
    expect(result.current.birthDay).toBe('25');
    expect(result.current.birth).toBe('1995-12-25');
  });

  it('이름 유효성 검사가 올바르게 동작하는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => result.current.validateName('홍길동'));
    expect(result.current.nameError).toBe(false);

    await act(async () => result.current.validateName('홍'));
    expect(result.current.nameError).toBe(true);
  });

  it('이메일 유효성 검사가 올바르게 동작하는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => result.current.validateEmail('test@example.com'));
    expect(result.current.emailError).toBe(false);

    await act(async () => result.current.validateEmail('invalid-email'));
    expect(result.current.emailError).toBe(true);
  });

  it('비밀번호 유효성 검사가 올바르게 동작하는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => result.current.validatePassword('ValidPass123!'));
    expect(result.current.passwordError).toBe(false);

    await act(async () => result.current.validatePassword('short'));
    expect(result.current.passwordError).toBe(true);
  });

  it('비밀번호 확인 유효성 검사가 올바르게 동작하는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => {
      result.current.setPassword('ValidPass123!');
      result.current.validateConfirmPassword('ValidPass123!');
    });
    expect(result.current.confirmPasswordError).toBe(false);

    await act(async () => result.current.validateConfirmPassword('Mismatch123!'));
    expect(result.current.confirmPasswordError).toBe(true);
  });

  it('전체 약관 동의 상태가 올바르게 설정되는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => result.current.handleAllCheck(true));
    expect(result.current.allChecked).toBe(true);
    expect(result.current.policy).toBe(true);
    expect(result.current.marketingChecked).toBe(true);

    await act(async () => result.current.handleAllCheck(false));
    expect(result.current.allChecked).toBe(false);
    expect(result.current.policy).toBe(false);
    expect(result.current.marketingChecked).toBe(false);
  });

  it('필수 약관 개별 동의 상태가 올바르게 업데이트되는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => result.current.handleRequiredCheck(0, true));
    expect(result.current.requiredChecks[0]).toBe(true);

    await act(async () => result.current.handleRequiredCheck(1, false));
    expect(result.current.requiredChecks[1]).toBe(false);
  });

  it('마케팅 동의 상태가 올바르게 설정되는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => result.current.handleMarketingCheck(true));
    expect(result.current.marketingChecked).toBe(true);

    await act(async () => result.current.handleMarketingCheck(false));
    expect(result.current.marketingChecked).toBe(false);
  });

  it('모든 필드가 유효한 경우 true를 반환하는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => {
      result.current.setName('홍길동');
      result.current.setEmail('test@example.com');
      result.current.setPassword('ValidPass123!');
      result.current.setConfirmPassword('ValidPass123!');
      result.current.validateAllFields();
    });

    expect(result.current.validateAllFields()).toBe(true);
  });

  it('필드가 유효하지 않을 때 false를 반환하는지 확인', async () => {
    const { result } = renderHook(() => useRegisterStore());

    await act(async () => {
      result.current.setName('홍');
      result.current.setEmail('invalid-email');
      result.current.setPassword('short');
      result.current.setConfirmPassword('mismatch');
      result.current.validateAllFields();
    });

    expect(result.current.validateAllFields()).toBe(false);
    expect(result.current.nameError).toBe(true);
    expect(result.current.emailError).toBe(true);
    expect(result.current.passwordError).toBe(true);
    expect(result.current.confirmPasswordError).toBe(true);
  });
});
