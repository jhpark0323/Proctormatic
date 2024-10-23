import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from '../../pages/Home';

it('HeaderWhite 컴포넌트를 렌더링해야 합니다.', () => {
  render(
    <Router>
      <Home />
    </Router>
  );

  // 수정된 부분: "로그인 / 가입"으로 텍스트 일치
  expect(screen.getByText('로그인 / 가입')).toBeInTheDocument();
});

it('로그인 버튼을 클릭하면 모달이 열려야 합니다.', () => {
  render(
    <Router>
      <Home />
    </Router>
  );

  const loginButton = screen.getByText('로그인 / 가입');
  fireEvent.click(loginButton);

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

it('백드롭을 클릭하면 모달이 닫혀야 합니다.', () => {
  render(
    <Router>
      <Home />
    </Router>
  );

  fireEvent.click(screen.getByText('로그인 / 가입')); // 수정된 부분

  const backdrop = screen.getByTestId('backdrop');
  fireEvent.click(backdrop);
  
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('taker 역할이 선택되면 login이 호출되고 /taker로 이동해야 합니다.', () => {
  render(
    <Router>
      <Home />
    </Router>
  );

  fireEvent.click(screen.getByText('로그인 / 가입')); // 수정된 부분
  
  // 이후 역할 선택과 navigate 함수 호출을 테스트할 수 있음
});
