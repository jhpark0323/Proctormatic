import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Step4 from '@/pages/taker/steps/Step4';
import { useTakerStore } from '@/store/TakerAuthStore';
import axiosInstance from '@/utils/axios';
import { CustomToast } from '@/components/CustomToast';

jest.mock('@/store/TakerAuthStore');
jest.mock('@/utils/axios');
jest.mock('@/components/CustomToast', () => ({
  CustomToast: jest.fn(),
}));

const mockOnNext = jest.fn();
const mockOnBack = jest.fn();

describe('Step4 컴포넌트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTakerStore as jest.MockedFunction<typeof useTakerStore>).mockReturnValue({ testId: 'test123' });
  });

  test('시험 정보가 API로부터 정상적으로 불러와지고 표시되는지 확인', async () => {
    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: {
        title: '모의 시험',
        date: '2024-11-30',
        start_time: '10:00:00',
        end_time: '12:00:00',
      },
    });

    render(<Step4 onNext={mockOnNext} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByTestId('test-title')).toHaveValue('모의 시험');
      expect(screen.getByTestId('test-date')).toHaveValue('2024-11-30');
      expect(screen.getByTestId('test-time')).toHaveValue('10:00:00 ~ 12:00:00');
    });
  });

  test('API 호출 오류 시 CustomToast 오류 메시지가 표시되는지 확인', async () => {
    (axiosInstance.get as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: '시험 정보를 불러올 수 없습니다' } },
    });

    render(<Step4 onNext={mockOnNext} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(CustomToast).toHaveBeenCalledWith('시험 정보를 불러올 수 없습니다');
    });
  });

  test('입실 가능 시간이 되었을 때 다음 버튼이 활성화되고 onNext 핸들러가 호출되는지 확인', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-11-30T09:30:00'));

    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: {
        title: '모의 시험',
        date: '2024-11-30',
        start_time: '10:00:00',
        end_time: '12:00:00',
      },
    });

    render(<Step4 onNext={mockOnNext} onBack={mockOnBack} />);

    await waitFor(() => {
      const nextButton = screen.getByText('다음');
      expect(nextButton).toBeEnabled();
      fireEvent.click(nextButton);
      expect(mockOnNext).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  test('돌아가기 버튼 클릭 시 onBack 핸들러가 호출되는지 확인', () => {
    render(<Step4 onNext={mockOnNext} onBack={mockOnBack} />);

    const backButton = screen.getByText('돌아가기');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });
});
