'use client'

import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/firebase/firbaseConfig'; // Adjust path as per your actual setup
import OtpInput from 'react-otp-input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const PhoneSignIn = () => {
    const router = useRouter()
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [user, setUser] = useState<ConfirmationResult>();

    const sendOtp = async () => {
        try {
            const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response: any) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                    console.log('reCAPTCHA solved');
                }
            });

            const confirmation = await signInWithPhoneNumber(auth, phone, recaptcha);
            setUser(confirmation);
        } catch (error) {
            console.log(error);
        }
    };
    
    const verifyOtp = async () => {
        try {
            const data = await user?.confirm(otp);
            console.log(data);

            // Assuming success, update authenticated state here
            // Example: dispatch an action to update authenticated state in global context
            

            // Example dispatch action to update authenticated state
            // dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });

            await fetch('http://localhost:3000/api/auth/signIn', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: phone,
                    uid: data?.user.uid
                }),
                credentials: 'include'
            });
            router.push('/drivers')
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white shadow-md rounded-md p-6">
                <label className="block mb-2 text-sm font-medium text-gray-600">Phone Number</label>
                <PhoneInput
                    country={'in'}
                    value={phone}
                    onChange={(phone) => setPhone('+' + phone)}
                    inputStyle={{
                        width: '100%',
                        border: '1px solid #d2d6dc',
                        borderRadius: '0.375rem',
                        outline: 'none',
                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                        '&:focus': {
                            borderColor: '#4b9cdb',
                            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.5)',
                        }
                    }}
                />
                <div className="mt-4">
                    <button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none"
                        onClick={sendOtp}
                    >
                        Send OTP
                    </button>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-md p-6 mt-4">
                <div id="recaptcha-container"></div>
                <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    separator={<span>-</span>}
                    inputStyle={{
                        width: '2rem',
                        height: '2rem',
                        margin: '0.25rem',
                        padding: '0.5rem',
                        textAlign: 'center',
                        border: '1px solid #d2d6dc',
                        borderRadius: '0.375rem',
                        outline: 'none',
                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                        '&:focus': {
                            borderColor: '#4b9cdb',
                            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.5)',
                        }
                    }}
                    renderInput={(props, index) => (
                        <input {...props} key={index} />
                    )}
                />
                <div className="mt-4">
                    <button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none"
                        onClick={verifyOtp}
                    >
                        Verify OTP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhoneSignIn;
