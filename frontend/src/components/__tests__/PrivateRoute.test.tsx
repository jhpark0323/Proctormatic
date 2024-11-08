import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import PrivateRoute from '@/components/PrivateRoute';

// Helper 함수: 상태를 설정
const setAuthStore = (user: { role: string } | null) => {
  act(() => {
    useAuthStore.setState({ user });
  });
};

describe('PrivateRoute 컴포넌트 테스트', () => {
  afterEach(() => {
    // 테스트가 끝날 때마다 상태를 초기화
    act(() => {
      useAuthStore.setState({ user: null });
    });
  });

  test('로그인되지 않은 사용자는 홈으로 잘 리다이렉트 시키는지 확인', () => {
    // 로그인되지 않은 상태로 설정
    setAuthStore(null);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={<PrivateRoute allowedRoles={['admin']}><div>Protected Content</div></PrivateRoute>}
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  test('허용된 역할의 사용자는 보호된 콘텐츠에 접근 가능한지 확인', () => {
    // 허용된 역할로 로그인된 상태 설정
    setAuthStore({ role: 'admin' });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={<PrivateRoute allowedRoles={['admin']}><div>Protected Content</div></PrivateRoute>}
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('허용되지 않은 역할의 사용자는 홈으로 리다이렉트 되는지 확인', () => {
    // 허용되지 않은 역할로 로그인된 상태 설정
    setAuthStore({ role: 'user' });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={<PrivateRoute allowedRoles={['admin']}><div>Protected Content</div></PrivateRoute>}
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});
