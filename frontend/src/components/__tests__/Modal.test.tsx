// import { render, screen, fireEvent } from '@testing-library/react';
// import { BrowserRouter as Router } from 'react-router-dom';
// import Modal from '../LoginModal';
// import '@testing-library/jest-dom';
// import { jest } from '@jest/globals';

// describe('Modal 컴포넌트 테스트', () => {
//   const mockOnClose = jest.fn();
//   const mockOnLogin = jest.fn(); // Add a mock for the onLogin function
//   const defaultProps = {
//     isOpen: true,
//     onClose: mockOnClose,
//     title: '테스트 제목',
//     subtitle: '테스트 부제목',
//     onLogin: mockOnLogin, // Include the mock in the defaultProps
//   };

//   beforeEach(() => {
//     localStorage.clear();
//     mockOnClose.mockClear();
//     mockOnLogin.mockClear(); // Clear mockOnLogin before each test
//   });

//   it('X 이미지를 클릭하면 모달이 닫혀야 합니다.', () => {
//     render(
//       <Router>
//         <Modal {...defaultProps} />
//       </Router>
//     );

//     const closeButton = screen.getByAltText('close');
//     fireEvent.click(closeButton);

//     expect(mockOnClose).toHaveBeenCalledTimes(1);
//   });

//   it('소제목이 문자열일 때 제목이 잘 렌더링 되어야 합니다.', () => {
//     render(
//       <Router>
//         <Modal {...defaultProps} />
//       </Router>
//     );

//     expect(screen.getByText('테스트 제목')).toBeInTheDocument();
//     expect(screen.getByText('테스트 부제목')).toBeInTheDocument();
//   });

//   it('소제목이 배열일 때 각 줄이 제대로 렌더링해야 합니다.', () => {
//     const subtitleArray = ['첫 번째 줄', '두 번째 줄', '세 번째 줄'];
//     render(
//       <Router>
//         <Modal {...defaultProps} subtitle={subtitleArray} />
//       </Router>
//     );

//     subtitleArray.forEach(line => {
//       expect(screen.getByText(line)).toBeInTheDocument();
//     });
//   });

//   it('주최자 버튼 클릭 시 "host"로 로그인되고 로컬 스토리지에 저장되어야 합니다.', () => {
//     render(
//       <Router>
//         <Modal {...defaultProps} />
//       </Router>
//     );

//     const hostButton = screen.getByText('주최자');
//     fireEvent.click(hostButton);

//     expect(mockOnLogin).toHaveBeenCalledWith('host');
//     expect(localStorage.getItem('userRole')).toBe('host');
//   });

//   it('응시자 버튼 클릭 시 "taker"로 로그인되고 로컬 스토리지에 저장되어야 합니다.', () => {
//     render(
//       <Router>
//         <Modal {...defaultProps} />
//       </Router>
//     );

//     const takerButton = screen.getByText('응시자');
//     fireEvent.click(takerButton);

//     expect(mockOnLogin).toHaveBeenCalledWith('taker');
//     expect(localStorage.getItem('userRole')).toBe('taker');
//   });
// });
