import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  validateEmail,
  ToasterMessages,
  FieldErrors,
  FormLabels,
} from '../../../services/validationService';

import { showError, showSuccess, showWarn } from '../../../services/toasterService';
import { TOKEN } from '../../../constants/strings';

import { Loader } from '../../../App';
import { Api_url } from '../../../networkCalls/Apiurls';
import ValidatedInput from '../../../components/validatedInput';
import Captcha from './captcha';
import PasswordInput from '../../../components/PasswordInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [passwordExpired, setPasswordExpired] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);

  const navigate = useNavigate();
  const isFormValid = validateEmail(email) && password && captchaValid;

  const loginUser = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axios.post(Api_url.login, {
        user_email: email,
        user_password: password,
      });

      localStorage.setItem("TOKEN", data.access_token);
      localStorage.setItem('temp_password_value', password);

      if (data.temp_password) {
        showWarn(ToasterMessages.tempPassword);
        navigate('/change-pwd', { replace: true });
        return;
      }
      

      if (data.password_expired) {
        setPasswordExpired(true);
        showWarn(ToasterMessages.passwordExpired);
        navigate('/change-pwd', { replace: true });
        return;
      }

      showSuccess(ToasterMessages.loginSuccess);
      navigate('/home', { replace: true });

    } catch (err: any) {
      const response = err?.response?.data;

      if (response?.remaining_attempts !== undefined) {
        setRemainingAttempts(response.remaining_attempts);
      }

      if (response?.message?.toLowerCase().includes('locked')) {
        setAccountLocked(true);
      }

      showError(response?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setRemainingAttempts(null);
      setPasswordExpired(false);
      setAccountLocked(false);

      if (!isFormValid) {
        if (!validateEmail(email)) showWarn(FieldErrors.email);
        if (!password) showWarn(FieldErrors.password);
        if (!captchaValid) showError(ToasterMessages.captchaInvalid);
        return;
      }

      loginUser();
    },
    [email, password, captchaValid, isFormValid, loginUser]
  );

  return (
    <div style={{ maxWidth: '320px', margin: '100px auto' }}>
      <h2>Login</h2>

      {remainingAttempts !== null && (
        <div style={{ color: 'orange', marginBottom: '10px' }}>
          Remaining attempts: {remainingAttempts}
        </div>
      )}

      {/* {accountLocked && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {ToasterMessages.accountLocked}
        </div>
      )} */}

      {passwordExpired && (
        <div style={{ color: 'orange', marginBottom: '10px' }}>
          {ToasterMessages.passwordExpired}
        </div>
      )}

      {loading && <Loader />}

      <form onSubmit={handleSubmit}>
        <ValidatedInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
          validator={validateEmail}
          errorMessage={FieldErrors.email}
        />

          
        <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            required
        />

  


        <Captcha onValidChange={setCaptchaValid} />

        <button
          type="submit"
          disabled={!isFormValid || loading}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: isFormValid ? '#1E90FF' : '#ccc',
            color: isFormValid ? '#fff' : '#666',
            cursor: isFormValid ? 'pointer' : 'not-allowed',
            marginTop: '1rem',
          }}
        >
          {loading ? FormLabels.loggingIn : FormLabels.login}
        </button>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
    <button
      type="button"
      style={{ background: 'none', border: 'none', color: '#1E90FF', cursor: 'pointer' }}
      onClick={() => navigate('/forgot-pwd', { replace: true })}
    >
      Forgot password?
    </button>
  </div>
      </form>
      
    </div>
  );
};

export default Login;