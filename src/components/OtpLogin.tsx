"use client";

import React, { FormEvent, useEffect, useState, useTransition } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import "@/app/globals.css";
import Cookies from "js-cookie";
import { countryCodes } from "@/utils/CountryCodes";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion } from "framer-motion";

function OtpLogin() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [session, setSession] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp();
    }
  }, [otp]);

  const verifyOtp = async () => {
    startTransition(async () => {
      setError("");

      try {
        const res = await fetch(`/api/login/verifyOtp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otp: otp,
            session: session,
            phone: phoneNumber,
          }),
        });

        const result = await res.json();

        if (result.status === 200) {
          Cookies.set("selectedRole", "carrier");
          router.replace(`/user/parties`);
        } else {
          setError("Failed to verify OTP. Please check the OTP.");
        }
      } catch (error) {
        console.log(error);
        setError("Failed to verify OTP. Please check the OTP.");
      }
    });
  };

  const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setResendCountdown(60);

    startTransition(async () => {
      setError("");

      try {
        const res = await fetch("/api/login/sendOtp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: `${countryCode}${phoneNumber}`,
          }),
        });

        const { data } = await res.json();
        console.log(data)

        if (data.Status === "Success") {
          setSuccess("OTP sent successfully.");
          setSession(data.Details);
        } else {
          setError("Failed to send OTP. Please try again.");
        }
      } catch (err) {
        console.log(err);
        setResendCountdown(0);
        setError("Failed to send OTP. Please try again.");
      }
    });
  };

  const loadingIndicator = (
    <div role="status" className="flex justify-center">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );

  return (
    <motion.div
      className="flex flex-col justify-center items-center p-6 bg-bottomNavBarColor shadow-md rounded-lg max-w-md mx-auto"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="text-2xl font-semibold mb-4 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Login with OTP
      </motion.h2>

      {!session && <motion.form
        onSubmit={requestOtp}
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="mb-4">
          <label
            htmlFor="countryCode"
            className="block text-white font-medium mb-2"
          >
            Country Code
          </label>
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger id="countryCode" aria-label="Country Code">
              <SelectValue placeholder="Select country code" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {countryCodes.map((code) => (
                  <SelectItem key={code.dial_code} value={code.dial_code}>
                    {code.dial_code} - {code.code}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div className="mb-4">
          <label
            htmlFor="phoneNumber"
            className="block text-white font-medium mb-2"
          >
            Phone Number
          </label>
          <Input
            id="phoneNumber"
            className="w-full border border-gray-300 p-2 rounded-lg"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
          />
          <p className="text-xs text-gray-200 mt-2">
            Please enter your number without the country code
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            type="submit"
            disabled={resendCountdown > 0 || isPending}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || resendCountdown > 0
              ? `Resend OTP in ${resendCountdown}s`
              : "Request OTP"}
          </Button>
        </motion.div>
      </motion.form>}

      {session && (
        <>
          <motion.div
            className="mt-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label htmlFor="otp" className="block text-white font-medium mb-2">
              Enter OTP
            </label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              className="otp-input"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </motion.div>

          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {/* <Button
              type="button"
              onClick={verifyOtp}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Verify OTP
            </Button> */}
          </motion.div>
        </>
      )}

      {error && (
        <motion.p
          className="mt-4 text-red-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {error}
        </motion.p>
      )}

      {success && (
        <motion.p
          className="mt-4 text-green-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {success}
        </motion.p>
      )}

      {isPending && loadingIndicator}
    </motion.div>
  );
}

export default OtpLogin;
