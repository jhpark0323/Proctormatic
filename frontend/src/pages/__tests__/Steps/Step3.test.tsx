import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Step3 from '@/pages/taker/steps/Step3';

describe('Step3 컴포넌트 테스트', () => {
  const mockOnNext = jest.fn();

  beforeEach(() => {
    render(<Step3 onNext={mockOnNext} />);
  });

  test('제목과 부제목이 올바르게 표시되는지 확인', () => {
    expect(screen.getByTestId('step-title')).toHaveTextContent('부정행위 안내');
    expect(screen.getByTestId('step-subtitle')).toHaveTextContent(
      '아래와 같은 사항들이 지켜지지 않을 시 부정행위 처리될 수 있습니다.'
    );
  });

  test('각 부정행위 안내 항목이 올바르게 표시되는지 확인', () => {
    expect(screen.getByTestId('description-test-person')).toHaveTextContent(
      '시험 중 얼굴, 양손이 모두 보이도록 웹캡을 세팅 후 응시자세를 유지해주세요.'
    );
    expect(screen.getByTestId('description-upload')).toHaveTextContent(
      '시험 종료 후, 영상 업로드가 끝날 때까지 웹 사이트를 유지해주세요.'
    );
    expect(screen.getByTestId('description-rules')).toHaveTextContent(
      '부정행위 적발 시, 주최 측 부정행위처리기준에 의거해 처리됩니다.'
    );
    expect(screen.getByTestId('description-no-phone')).toHaveTextContent(
      '시험 시간 도중 웹 사이트 이탈로 인한 재접속 및 휴대폰 사용은 부정행위로 간주될 수 있습니다.'
    );
    expect(screen.getByTestId('description-no-mask')).toHaveTextContent(
      '얼굴을 가릴 수 있는 복장 및 시험과 무관한 소품 착용을 금지합니다.'
    );
  });

  test('각 이미지가 올바르게 렌더링되는지 확인', () => {
    expect(screen.getByTestId('image-test-person')).toBeInTheDocument();
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.getByTestId('image-rules')).toBeInTheDocument();
    expect(screen.getByTestId('image-no-phone')).toBeInTheDocument();
    expect(screen.getByTestId('image-no-mask')).toBeInTheDocument();
  });

  test('확인 버튼을 클릭 시 onNext 함수가 호출되는지 확인', () => {
    const button = screen.getByTestId('confirm-button');
    fireEvent.click(button);
    expect(mockOnNext).toHaveBeenCalled();
  });
});
