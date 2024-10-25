import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import styles from '../styles/HedaerBlue.module.css';

interface HeaderBlueProps {
  userRole?: string;
}

const HeaderBlue: React.FC<HeaderBlueProps> = ({ userRole }) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout(); // 로그아웃 수행
    navigate('/'); // 홈으로 이동
  };

  return (
    <div className={styles.Header}>
      <img 
        className={styles.Logo} 
        src='/src/assets/whiteLogo.png' 
        alt="Logo" 
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}  
      />
      <div className={styles.LoginBox}>
        <div>
          <span className={styles.UserInfo}>
            반갑습니다! <span className={styles.userName}>{userRole}</span> 님
          </span>
          <button className={styles.ActionButton} onClick={handleLogout}>
            시험 퇴실하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default HeaderBlue;