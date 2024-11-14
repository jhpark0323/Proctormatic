import React from 'react';
import styles from '@/styles/Step.module.css';
import styles3 from '@/styles/Step3.module.css';
import CustomButton from '@/components/CustomButton';
import NoPhone from '@/assets/NoPhone.png';
import TestPerson from '@/assets/TestPerson.png';
import Upload from '@/assets/Upload.png';
import Rules from '@/assets/Rules.png';
import NoMask from '@/assets/NoMask.png';

const Step3: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <>
      <div className={styles.StepTitleBox}>
        <div data-testid="step-title" className={styles.StepTitle}>부정행위 안내</div>
        <div data-testid="step-subtitle" className={styles.StepSubTitle}>
          아래와 같은 사항들이 지켜지지 않을 시 부정행위 처리될 수 있습니다.
        </div>
      </div>
      <div className={styles3.StepInner}>
        <div>
          <div className={styles3.backImg}>
            <img data-testid="image-test-person" src={TestPerson} width='24px' height='24px' alt='TestPerson'/>
          </div>
          <p data-testid="description-test-person">시험 중 <span>얼굴, 양손이 모두 보이도록</span> 웹캡을 세팅 후 응시자세를 유지해주세요.</p>
        </div>
        <div>
          <div className={styles3.backImg}>
            <img data-testid="image-upload" src={Upload} width='24px' height='24px' alt="Upload" />
          </div>
          <p data-testid="description-upload">시험 종료 후, <span>영상 업로드가 끝날 때까지 웹 사이트를 유지</span>해주세요.</p>
        </div>
        <div>
          <div className={styles3.backImg}>
            <img data-testid="image-rules" src={Rules} width='24px' height='24px' alt="Rules" />
          </div>
          <p data-testid="description-rules">부정행위 적발 시, 주최 측 <span>부정행위처리기준에 의거해 처리</span>됩니다.</p>
        </div>
        <div>
          <div className={styles3.backImg}>
            <img data-testid="image-no-phone" src={NoPhone} width='35px' height='35px' alt="NoPhone" />
          </div>
          <p data-testid="description-no-phone">시험 시간 도중 <span>웹 사이트 이탈로 인한 재접속 및 휴대폰 사용</span>은 부정행위로 간주될 수 있습니다.</p>
        </div>
        <div>
          <div className={styles3.backImg}>
            <img data-testid="image-no-mask" src={NoMask} width='35px' height='35px' alt="NoMask" />
          </div>
          <p data-testid="description-no-mask">얼굴을 가릴 수 있는 복장 및 <span>시험과 무관한 소품 착용을 금지</span>합니다.</p>
        </div>
      </div>
      <div className={styles.StepFooter}>
        <CustomButton data-testid="confirm-button" onClick={onNext}>확인했습니다</CustomButton>
      </div>
    </>
  );
};

export default Step3;
