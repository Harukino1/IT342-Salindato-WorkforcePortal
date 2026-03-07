import React, { use, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../components/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if(error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const loginData = {
      email: formData.email,
      password: formData.password,
    }

    try{
      setLoading(true);
      console.log('Sending login data:', loginData);

      const response = await axios.post('http://localhost:8080/api/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', response.data);

      if (response.status === 200) {
        const { token, userId, email, firstname, lastName, role } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          userId,
          email,
          firstname,
          lastName,
          role
        }));

        if(formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }else{
          sessionStorage.setItem('token', token);
          localStorage.removeItem('rememberMe');
        }

        console.log('Login successful');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.log('Backend error message:', err.response?.data);

      if(error.response){
        if(error.response.status === 401){
          setError('Invalid email or password');
        }else if(error.response.status === 400){
          setError('Invalid, please check your login details');
        }else{
          setError(error.response.data?.message || 'Login failed. Please try again.');
        }
      }else if(error.request){
        setError('Backend no response.');
      }else{
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue</p>
        </div>

        {/* Display Messages */}
        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="alert" style={{ background: '#fff3cd', color: '#856404' }}>
            ⏳ Signing in...
          </div>
        )}

        <form onSubmit={handleSubmit}>
            {/* EMAIL FIELD */}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* PASSWORD FIELD */}
          <div className="form-group password-group">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={showPassword ? 'Enter your password' : '••••••••'}
                required
              />

                {/* PASSWORD VISIBILITY FIELD */}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🫣' : '👀'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label>Remember me</label>
            </div>

            <a href="#forgot-password" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>

          {/* REGISTER FIELD */}
          <div className="signup-link">
            Don’t have an account?
            <Link to="/register"> Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;