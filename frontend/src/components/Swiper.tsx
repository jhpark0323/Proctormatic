import { Navigation, Autoplay } from 'swiper/modules';
import Landing1 from '../assets/Landing1.png';
import semiLogo from '../assets/semiLogo.png';
import cLab from '../assets/cLab.png';
import metamong from '@/assets/metamong.avif';
import phones from '../assets/phones.png';
import styles from '../styles/Swiper.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

const SwiperComponent = () => {
  // 테스트 환경에서는 loop를 비활성화
  const isTestEnvironment = process.env.NODE_ENV === 'test';

  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      spaceBetween={50}
      slidesPerView={1}
      slidesPerGroup={1} // 슬라이드 그룹 개수 조정
      pagination={{ clickable: true }} // 점 추가 및 클릭 가능 설정
      loop={!isTestEnvironment} // 테스트 환경이 아닐 때만 loop 활성화
      className={styles.SwiperComponent}
      data-testid="swiper-component" // Swiper에 data-testid 추가
      autoplay={{ delay: 3000, disableOnInteraction: false }}
    >
      {/* 첫번째 슬라이드 */}
      <SwiperSlide>
        <div className={styles.wrapper}>
          <div className={styles.leftBox}>
            <div>
              <div className={styles.firstPart}></div>
              <div className={styles.middlePart}>
                <div className={styles.secondBlock}>
                  <div>스스로 척척, 온라인 시험의 새로운 기준</div>
                  <img src={semiLogo} alt='semiLogo' />
                  <div className={styles.teamName}>with. 메타몽</div>
                </div>
              </div>
            </div>
            <div className={styles.leftImgBlock}>
              <img className={styles.ces} src={cLab} alt="" />
              <img className={styles.if} src={metamong} alt="메타몽사진" />
            </div>
          </div>
          <img className={styles.rightImgBox} src={Landing1} alt="" />
        </div>
      </SwiperSlide>

      {/* 두번째 슬라이드 */}
      <SwiperSlide>
      <div className={styles.wrapper}>
        <div className={styles.leftBox}>
          <div className={styles.middlePart}>
            <div className={styles.secondBlock}>
              <div className={styles.eventTitle}>프록토매틱 출시 기념 런칭 이벤트</div>
              <div>
                <span className={`${styles.isptiL} ${styles.orange}`}>무료 10명 시험</span>
                <span className={styles.isptiL}>을 통해</span>
              </div>
              <div className={styles.centerText}>
                <span className={styles.isptiL}>프록토매틱을 </span>
                <span className={`${styles.isptiL} ${styles.marginL}`}> 직접 경험해 보세요!</span>
              </div>
            </div>
          </div>
        </div>
        <img className={styles.rightImgBox2} src={phones} alt="" />
      </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperComponent;
