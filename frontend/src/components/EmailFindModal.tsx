import React, { useState } from 'react';
import axiosInstance from '@/utils/axios';
import styles from '@/styles/EmailFindModal.module.css';
import cancelButtonImg from '@/assets/cancleButton.png';

interface EmailFindModalProps {
  onClose: () => void;
  title: string;
  subtitle: string | string[];
  onSubmit: (isFound: boolean, count: number) => void;
  onLoginRedirect: () => void;
  onRetrySearch: () => void;
}

// 이메일 마스킹 함수
const maskEmail = (email: string) => {
  const [localPart, domain] = email.split("@");
  
  if (localPart.length <= 3) {
    // localPart가 3자리 이하인 경우 앞 한 글자만 남기고 마스킹
    return `${localPart[0]}***@${domain}`;
  } else {
    // localPart가 4자리 이상인 경우 마지막 세 자리를 제외하고 마스킹
    return `${localPart.slice(0, localPart.length - 3)}***@${domain}`;
  }
};

const EmailFindModal: React.FC<EmailFindModalProps> = ({
  onClose,
  title,
  subtitle,
  onSubmit,
  onLoginRedirect,
  onRetrySearch,
}) => {
  const [name, setName] = useState('');
  const [year, setYear] = useState('2000');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [foundEmails, setFoundEmails] = useState<{ email: string; joinedOn: string }[]>([]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(e.target.value);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDay(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const birth = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;

    try {
      const response = await axiosInstance.post('/users/find/email/', {
        name,
        birth,
      });
      if (response.status === 200) {
        const { emailList, size } = response.data;
        const emails = emailList.map((item: { email: string; joined_on: string }) => ({
          email: maskEmail(item.email), // 마스킹된 이메일
          joinedOn: item.joined_on,
        }));

        setFoundEmails(emails);
        setIsSubmitted(true);
        onSubmit(size > 0, size);
      }
    } catch (error) {
      console.error('아이디 검색 실패:', error);
      setFoundEmails([]);
      setIsSubmitted(true);
      onSubmit(false, 0);
    }
  };

  return (
    <>
      <div className={styles.blurBackground} />
      <div className={styles.Modal} data-testid="register-modal">
        <div className={styles.wrapper}>
          <div className={styles.headerBox}>
            <img
              className={styles.cancelButton}
              src={cancelButtonImg}
              alt="close"
              onClick={onClose}
            />
          </div>
          <div className={styles.inBox}>
            <div className={styles.inBoxInner}>
              <div className={styles.titleBox}>
                <div className={styles.upLine}>{title}</div>
                <div className={styles.downLine}>
                  {Array.isArray(subtitle)
                    ? subtitle.map((line, index) => <p key={index}>{line}</p>)
                    : subtitle}
                </div>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className={styles.formInner}>
                    <div className={styles.formInnerNameBox}>
                      <span className={styles.formInnerName}>주최자 이름 (한글 2 - 10 자)</span>
                    </div>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="이름 입력"
                      value={name}
                      onChange={handleNameChange}
                      autoComplete="off"
                    />
                  </div>

                  <div className={styles.formInner}>
                    <div className={styles.formInnerNameBox}>
                      <span className={styles.formInnerName}>생년월일</span>
                    </div>
                    <div className={styles.birthDateBox}>
                      <div className={styles.birthInner}>
                        <select value={year} onChange={handleYearChange}>
                          {[...Array(2023 - 1924 + 1)].map((_, i) => (
                            <option key={i} value={(2023 - i).toString()}>
                              {2023 - i}년
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.birthInner}>
                        <select value={month} onChange={handleMonthChange}>
                          {[...Array(12)].map((_, i) => (
                            <option key={i} value={(i + 1).toString()}>
                              {i + 1}월
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.birthInner}>
                        <select value={day} onChange={handleDayChange}>
                          {[...Array(31)].map((_, i) => (
                            <option key={i} value={(i + 1).toString()}>
                              {i + 1}일
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className={styles.buttonBox}>
                    <button
                      type="submit"
                      className={styles.registerButton}
                      disabled={!name.trim()}
                    >
                      검색하기
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.resultBox}>
                  <div className={styles.findResultBox}>
                    {foundEmails.length > 0 ? (
                      foundEmails.map((item, index) => (
                        <div key={index} className={styles.emailInfo}>
                          <div className={styles.foundEmail}>{item.email}</div>
                          <div className={styles.joinedOn}>({item.joinedOn} 가입)</div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noResult}>검색된 아이디가 없음.</div>
                    )}
                  </div>

                  <div className={styles.noticeMessage}>
                    * 보안을 위해 아이디의 일부만 표기되어요.
                  </div>
                  
                  {foundEmails.length > 0 ? (
                    <button className={styles.registerButton} onClick={onLoginRedirect}>
                      로그인 바로가기
                    </button>
                  ) : (
                    <button className={styles.registerButton} onClick={onRetrySearch}>
                      검색 다시하기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailFindModal;
