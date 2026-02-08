import React, { useState, useContext } from "react";
import { UserDataContext } from "../context/UserContext";
import { Eye, EyeOff } from "lucide-react";
import axios from 'axios';
import OTPInput from "./OTPInput";
import "./SignupPage.css";

const SignupPage = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [course, setCourse] = useState("Computer Science");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const { setUserData } = useContext(UserDataContext);

  React.useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const validateEmail = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";
    return newErrors;
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    else if (name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";
    
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (!confirmPassword) newErrors.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    if (!course) newErrors.course = "Please select a course";
    if (!agreeTerms) newErrors.agreeTerms = "You must agree to the terms";
    
    return newErrors;
  };

  const proceedToDetails = (e) => {
    e.preventDefault();
    const validationErrors = validateEmail();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const sendOTPAndProceed = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:1000"}/students/send-registration-otp`,
        { email: email.toLowerCase().trim() },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );

      if (response.data.success) {
        setStep(3);
        setOtpTimer(600);
        setErrors({ success: response.data.message });
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Failed to send OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const submitHandler = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Please enter 6-digit OTP" });
      return;
    }
    
    setErrors({});
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:1000"}/students/register`,
        { name: name.trim(), email: email.toLowerCase().trim(), password, course, otp },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        setUserData(user);
        onNavigate("dashboard");
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Registration failed. Please try again." });
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
        `${import.meta.env.VITE_API_URL || "http://localhost:1000"}/students/send-registration-otp`,
        { email: email.toLowerCase().trim() },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );

      if (response.data.success) {
        setOtpTimer(600);
        setErrors({ success: "OTP sent successfully" });
      }
    } catch (err) {
      setErrors({ general: "Failed to send OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-6xl flex rounded-2xl shadow-2xl overflow-hidden bg-white" style={{ minHeight: '600px', maxHeight: '90vh' }}>
        {/* Left Side - Form */}
        <div className="w-2/5 p-6 flex flex-col justify-center" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="max-w-md mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-3xl font-bold" style={{ color: '#356AC3' }}>
                {step === 1 ? 'Create Account' : step === 2 ? 'Complete Profile' : 'Verify Email'}
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                {step === 1 ? 'Enter your email to get started' : step === 2 ? 'Fill in your details' : `Enter OTP sent to ${email}`}
              </p>
            </div>

            <form onSubmit={step === 1 ? proceedToDetails : step === 2 ? sendOTPAndProceed : (e) => { e.preventDefault(); submitHandler(); }}>
          {errors.general && (
            <div className="text-sm text-red-700 bg-red-100 p-2 rounded mb-3">
              {errors.general}
            </div>
          )}

          {errors.success && (
            <div className="text-sm text-green-700 bg-green-100 p-2 rounded mb-3">
              {errors.success}
            </div>
          )}

          {step === 1 && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="mb-3 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-blue-600" tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="mb-3 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-blue-600" tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select value={course} onChange={(e) => setCourse(e.target.value)} disabled={isLoading} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-3 flex items-center">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} disabled={isLoading} className="mr-2" />
                <label className="text-xs text-gray-700">I agree to terms</label>
              </div>
              {errors.agreeTerms && <p className="text-red-600 text-xs mb-2">{errors.agreeTerms}</p>}
            </>
          )}

          {step === 3 && (
            <div className="space-y-3 mb-3">
              <OTPInput length={6} onComplete={setOtp} disabled={isLoading} />
              {errors.otp && <p className="text-xs text-red-500 text-center">{errors.otp}</p>}
              
              {otpTimer > 0 && (
                <p className="text-xs text-gray-600 text-center">
                  OTP expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                </p>
              )}

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} disabled={isLoading} className="text-xs text-gray-600">← Back</button>
                <button type="button" onClick={resendOTP} disabled={isLoading || otpTimer > 540} className="text-xs hover:underline" style={{ color: '#356AC3' }}>Resend</button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (step === 3 && otp.length !== 6)}
            className="w-full text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
            style={{ backgroundColor: '#356AC3' }}
          >
            {isLoading ? 'Processing...' : step === 1 ? 'Continue' : step === 2 ? 'Send OTP' : 'Verify & Sign Up'}
          </button>
        </form>

        <button
          onClick={() => onNavigate("login")}
          className="w-full mt-3 border-2 font-medium py-2.5 rounded-lg transition text-sm"
          style={{ borderColor: '#356AC3', color: '#356AC3' }}
        >
          Login
        </button>
          </div>
        </div>

        {/* Right Side - Animated Images */}
        <div className="w-3/5 relative overflow-hidden" style={{ backgroundColor: '#174C7C' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="mb-8 animate-bounce">
                <svg className="w-32 h-32 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4">Welcome to IntelliLearn</h3>
              <p className="text-lg opacity-90">AI-Powered Learning Platform</p>
              <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600">✓</div>
                  <span>Smart Flashcards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600">✓</div>
                  <span>Semantic Search</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600">✓</div>
                  <span>Real-time Collaboration</span>
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

export default SignupPage;
