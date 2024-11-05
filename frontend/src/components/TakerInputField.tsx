// InputField.tsx
import React from 'react';
import styles from '@/styles/Step.module.css';

interface InputFieldProps {
  label: string;
  value: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value }) => (
  <div className={styles.InnerContainer}>
    <label>{label}</label>
    <div className={styles.InnerInputAuth}>
      <input type="text" defaultValue={value} readOnly />
    </div>
  </div>
);

export default InputField;
