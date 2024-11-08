import { render, fireEvent, act, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HeaderWhite from "../HeaderWhite";
import { useAuthStore } from "@/store/useAuthStore";

describe("HeaderWhite 컴포넌트 테스트 (실제 데이터)", () => {
  afterEach(() => {
    act(() => {
      useAuthStore.setState({
        user: null,
      });
    });
  });
  // 테스트 1번
  test("로고를 클릭했을때, 홈으로 잘 이동하는지 확인", async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/some-initial-route']}>
        <Routes>
          <Route path="*" element={<HeaderWhite />} />
        </Routes>
      </MemoryRouter>
    );
    await act(async () => {
      fireEvent.click(getByTestId("logo"));
    });
    expect(window.location.pathname).toBe("/");
  });

  // 응시자 테스트 ------------------------------------------------------------------------------------------------------
  test("응시자로 로그인했을 때, 시험 입실하기 버튼이 렌더링 되는지 확인", () => {
    // 응시자로 로그인해서 로컬스토리지에 저장
    act(() => {
      useAuthStore.setState({
        user: { role: "taker" },
      });
    });
    // HeaderWhite 컴포넌트를 렌더링
    render(
      <MemoryRouter initialEntries={['/some-initial-route']}>
        <Routes>
          <Route path="*" element={<HeaderWhite />} />
        </Routes>
      </MemoryRouter>
    );
    // "시험 입실하기" 버튼이 렌더링되었는지 확인
    expect(screen.getByText("시험 입실하기")).toBeInTheDocument();
  });

  // 주최자 테스트 ------------------------------------------------------------------------------------------------------
  test("주최자로 로그인했을 때, 시험 예약하기 버튼이 렌더링 되는지 확인", () => {
    // 응시자로 로그인해서 로컬스토리지에 저장
    act(() => {
      useAuthStore.setState({
        user: { role: "host", name: "테스트 사용자" },
      });
    });
    // HeaderWhite 컴포넌트를 렌더링
    render(
      <MemoryRouter initialEntries={['/some-initial-route']}>
        <Routes>
          <Route path="*" element={<HeaderWhite />} />
        </Routes>
      </MemoryRouter>
    );
    // "시험 예약하기" 버튼이 렌더링되었는지 확인
    expect(screen.getByText("시험 예약하기")).toBeInTheDocument();
  });
});
