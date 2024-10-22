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

const Home = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuthStore();

  return (
    <>
      <div>Welcome to Proctormatic</div>
      <div>
        {user ? (
          <>
            <p>현재 로그인된 역할: {user.role}</p>
            <button onClick={logout}>로그아웃</button>
          </>
        ) : (
          <>
            <button onClick={() => login('taker')}>응시자 로그인</button>
            <button onClick={() => login('host')}>주최자 로그인</button>
          </>
        )}
      </div>
      <div>
        <button onClick={() => navigate('/taker')}>응시자 페이지로 이동</button>
        <button onClick={() => navigate('/host')}>주최자 페이지로 이동</button>
      </div>
    </>
  );
};

export default Home;
