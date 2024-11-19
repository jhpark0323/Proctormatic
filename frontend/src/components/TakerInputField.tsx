// InputField.tsx
import React from 'react';
import styles from '@/styles/Step.module.css';

interface InputFieldProps {
  label: string;
  value: string;
  dataTestId?: string; // 추가
}

const InputField: React.FC<InputFieldProps> = ({ label, value, dataTestId }) => (
  <div className={styles.InnerContainer}>
    <label>{label}</label>
    <div className={styles.InnerInputAuth}>
      <input type="text" value={value} readOnly data-testid={dataTestId} /> 
    </div>
  </div>
);

export default InputField;
