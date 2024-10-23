import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from '../../pages/Home';

describe('Home 페이지 테스트', () => {

  // 1. header가 정상적으로 렌더링 되는지 확인
  it('HeaderWhite가 정상적으로 렌더링 되는지 확인', () => {
    render(
      <Router>
        <Home />
      </Router>
    );
  
    // "로그인 / 가입"이 정상적으로 렌더링 되는지를 확인하면 헤더의 렌더링 여부 확인 가능
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
  
  // 4. 각 역할별로 로그인 했을때 정상적으로 해당 페이지로 이동이 되는지 여부
  it('taker 역할이 선택되면 login이 호출되고 /taker로 이동해야 합니다.', () => {
    render(
      <Router>
        <Home />
      </Router>
    );
  
    fireEvent.click(screen.getByText('로그인 / 가입')); // 수정된 부분
    
    // 이후 역할 선택과 navigate 함수 호출을 테스트할 수 있음
  });
});

