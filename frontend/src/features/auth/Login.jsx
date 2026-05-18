import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/hooks/useAuth';

import './Login.css';

const Login = () => {
  const normalizeRole = (role) => {
	if (!role) return null;

	const value = String(role).trim().toLowerCase();
	if (value === 'admin' || value === 'manager') return value;
	if (value === 'member' || value === 'user') return 'member';

	return value;
  };

  const [formData, setFormData] = useState({
	email: '',
	password: '',
	rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

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
	  const response = await axios.post('http://localhost:8080/api/auth/login', loginData, {
		headers: {
		  'Content-Type': 'application/json'
		}
	  });

	  if (response.status === 200) {
		const { token, userId, email, firstName, lastName, role } = response.data;
		const normalizedRole = normalizeRole(role);

		// Call login from AuthContext
		await login(token, {
		  id: userId,
		  email,
		  firstName,
		  lastName,
		  role: normalizedRole
		});

		if(formData.rememberMe) {
		  localStorage.setItem('rememberMe', 'true');
		}else{
		  localStorage.removeItem('rememberMe');
		}

		// Route based on role
		if (normalizedRole === 'admin' || normalizedRole === 'manager') {
		  navigate('/admin-dashboard', { replace: true });
		} else {
		  navigate('/dashboard', { replace: true });
		}
	  }
	} catch (err) {
	  console.error('Login error:', err);

	  if(err.response){
		if(err.response.status === 401){
		  setError('Invalid email or password');
		}else if(err.response.status === 400){
		  setError('Invalid, please check your login details');
		}else{
		  setError(err.response.data?.message || 'Login failed. Please try again.');
		}
	  }else if(err.request){
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

			<button type="button" className="forgot-password">
			  Forgot password?
			</button>
		  </div>

		  <button type="submit" className="login-button">
			Sign In
		  </button>

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
