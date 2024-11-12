import React, { ReactNode } from 'react';
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import Home from "@/pages/Home";

// Swiper 컴포넌트 모킹
jest.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: ReactNode }) => <div data-testid="SwiperComponent">{children}</div>,
  SwiperSlide: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

// 테스트 헬퍼 함수: 로컬 스토리지 초기화
const clearStores = () => {
  localStorage.clear();
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
  beforeEach(() => {
    clearStores();
  });

  it("홈페이지에 헤더와 배너가 정상적으로 렌더링 되는지 확인", () => {
    renderHome();
    expect(screen.getByText("로그인 / 가입")).toBeInTheDocument();
    const swiperComponents = screen.queryAllByTestId("SwiperComponent");
    expect(swiperComponents.length).toBeGreaterThan(0);
  });

  it("로그인 버튼을 누르면 로그인 창이 잘 열리는지 확인", () => {
    renderHome();
    fireEvent.click(screen.getByText("로그인 / 가입"));
    expect(screen.getByTestId("login-modal")).toBeInTheDocument();
  });

  it("로그인 창의 닫기 버튼을 누르면 잘 닫히는지 확인", () => {
    renderHome();
    fireEvent.click(screen.getByText("로그인 / 가입"));
    fireEvent.click(screen.getByAltText("close"));
    expect(screen.queryByTestId("login-modal")).not.toBeInTheDocument();
  });

  it("로그인 창의 회원가입 버튼을 누르면 회원가입 모달이 잘 열리는지 확인", () => {
    renderHome();
    fireEvent.click(screen.getByText("로그인 / 가입"));
    fireEvent.click(screen.getByText("주최자"));
    fireEvent.click(screen.getByText("회원가입"));
    expect(screen.getByTestId("register-modal")).toBeInTheDocument();
  });

  it("회원가입 창의 닫기 버튼을 누르면 잘 닫히는지 확인", () => {
    renderHome();
    fireEvent.click(screen.getByText("로그인 / 가입"));
    fireEvent.click(screen.getByText("주최자"));
    fireEvent.click(screen.getByText("회원가입"));
    fireEvent.click(screen.getByAltText("close"));
    expect(screen.queryByTestId("register-modal")).not.toBeInTheDocument();
  });

  it("배경 클릭 시 모달이 잘 닫히는지 확인", () => {
    renderHome();
    fireEvent.click(screen.getByText("로그인 / 가입"));
    fireEvent.click(screen.getByTestId("backdrop"));
    expect(screen.queryByTestId("login-modal")).not.toBeInTheDocument();
  });
});
