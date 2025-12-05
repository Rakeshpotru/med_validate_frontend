import React, { useState, useEffect } from 'react';

interface ValidatedInputProps {
  type: 'text' | 'email' | 'password';
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  validator: (val: string) => boolean;
  errorMessage: string;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  validator,
  errorMessage,
}) => {
  const [touched, setTouched] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    setValid(validator(value));
  }, [value, validator]);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        required
        style={{
          width: '100%',
          padding: '0.5rem',
          border: touched && !valid ? '1px solid red' : '1px solid #ccc',
        }}
      />
      {touched && !valid && (
        <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;