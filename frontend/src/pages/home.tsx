import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import HeaderWhite from '../components/HeaderWhite';
import Modal from '../components/Modal';
import styles from '../styles/Home.module.css';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, login, logout } = useAuthStore();

  const handleLogin = (role: string) => {
    login(role);
    if (role === 'taker') {
      navigate('/taker');
    } else if (role === 'host') {
      navigate('/host');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <HeaderWhite onLoginClick={openModal} />
      {isModalOpen && <Modal onClose={closeModal} />}
      {isModalOpen && (
        <div className={styles.backdrop} data-testid="backdrop" onClick={closeModal}></div>
      )}
    </>
  );
};

export default Home;
