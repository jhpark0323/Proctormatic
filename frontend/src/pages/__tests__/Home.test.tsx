// src/pages/__tests__/Home.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import Home from "@/pages/Home";

// 테스트 헬퍼 함수: 로컬 스토리지 초기화
const clearStores = () => {
  localStorage.clear();
  // useAuthStore.getState().reset?.();
};

// 테스트 헬퍼 함수: 컴포넌트 렌더링
const renderHome = () => {
  return render(
    <Router>
      <Home />
    </Router>
  );
};

describe("Home 페이지 테스트", () => {
  // 각각의 테스트 수행 전 로컬 스토리지 초기화 진행
  beforeEach(() => {
    clearStores();
  });

  // 1. 홈 페이지에 컴포넌트들이 정상적으로 렌더링 되는지 확인
  it("홈페이지에 헤더와 배너가 정삭적으로 렌더링 되는지 확인", () => {
    // 컴포넌트 렌더링
    renderHome();
    // 기대값: HeaderWhite가 잘 렌더링 되어있음
    expect(screen.getByText("로그인 / 가입")).toBeInTheDocument();
    // 기대값: SwiperComponent가 잘 렌더링 되어있음
    expect(screen.getByTestId("SwiperComponent")).toBeInTheDocument();
  });

  // 2. 로그인 버튼 클릭 시 로그인 팝업이 잘 열리는지 확인
  it("로그인 버튼을 누르면 로그인 창이 잘 열리는지 확인", () => {
    // 컴포넌트 렌더링
    renderHome();
    // 로그인 / 가입 이라는 글자를 찾아서 클릭하기
    fireEvent.click(screen.getByText("로그인 / 가입"));
    // 기대값: login-dialog라는 역할을 가진 컴포넌트가 잘 렌더링 되는지 확인
    expect(screen.getByTestId("login-modal")).toBeInTheDocument();
  })

  // 3. 로그인 중 닫기 버튼을 누르면 로그인 팝업이 잘 닫히는지 확인
  it("로그인 창의 닫기 버튼을 누르면 잘 닫히는지 확인", () => {
    // 컴포넌트 렌더링
    renderHome();
    // 로그인 / 가입 이라는 글자를 찾아서 클릭하기
    fireEvent.click(screen.getByText("로그인 / 가입"));
    // alt 값을 close로 갖고 있는 닫기 버튼 찾아서 클릭하기
    fireEvent.click(screen.getByAltText("close"));
    // 기대값: login-dialog라는 역할을 가진 컴포넌트가 잘 언마운트 됐는지 확인
    expect(screen.queryByTestId("login-modal")).not.toBeInTheDocument();
  });

  // 4. 로그인 모달 안의 회원가입 버튼을 누르면 회원가입 모달로 잘 넘어가는지 확인
  it("로그인 창의 회원가입 버튼을 누르면 잘 열리는지 확인", () => {
    // 컴포넌트 렌더링
    renderHome();
    // 로그인 / 가입 이라는 글자를 찾아서 클릭하기
    fireEvent.click(screen.getByText("로그인 / 가입"));
    // 주최자와 응시자 선택 중 주최자 선택
    fireEvent.click(screen.getByText("주최자"));
    // 회원가입 이라는 글자를 찾아서 클릭하기
    fireEvent.click(screen.getByText("회원가입"));
    // 기대값: 회원가입 모달에 부여한 testId register-modal이 잘 열리는지 확인
    expect(screen.getByTestId("register-modal")).toBeInTheDocument();
  });

  // 5. 회원가입 모달 안의 닫기 버튼을 누르면 잘 닫히는지 확인
  it("회원가입 창의 닫기 버튼을 누르면 잘 닫히는지 확인", () => {
    // 컴포넌트 렌더링
    renderHome();
    // 로그인 / 가입 이라는 글자를 찾아서 클릭하기
    fireEvent.click(screen.getByText("로그인 / 가입"));
    // 주최자와 응시자 선택 중 주최자 선택
    fireEvent.click(screen.getByText("주최자"));
    // 회원가입 이라는 글자를 찾아서 클릭하기
    fireEvent.click(screen.getByText("회원가입"));
    // alt 값이 close인 닫기 버튼 클릭
    fireEvent.click(screen.getByAltText("close"));
    // 기대값: 회원가입 모달에 부여한 testId register-modal이 잘 닫히는지 확인
    expect(screen.queryByTestId("register-modal")).not.toBeInTheDocument();
  });

  // 6. 로그인 창이 열린 상태에서 모달 이외의 부분을 클릭했을 때 잘 닫히는지 확인
  it("배경 클릭 시 모달이 잘 닫히는지 확인", () => {
    // 컴포넌트 렌더링
    renderHome();
    // 로그인 / 가입 이라는 글자를 찾아서 클릭하기
    fireEvent.click(screen.getByText("로그인 / 가입"));
    // 배경 클릭
    fireEvent.click(screen.getByTestId("backdrop"));
    // 기대값: login-dialog라는 역할을 가진 컴포넌트가 잘 언마운트 됐는지 확인
    expect(screen.queryByTestId("login-modal")).not.toBeInTheDocument();
  });
});