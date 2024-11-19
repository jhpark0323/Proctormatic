import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmailModal from '@/components/EmailModal';
import axiosInstance from '@/utils/axios';

jest.mock('@/utils/axios');

describe('EmailModal 컴포넌트 테스트', () => {
  const mockOnClose = jest.fn();
  const mockOnVerificationSuccess = jest.fn();

  const renderComponent = () => {
    return render(
      <EmailModal
        onClose={mockOnClose}
        email="test@example.com"
        onVerificationSuccess={mockOnVerificationSuccess}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // 타이머 관련 경고 해결
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
  });

  it('컴포넌트가 올바르게 렌더링 되는지 확인', () => {
    renderComponent();
    expect(screen.getByText('이메일 인증')).toBeInTheDocument();

    // InfoBox 내에서 텍스트 확인
    expect(screen.getByTestId("info-box")).toHaveTextContent("test@example.com으로 인증번호가 발송되었습니다.");
    expect(screen.getByPlaceholderText('인증번호 입력')).toBeInTheDocument();
  });

  it('타이머가 올바르게 표시되는지 확인', () => {
    renderComponent();
    expect(screen.getByText(/남은 시간:/)).toBeInTheDocument();
  });

  it('인증번호 재발송 시 타이머가 리셋되고 토스트가 표시되는지 확인', async () => {
    (axiosInstance.post as jest.Mock).mockResolvedValue({ status: 200 });
    renderComponent();

    fireEvent.click(screen.getByText('인증번호 재발송'));

    await waitFor(() => {
      expect(screen.getByText('남은 시간: 5분 00초')).toBeInTheDocument();
    });
  });

  it('올바른 인증번호 입력 후 인증 성공 시 onVerificationSuccess와 onClose가 호출되는지 확인', async () => {
    (axiosInstance.put as jest.Mock).mockResolvedValue({ status: 200 });
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('인증번호 입력'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('인증하기'));
    
    await waitFor(() => {
      expect(mockOnVerificationSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('잘못된 인증번호 입력 시 오류 메시지가 표시되는지 확인', async () => {
    (axiosInstance.put as jest.Mock).mockRejectedValue({
      response: { data: { message: '인증번호가 일치하지 않습니다.' } },
    });
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('인증번호 입력'), { target: { value: 'wrong-code' } });
    fireEvent.click(screen.getByText('인증하기'));
    
    await waitFor(() => {
      expect(screen.getByText('인증번호가 일치하지 않습니다.')).toBeInTheDocument();
    });
  });

  it('타이머가 만료되면 오류 메시지가 표시되는지 확인', async () => {
    renderComponent();

    act(() => {
      jest.advanceTimersByTime(300000); // 5분 경과
    });

    await waitFor(() => {
      expect(screen.getByText('인증 시간이 만료되었습니다. 인증번호를 재발송해주세요.')).toBeInTheDocument();
    });
  });

  it('닫기 버튼을 클릭하면 onClose가 호출되는지 확인', () => {
    renderComponent();
    fireEvent.click(screen.getByAltText('close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('취소 버튼을 클릭하면 onClose가 호출되는지 확인', () => {
    renderComponent();
    fireEvent.click(screen.getByText('취소'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
