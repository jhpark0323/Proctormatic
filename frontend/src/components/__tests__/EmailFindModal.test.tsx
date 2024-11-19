import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import EmailFindModal from '@/components/EmailFindModal';
import { BrowserRouter } from 'react-router-dom';

// Mock react-tooltip
jest.mock('react-tooltip', () => ({
  Tooltip: jest.fn(() => null)
}));

describe('EmailFindModal 컴포넌트 테스트 (실제 API 요청)', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnLoginRedirect = jest.fn();
  const mockOnRetrySearch = jest.fn();

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <EmailFindModal
          onClose={mockOnClose}
          title="아이디 찾기"
          subtitle="회원님의 아이디를 찾을 수 없습니다."
          onSubmit={mockOnSubmit}
          onLoginRedirect={mockOnLoginRedirect}
          onRetrySearch={mockOnRetrySearch}
        />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('이름 입력 시 검색하기 버튼이 활성화 되고, 입력이 없으면 비활성화 되는지 확인', async () => {
    await act(async () => {
      renderComponent();
    });

    const searchButton = screen.getByTestId('search-button');
    const nameInput = screen.getByTestId('name-input');
    
    expect(searchButton).toBeDisabled();
    
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: '테스트 사용자' } });
    });
    expect(searchButton).toBeEnabled();
    
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: '' } });
    });
    expect(searchButton).toBeDisabled();
  });

  test('존재하지 않는 계정을 검색하면 존재하지 않는다는 메세지가 잘 표시되는지 확인', async () => {
    await act(async () => {
      renderComponent();
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: '존재하지 않는 사용자' },
      });
      fireEvent.change(screen.getByTestId('year-select'), { target: { value: '1995' } });
      fireEvent.change(screen.getByTestId('month-select'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('day-select'), { target: { value: '10' } });
      fireEvent.click(screen.getByText('검색하기'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });

  test('존재하는 계정인 테스트 계정을 검색하면 검색 결과가 잘 표시되는지 확인', async () => {
    await act(async () => {
      renderComponent();
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: '테스트' },
      });
      fireEvent.change(screen.getByTestId('year-select'), { target: { value: '2000' } });
      fireEvent.change(screen.getByTestId('month-select'), { target: { value: '1' } });
      fireEvent.change(screen.getByTestId('day-select'), { target: { value: '1' } });
      fireEvent.click(screen.getByText('검색하기'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });
  });
});