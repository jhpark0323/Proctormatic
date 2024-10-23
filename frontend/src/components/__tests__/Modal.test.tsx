import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../Modal';
import { useAuthStore } from '../../store/useAuthStore';

// 로컬 스토리지 초기화 및 클리어
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('Modal 컴포넌트', () => {
  // 1. X 버튼을 클릭하면 모달이 닫히는지 확인
  it('X 이미지를 클릭하면 모달이 닫혀야 합니다.', () => {
    const onCloseMock = jest.fn();
    const title = 'Test Title';
    const subtitle = 'Test Subtitle';

    render(<Modal onClose={onCloseMock} title={title} subtitle={subtitle} onLogin={() => {}} />);

    const closeButton = screen.getByAltText('close');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  // 2. 소제목이 문자열일 때 제대로 렌더링되는지 확인
  it('소제목이 문자열일 때 제목이 잘 렌더링 되어야 합니다.', () => {
    const title = 'Test Title';
    const subtitle = 'String Subtitle';

    render(<Modal onClose={() => {}} title={title} subtitle={subtitle} onLogin={() => {}} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  // 3. 소제목이 배열일 때 각 줄이 제대로 렌더링되는지 확인
  it('소제목이 배열일 때 각 줄이 제대로 렌더링해야 합니다.', () => {
    const title = 'Test Title';
    const subtitle = ['First line of subtitle', 'Second line of subtitle'];

    render(<Modal onClose={() => {}} title={title} subtitle={subtitle} onLogin={() => {}} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    subtitle.forEach((line) => {
      expect(screen.getByText(line)).toBeInTheDocument();
    });
  });

  // 4. 주최자 버튼 클릭 시 주최자로 로그인 되는지 확인
  it('주최자 버튼 클릭 시 "host"로 로그인되고 로컬 스토리지에 저장되어야 합니다.', async () => {
    const title = 'Test Title';
    const subtitle = 'Test Subtitle';
    const login = useAuthStore.getState().login;

    render(<Modal onClose={() => {}} title={title} subtitle={subtitle} onLogin={login} />);

    const hostButton = screen.getByText('주최자');
    fireEvent.click(hostButton);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // useAuthStore의 현재 상태 확인
    expect(useAuthStore.getState().user).toEqual({ role: 'host' });
    
    // 로컬 스토리지에 저장된 데이터의 구조 전체 확인
    const storedData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    expect(storedData).toEqual({
      state: {
        user: { role: 'host' }
      },
      version: 0
    });
  });

  // 5. 응시자 버튼 클릭 시 응시자로 로그인 되는지 확인
  it('응시자 버튼 클릭 시 "taker"로 로그인되고 로컬 스토리지에 저장되어야 합니다.', async () => {
    const title = 'Test Title';
    const subtitle = 'Test Subtitle';
    const login = useAuthStore.getState().login;

    render(<Modal onClose={() => {}} title={title} subtitle={subtitle} onLogin={login} />);

    const hostButton = screen.getByText('응시자');
    fireEvent.click(hostButton);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // useAuthStore의 현재 상태 확인
    expect(useAuthStore.getState().user).toEqual({ role: 'taker' });
    
    // 로컬 스토리지에 저장된 데이터의 구조 전체 확인
    const storedData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    expect(storedData).toEqual({
      state: {
        user: { role: 'taker' }
      },
      version: 0
    });
  });

});
