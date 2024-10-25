import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from '../../pages/home';
import { useAuthStore } from '../../store/useAuthStore'; // store import 추가

// 테스트 헬퍼 함수: store와 localStorage를 모두 초기화
const clearStores = () => {
  localStorage.clear();
  useAuthStore.setState({ user: null }); // store 초기 상태로 리셋
};

describe('Home 페이지 테스트', () => {
  // 각 테스트 실행 전에 store와 localStorage를 모두 초기화
  beforeEach(() => {
    clearStores();
  });

  // 1. header가 정상적으로 렌더링 되는지 확인
  it('HeaderWhite가 정상적으로 렌더링 되는지 확인', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    expect(screen.getByText('로그인 / 가입')).toBeInTheDocument();
  });
  
  // 2. 로그인 버튼을 클릭하면 모달이 열리는지 확인
  it('로그인/가입 버튼 클릭시 모달이 열려야 합니다.', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    const loginButton = screen.getByText('로그인 / 가입');
    fireEvent.click(loginButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  
  // 3. 모달이 열렸을 때 뒷 배경을 클릭하면 모달이 닫히는지 확인
  it('모달 이외의 부분을 클릭하면 모달이 닫혀야 합니다.', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    fireEvent.click(screen.getByText('로그인 / 가입'));

    const backdrop = screen.getByTestId('backdrop');
    fireEvent.click(backdrop);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // 4. 주최자로 로그인 했을 때 store와 버튼이 정상적으로 표시되는지 확인
  it('주최자 역할이 선택되면 store에 역할이 저장되고, "시험 관리하기" 버튼이 표시되어야 합니다.', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    fireEvent.click(screen.getByText('로그인 / 가입'));
    
    const hostButton = screen.getByText('주최자');
    fireEvent.click(hostButton);

    // store의 상태 확인
    expect(useAuthStore.getState().user?.role).toBe('host');

    expect(screen.getByText('시험 관리하기')).toBeInTheDocument();
  });

  // 5. 응시자로 로그인 했을 때 store와 버튼이 정상적으로 표시되는지 확인
  it('응시자 역할이 선택되면 store에 역할이 저장되고, "시험 응시하기" 버튼이 표시되어야 합니다.', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    fireEvent.click(screen.getByText('로그인 / 가입'));
    
    const takerButton = screen.getByText('응시자');
    fireEvent.click(takerButton);

    // store의 상태 확인
    expect(useAuthStore.getState().user?.role).toBe('taker');

    expect(screen.getByText('시험 입실하기')).toBeInTheDocument();
  });

  // 6. 로그아웃 테스트 추가
  it('로그아웃 시 store가 초기화되고 로그인 버튼이 다시 표시되어야 합니다.', () => {
    // 먼저 로그인
    render(
      <Router>
        <Home />
      </Router>
    );

    fireEvent.click(screen.getByText('로그인 / 가입'));
    fireEvent.click(screen.getByText('응시자'));

    // 로그아웃 실행
    const logoutButton = screen.getByText('로그아웃');
    fireEvent.click(logoutButton);

    // store가 초기화되었는지 확인
    expect(useAuthStore.getState().user).toBeNull();
    // 로그인 버튼이 다시 표시되는지 확인
    expect(screen.getByText('로그인 / 가입')).toBeInTheDocument();
  });
});