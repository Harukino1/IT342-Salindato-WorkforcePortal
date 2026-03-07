import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../components/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    {/* Password Matching */}
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    {/* Password Length Validation */}
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const registrationData = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      role: 'USER'
    };

    try {
      setLoading(true);
      console.log('Sending registration data:', registrationData);

      const response = await axios.post('http://localhost:8080/api/auth/register', registrationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Registration response:', response);

      if (response.status === 201 || response.status === 200) {
        setSuccess('Registration successful! Redirecting to login...');
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          password: '',
          confirmPassword: ''
        });

        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        if (error.response.status === 409) {
          setError('Email already exists. Please use a different email.');
        } else if (error.response.status === 400) {
          setError('Invalid registration data. Please check your inputs.');
        } else {
          setError(error.response.data?.message || 'Registration failed. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please check if backend is running.');
      } else {
        setError('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Fill in the details below</p>
        </div>

        {/* Display Messages */}
        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            ✅ {success}
          </div>
        )}

        {loading && (
          <div className="alert" style={{ background: '#fff3cd', color: '#856404' }}>
            ⏳ Processing registration...
          </div>
        )}

        {/* Email */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Firstname */}
          <div className="name-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Lastname */}
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="+63 9XX XXX XXXX"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(prev => !prev)}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Redirect */}
          <div className="login-link">
            Already have an account?
            <Link to="/"> Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;