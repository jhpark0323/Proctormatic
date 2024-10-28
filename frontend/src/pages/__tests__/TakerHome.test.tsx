import React, { act } from 'react'; // 수정: react에서 act를 가져옵니다.
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import TakerHome from '../taker/TakerHome';
import { useAuthStore } from '../../store/useAuthStore';

describe('TakerHome 페이지 테스트', () => {
  beforeEach(() => {
    act(() => {
      // useAuthStore 상태를 직접 변경하여 user role 설정
      useAuthStore.setState({
        user: { role: 'taker' },
      });
    });
  });

  afterEach(() => {
    act(() => {
      // 테스트가 끝난 후 상태를 초기화하여 다른 테스트에 영향을 주지 않도록 설정
      useAuthStore.setState({
        user: null,
      });
    });
  });

  // 1. 응시자 Home 페이지가 정상적으로 렌더링 되는지 확인
  it('응시자 Home 페이지를 잘 렌더링 하는지 확인', () => {
    render(
      <Router>
        <TakerHome />
      </Router>
    );
    expect(screen.getByText(/시험장 입실하기/i)).toBeInTheDocument();
  });

  // 2. 응시자 Home 페이지의 사이드바가 잘 렌더링 되는지 확인
  it('사이드바가 잘 렌더링 되는지 확인', () => {
    render(
      <Router>
        <TakerHome />
      </Router>
    );

    const sidebar = screen.getByRole('complementary'); // 사이드바가 있는 요소를 특정할 수 있는 역할(Role) 추가 필요
    expect(within(sidebar).getByText(/URL 입력하기/i)).toBeInTheDocument();
    expect(within(sidebar).getByText(/시험 주의사항/i)).toBeInTheDocument();
    expect(within(sidebar).getByText(/부정행위 안내/i)).toBeInTheDocument();
    expect(within(sidebar).getByText(/시험정보 확인/i)).toBeInTheDocument();
    expect(within(sidebar).getByText(/응시자 정보 입력/i)).toBeInTheDocument();
  });

  it('기본 값으로 step1 컴포넌트부터 렌더링이 잘 되는지 확인', () => {
    render(
      <Router>
        <TakerHome />
      </Router>
    );

    const mainContent = screen.getByRole('main'); // 메인 콘텐츠 영역을 특정할 수 있는 역할(Role) 추가 필요
    expect(within(mainContent).getByText(/URL 입력하기/i)).toBeInTheDocument();
    expect(within(mainContent).getByText(/이메일로 수신 받은 URL 코드를 붙여 넣어주세요./i)).toBeInTheDocument();
  });

  it('다음 버튼을 눌렀을 때 step1 컴포넌트에서 step2 컴포넌트로 잘 이동하는지 확인', () => {
    render(
      <Router>
        <TakerHome />
      </Router>
    );

    act(() => {
      fireEvent.click(screen.getByText('다음'));
    });

    const mainContent = screen.getByRole('main'); // 메인 콘텐츠 영역에서 텍스트를 찾기
    expect(within(mainContent).getByText(/시험 주의사항/i)).toBeInTheDocument();
  });
});
