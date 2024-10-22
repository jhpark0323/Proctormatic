import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import TakerHome from './pages/taker/TakerHome';
import HostHome from './pages/host/HostHome';
import { useAuthStore } from './store/useAuthStore';
import PrivateRoute from './components/PrivateRoute';

function App() {
  // const fetchUser = useAuthStore((state) => state.fetchUser);

  // useEffect(() => {
  //   fetchUser();
  // }, [fetchUser]);


  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path="/taker"
          element={
            <PrivateRoute allowedRoles={['taker']}>
              <TakerHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/host"
          element={
            <PrivateRoute allowedRoles={['host']}>
              <HostHome />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
