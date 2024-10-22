// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const Home = () => {
//   const navigate = useNavigate();

//   return (
//     <>
//       <div>Welcome to Proctormatic</div>
//       <button onClick={() => navigate('/taker')}>응시자</button>
//       <button onClick={() => navigate('/host')}>주최자</button>
//     </>
//   )
// }

// export default Home;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import HeaderWhite from '../components/HeaderWhite';

const Home = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuthStore();

  const handleLogin = (role: string) => {
    login(role);
    if (role === 'taker') {
      navigate('/taker')
    } else if (role === 'host') {
      navigate('/host')
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  }

  return (
    <>
      <HeaderWhite />
      {/* <div>Welcome to Proctormatic</div>
      <div>
        {/* {user ? (
          <>
            <p>현재 로그인된 역할: {user.role}</p>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <button onClick={() => handleLogin('taker')}>응시자 로그인</button>
            <button onClick={() => handleLogin('host')}>주최자 로그인</button>
          </>
        )}
      </div> 
      */}
    </>
  );
};

export default Home;
