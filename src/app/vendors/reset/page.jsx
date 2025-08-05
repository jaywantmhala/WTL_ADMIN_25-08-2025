"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../../container/components/Navbar";
import { useRouter } from "next/navigation";

const PasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);

const router = useRouter()
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email) {
      setEmail(user.email);
    } else {
      setMessage("No user data found in localStorage.");
    }
  }, []);

  useEffect(() => {
    let interval;
    if (resendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
      setTimer(60);
    }
    return () => clearInterval(interval);
  }, [resendDisabled, timer]);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        " https://api.worldtriplink.com/api/password-reset/request-reset",
        null,
        { params: { email } }
      );
      setMessage(response.data);
      setOtpSent(true);
      setResendDisabled(true);
    } catch (error) {
      setMessage("Error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        " https://api.worldtriplink.com/api/password-reset/verify-otp",
        null,
        { params: { email, otp } }
      );
      if (response.data === true) {
        setMessage("OTP verified successfully.");
        setOtpVerified(true);
      } else {
        setMessage("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setMessage("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        " https://api.worldtriplink.com/api/password-reset/reset-password",
        null,
        { params: { email, newPassword } }
      );
      setMessage(response.data);
      router.push("/"); // Correct usage of router.push
    } catch (error) {
      setMessage("Error occurred while resetting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
 <div className="flex h-screen overflow-hidden">
  <Navbar />
  <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 overflow-y-auto">
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md absolute left-[50%] sm:ml-36 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] 2xl:w-[40vw] max-w-md">
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6">
        Password Reset
      </h2>

      {!otpSent && !otpVerified && (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
            disabled
          />
          <button
            onClick={handleSendOTP}
            className="w-full p-2 sm:p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm sm:text-base"
            disabled={loading || resendDisabled}
          >
            {loading
              ? "Sending..."
              : resendDisabled
              ? `Resend OTP in ${timer}s`
              : "Send OTP"}
          </button>
        </div>
      )}

      {otpSent && !otpVerified && (
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <button
            onClick={handleVerifyOTP}
            className="w-full p-2 sm:p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {otpVerified && (
        <div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <button
            onClick={handleResetPassword}
            className="w-full p-2 sm:p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      )}

      {message && (
        <p className="text-center mt-3 sm:mt-4 text-green-500 text-sm sm:text-base">
          {message}
        </p>
      )}

      {loading && (
        <div className="flex justify-center items-center mt-3 sm:mt-4">
          <div className="animate-spin border-t-4 border-blue-500 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-solid"></div>
        </div>
      )}
    </div>
  </div>
</div>
</>
  );
};

export default PasswordResetPage;