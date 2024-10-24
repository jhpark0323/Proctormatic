import { render, screen } from '@testing-library/react';
import SwiperComponent from '../Swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

describe('Swiper 컴포넌트 테스트', () => {
  // Swiper 컴포넌트가 정상적으로 렌더링되는지 확인
  it('Swiper 컴포넌트가 올바르게 렌더링됩니다.', () => {
    render(<SwiperComponent />);
    // 첫 번째 슬라이드의 텍스트가 화면에 나타나는지 확인
    expect(screen.getByText(/스스로 척척, 온라인 시험의 새로운 기준/i)).toBeInTheDocument();
    // semiLogo 이미지가 렌더링되었는지 확인
    expect(screen.getByAltText(/semiLogo/i)).toBeInTheDocument();
    // 팀 이름 "with. 메타몽"이 화면에 나타나는지 확인
    expect(screen.getByText(/with. 메타몽/i)).toBeInTheDocument();
  });

  // 두 번째 슬라이드 내용이 올바르게 렌더링되는지 확인
  it('두 번째 슬라이드 내용이 올바르게 렌더링됩니다.', () => {
    render(<SwiperComponent />);
    // 두 번째 슬라이드의 이벤트 텍스트가 화면에 나타나는지 확인
    expect(screen.getByText(/프록토매틱 출시 기념 런칭 이벤트/i)).toBeInTheDocument();
    // "무료 10명 시험" 텍스트가 렌더링되었는지 확인
    expect(screen.getByText(/무료 10명 시험/i)).toBeInTheDocument();
    // "직접 경험해 보세요!" 텍스트가 화면에 나타나는지 확인
    expect(screen.getByText(/직접 경험해 보세요!/i)).toBeInTheDocument();
  });

  // 테스트 환경에서는 loop가 비활성화되는지 확인
  it('테스트 환경에서는 loop가 비활성화됩니다.', () => {
    process.env.NODE_ENV = 'test';
    render(<SwiperComponent />);
    
    // Swiper 컴포넌트를 찾고, loop 속성이 false인지 확인
    const swiperInstance = screen.getByTestId('swiper-component');
    expect(swiperInstance).toBeInTheDocument();
    // Swiper 컴포넌트에 loop가 false로 설정되어야 함
    expect(swiperInstance.getAttribute('data-swiper-loop')).toBeNull();
  });
});
