import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    // 로그인되지 않았을 때 홈으로 리다이렉트
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 사용자의 역할이 허용되지 않은 경우 접근 차단
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;