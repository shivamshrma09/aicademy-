import React, { useState } from "react";
import axios from "axios";
import { useUserData } from "../context/UserContext";
import OTPInput from "./OTPInput";

const LoginPage = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const { setUserData } = useUserData();

  React.useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:1000"}/students/send-login-otp`,
        { 
          email: email.toLowerCase().trim(), 
          password 
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setStep(2);
        setOtpTimer(600); // 10 minutes
        setErrors({ success: response.data.message });
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      
      if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else if (err.response?.status === 401) {
        setErrors({ general: "Invalid email or password" });
      } else {
        setErrors({ general: "Failed to send OTP. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Please enter 6-digit OTP" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:1000"}/students/login`,
        { 
          email: email.toLowerCase().trim(), 
          otp 
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        setUserData(user);
        onNavigate("dashboard");
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      
      if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({ general: "Invalid OTP. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    setErrors({});
    setOtp("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:1000"}/students/send-login-otp`,
        { email: email.toLowerCase().trim(), password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setOtpTimer(600);
        setErrors({ success: "OTP resent successfully" });
      }
    } catch (err) {
      setErrors({ general: "Failed to resend OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-6xl flex rounded-2xl shadow-2xl overflow-hidden bg-white" style={{ minHeight: '600px', maxHeight: '90vh' }}>
        {/* Left Side - Form */}
        <div className="w-1/2 p-6 flex flex-col justify-center" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="max-w-md mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-3xl font-bold" style={{ color: '#356AC3' }}>
                {step === 1 ? 'Welcome Back' : 'Verify OTP'}
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                {step === 1 ? 'Enter your credentials to continue' : `Enter OTP sent to ${email}`}
              </p>
            </div>

            {errors.general && (
              <div className="text-sm text-red-600 bg-red-100 p-2 rounded mb-3">
                {errors.general}
              </div>
            )}

            {errors.success && (
              <div className="text-sm text-green-600 bg-green-100 p-2 rounded mb-3">
                {errors.success}
              </div>
            )}

            <form onSubmit={step === 1 ? sendOTP : (e) => { e.preventDefault(); verifyOTP(); }}>
              {step === 1 ? (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="demo@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="mr-2"
                      />
                      <label className="text-xs text-gray-600">Show Password</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
                    style={{ backgroundColor: '#356AC3' }}
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <OTPInput length={6} onComplete={setOtp} disabled={isLoading} />
                    {errors.otp && <p className="text-xs text-red-500 text-center mt-2">{errors.otp}</p>}
                    
                    {otpTimer > 0 && (
                      <p className="text-xs text-gray-600 text-center mt-3">
                        OTP expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 mb-3 text-sm"
                    style={{ backgroundColor: '#356AC3' }}
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                  </button>

                  <div className="flex justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                      className="text-gray-600"
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      onClick={resendOTP}
                      disabled={isLoading || otpTimer > 540}
                      className="hover:underline"
                      style={{ color: '#356AC3' }}
                    >
                      Resend OTP
                    </button>
                  </div>
                </>
              )}
            </form>

            {step === 1 && (
              <button
                onClick={() => onNavigate("signup")}
                className="w-full mt-3 border-2 font-medium py-2.5 rounded-lg transition text-sm"
                style={{ borderColor: '#356AC3', color: '#356AC3' }}
              >
                Sign Up
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Animated Images */}
        <div className="w-1/2 relative overflow-hidden" style={{ backgroundColor: '#174C7C' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="mb-8 animate-bounce">
                <svg className="w-32 h-32 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4">Continue Learning</h3>
              <p className="text-lg opacity-90">Access Your Dashboard</p>
              <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600">✓</div>
                  <span>Track Progress</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600">✓</div>
                  <span>Access Materials</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600">✓</div>
                  <span>Join Live Sessions</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-20 w-16 h-16 bg-white opacity-10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
