'use client'
import OtpLogin from "@/components/OtpLogin";
function LoginPage() {

  console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-bold text-center mb-5">
        Mo Verse Trip Mangement Login
      </h1>

      <OtpLogin />
    </div>
  );
}

export default LoginPage;