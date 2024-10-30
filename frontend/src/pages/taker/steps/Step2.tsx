import React from 'react';
import styles from '@/styles/Step.module.css';
import styles2 from '@/styles/Step2.module.css';
import CustomButton from '@/components/CustomButton';
import { GiCheckMark } from "react-icons/gi";

const Step2: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>시험 주의사항</div>
        <div className={styles.StepSubTitle}>시험 응시 전 주의사항을 모두 숙지해주세요.</div>
      </div>
      <div className={styles2.StepInner}>
        <div>
          <GiCheckMark style={{ color: 'var(--PRIMARY)' }} size={20} />
          <p>영상 촬영을 위한 <span>데스크탑용 웹캡 또는 노트북</span>을 준비해주세요.</p>
        </div>
        <div>
          <GiCheckMark style={{ color: 'var(--PRIMARY)' }} size={20} />
          <p>충전기 연결 상태, 저장 공간, 인터넷 환경 등 원활한 <span>시험을 위한 컴퓨터 설정</span>을 완료해주세요. (외부 프로그램 사용 금지)</p>
        </div>
        <div>
          <GiCheckMark style={{ color: 'var(--PRIMARY)' }} size={20} />
          <p>영상 촬영 중 <span>사이트를 이탈하면</span> 영상 촬영이 중지될 수 있으며 이는 부정행위로 간주될 수 있어요. (시험이 끝날 때까지 끄지 마세요)</p>
        </div>
        <div>
          <GiCheckMark style={{ color: 'var(--PRIMARY)' }} size={20} />
          <p>원활한 인터넷 환경을 위해 휴대폰 핫스팟을 통한 인터넷 연결을 지양해요.</p>
        </div>
        <div>
          <GiCheckMark style={{ color: 'var(--PRIMARY)' }} size={20} />
          <p>이메일 계정을 아이디로 활용합니다. 영상 녹화 혹은 업로드 중 웹이 종료되었을 때 <span>동일한 이메일 계정을 입력해</span> 재접속 해주세요.</p>
        </div>
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext}>확인했습니다</CustomButton>
      </div>
    </>
  );
};

export default Step2;
