import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import SwiperComponent from '../Swiper';

// Swiper 컴포넌트 모킹
jest.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: ReactNode }) => <div data-testid="swiper-component">{children}</div>,
  SwiperSlide: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Navigation: jest.fn(),
  Autoplay: jest.fn(),
}));

describe('Swiper 컴포넌트 테스트', () => {
  it('Swiper 컴포넌트가 올바르게 렌더링되는지 확인', () => {
    render(<SwiperComponent />);
    expect(screen.getByText(/스스로 척척, 온라인 시험의 새로운 기준/i)).toBeInTheDocument();
    expect(screen.getByAltText(/semiLogo/i)).toBeInTheDocument();
    expect(screen.getByText(/with. 메타몽/i)).toBeInTheDocument();
  });

  it('두 번째 슬라이드 내용이 올바르게 렌더링되는지 확인', () => {
    render(<SwiperComponent />);
    expect(screen.getByText(/프록토매틱 출시 기념 런칭 이벤트/i)).toBeInTheDocument();
    expect(screen.getByText(/무료 10명 시험/i)).toBeInTheDocument();
    expect(screen.getByText(/직접 경험해 보세요!/i)).toBeInTheDocument();
  });

  it('테스트 환경에서는 loop가 비활성화되는지 확인', () => {
    process.env.NODE_ENV = 'test';
    render(<SwiperComponent />);
    const swiperInstance = screen.getByTestId('swiper-component');
    expect(swiperInstance).toBeInTheDocument();
    expect(swiperInstance.getAttribute('data-swiper-loop')).toBeNull();
  });
});
