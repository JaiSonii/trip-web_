import Image from "next/image"
import notfound from '@/assets/truck.webp'

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <div className="flex items-center min-h-screen justify-center  p-4">
          <iframe src="https://lottie.host/embed/3d45f054-61ac-4d4e-837c-2fa3006e28cc/MeZ8JDXVB5.json"></iframe>
          
      </div>
    )
  }