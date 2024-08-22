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
import Image from "next/image";
import whiteLogo from '@/assets/awajahi-white-logo.png';
import logo from '@/assets/awajahi logo.png'
import otpPic from '@/assets/otp-pic.png';

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

  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp();
    }
  }, [otp]);
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
    <div className="grid grid-cols-5 min-h-screen">
      <div className="col-span-2 bg-[#FF8833] p-8">
        <div className="flex flex-col items-center justify-center p-6 gap-4">
          <Image src={whiteLogo} alt="logo" width={207} height={220} />
          <h2 className="text-white text-2xl">Awajahi</h2>
          <h1 className="text-[#FFFFFF] mt-10 text-3xl font-semibold">TRUSTED. RELIABLE. EFFICIENT</h1>

        </div>
      </div>
      <div className="col-span-3 flex justify-center items-center">
        <div className="flex flex-col gap-2 w-full max-w-md p-8">
          <div className="flex items-center mb-6">
            <Image src={logo} alt="logo" width={60} height={64} priority />
            <h3 className="text-black font-semibold text-2xl ml-2">Awajahi</h3>
          </div>
          <div>
            {session ? <Image src={otpPic} width={398} height={398} alt="otp img" /> :
              <h3 className="text-black font-semibold text-3xl mb-5">Hey! Welcome to Awajahi</h3>}
          </div>
          <div className="relative">
            {!session && (
              <motion.form
                onSubmit={requestOtp}
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div className="mb-4">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger id="countryCode" aria-label="Country Code">
                      <SelectValue placeholder="Select country code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {countryCodes.map((code) => (
                          <SelectItem key={code.dial_code} value={code.dial_code}>
                            {code.code} {code.name} ({code.dial_code})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </motion.div>
                <motion.div className="mb-4">
                  <label htmlFor="phoneNumber" className="text-[#000000] font-medium mb-2">
                    Mobile no.
                  </label>
                  <Input
                    id="phoneNumber"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-full"
                  />
                </motion.div>
                <motion.div>
                  <Button
                    type="submit"
                    className="w-full text-center bg-[#FF8833] text-white rounded-full"
                    disabled={isPending}
                  >
                    {isPending ? loadingIndicator : "Send OTP"}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </div>
          <div className="relative">
            {session && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="text-[#7A7A7A]">Otp Sent to XXXXXXX{phoneNumber.slice(-4)}</label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  className="otp-input size-full flex items-center justify-between"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <span className="text-[#7A7A7A]">
                  Didn&apos;t recieve OTP? <Button variant={'link'} type="submit" disabled={resendCountdown > 0 || isPending} className="text-[#FF6A00]">Resend OTP</Button> {resendCountdown > 0 && `in ${resendCountdown}s`}
                </span>
                <Button
                  onClick={verifyOtp}
                  className="w-full text-center bg-[#FF8833] text-white mt-4 rounded-full text-md"
                  disabled={isPending}
                >
                  {isPending ? loadingIndicator : "Verify OTP"}
                </Button>
                {/* <Button
                  type="submit"
                  className="w-full text-center mt-4"
                  disabled={resendCountdown > 0 || isPending}
                >
                  Resend OTP 
                </Button> */}
              </motion.div>
            )}
          </div>
          {error && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6"
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

export default OtpLogin;
