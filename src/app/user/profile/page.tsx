"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { auth } from "@/firebase/firbaseConfig";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface RolePermissions {
  role: 'driver' | 'accountant';
}

const UserProfile: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get('user_id');
  const [userPhone, setUserPhone] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [role, setRole] = useState<'driver' | 'accountant'>('driver'); // default role

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    setRecaptchaVerifier(verifier);

    return () => verifier.clear();
  }, []);

  const fetchUserPhone = async () => {
    const response = await fetch(`/api/login`);
    const data = await response.json();
    setUserPhone(data.user.phone);
  };

  useEffect(() => {
    if (userId) {
      fetchUserPhone();
    }
  }, [userId]);

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as 'driver' | 'accountant');
  };

  const handleRequestOtp = async () => {
    setError("");
    setResendCountdown(60);

    if (!recaptchaVerifier) {
      setError("RecaptchaVerifier is not initialized.");
      return;
    }

    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccess("OTP sent successfully.");
    } catch (err) {
      console.error(err);
      setResendCountdown(0);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      setError("Please request OTP first.");
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      setOtpVerified(true);
      setSuccess("OTP verified successfully.");
    } catch (error) {
      console.error(error);
      setError("Failed to verify OTP. Please check the OTP.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      alert('Please verify OTP first.');
      return;
    }

    const response = await fetch('/api/users/grant-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        phone,
        role,
      }),
    });

    if (response.ok) {
      alert('Access granted successfully');
      setPhone('');
      setOtp('');
      setOtpSent(false);
      setOtpVerified(false);
      setRole('driver'); // Reset to default role
    } else {
      alert('Failed to grant access');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>
      <div className="mb-8">
        <p className="text-lg text-gray-700">User ID: <span className="font-medium">{userId}</span></p>
        <p className="text-lg text-gray-700">User Phone: <span className="font-medium">{userPhone}</span></p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Grant Access to Another User</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mt-4">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={handleRoleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="driver">Driver</option>
            <option value="accountant">Accountant</option>
          </select>

          {!otpSent && (
            <Button onClick={handleRequestOtp} className="mt-4">
              Request OTP
            </Button>
          )}
        </div>

        {otpSent && (
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
            <Button onClick={handleVerifyOtp} disabled={otpVerified} className="mt-4">
              Verify OTP
            </Button>
          </div>
        )}

        {otpVerified && (
          <Button type="submit" className="mt-6">
            Grant Access
          </Button>
        )}
      </form>

      <div id="recaptcha-container"></div>

      <div className="p-10 text-center text-sm">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>
    </div>
  );
};

export default UserProfile;
