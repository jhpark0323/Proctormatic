export const checkPassword = (password: string) => {
  // 최소 8자, 문자, 숫자, 특수문자 포함하는 정규식
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return passwordRegex.test(password);
};
