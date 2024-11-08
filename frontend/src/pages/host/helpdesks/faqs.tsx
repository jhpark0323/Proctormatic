import styles from "@/styles/Helpdesk.module.css";
import { fonts } from "@/constants";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import HostModal from "@/components/HostModal";

interface FAQ {
  id: number;
  title: string;
  content: string;
}

const Faqs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = () => {
    axiosInstance
      .get("/helpdesk/faq/")
      .then((response) => {
        setFaqs(response.data.faqList);
      })
      .catch((error) => {
        console.error("FAQ 조회 실패:", error);
      });
  };

  const handleFaqClick = (faq: FAQ) => {
    axiosInstance
      .get(`helpdesk/faq/${faq.id}`)
      .then((response) => {
        setSelectedFaq({
          id: faq.id,
          title: response.data.title,
          content: response.data.content,
        });
        setIsModalOpen(true);
      })
      .catch((error) => {
        console.error("FAQ 상세 조회 실패:", error);
      });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFaq(null);
  };

  return (
    <>
      <div className={styles.faqContainer}>
        <div className={styles.title}>
          <span style={fonts.HEADING_LG_BOLD}>자주 묻는 질문(FAQ)</span>
        </div>
        <div className={styles.faqContent}>
          <div className={styles.faqWrap}>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={styles.faqItem}
                onClick={() => handleFaqClick(faq)}
              >
                <span>{faq.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && selectedFaq && (
        <HostModal
          onClose={handleModalClose}
          title={selectedFaq.title}
          buttonLabel="닫기"
          handleButton={handleModalClose}
        >
          <div className={styles.postModal}>
            <div>{selectedFaq.content}</div>
          </div>
        </HostModal>
      )}
    </>
  );
};

export default Faqs;
