

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import '@/app/globals.css'
import Image from "next/image";
import heroImg from '@/assets/hero section illustration.png'
import logo_img from '@/assets/awajahi logo.png'
import mobile_img from '@/assets/mobile-img.png'
import appQr from '@/assets/qr code.png'
import playstore from '@/assets/playstore.png'
import expenseMgmtIcon from '@/assets/expense management icon.png'
import tripMgntIcon from '@/assets/trip management icon.png'
import section3Img from '@/assets/section3-img.png'
import aiIcon from '@/assets/ai icon.png'
import routeIcon from '@/assets/route management icon.png'
import mainIllustrationImg from '@/assets/Group 427320428.png'
import ytIcon from '@/assets/youtube-icon.png'
import fbIcon from '@/assets/fb-icon.png'
import linkedinIcon from '@/assets/linkedin-icon.png'
import instaIcon from '@/assets/insta-icon.png'
import commingSoon from '@/assets/comming-soon.png'
import loginIcon from '@/assets/login icon.png'




export default function Home() {
  return (
    <div className=" w-full overflow-x-hidden text-black">
      {/* Navigation Section */}
      <section className="bg-[radial-gradient(ellipse_at_80%_50%,_#FFC499_0%,_#FFFFFF_80%)] px-4 sm:px-8 lg:px-16">
        {/* Top Section: Logo and Navigation */}
        <div className="flex flex-wrap justify-between items-center w-full py-4 sm:py-6">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Image
              src={logo_img}
              alt="Awajahi Logo"
              width={60}
              height={60}
              className="w-[25px] h-[27px] sm:w-[60px] sm:h-[60px]"
            />
            <span className="text-lg sm:text-2xl font-bold text-black">Awajahi</span>
          </div>

          {/* Navigation Links Section */}
          <ul className="hidden sm:flex items-center space-x-4 sm:space-x-8 md:space-x-16 text-lg sm:text-xl md:text-2xl font-semibold text-[#333333]">
            <li>
              <Link href="/" className="hover:text-[#FF6A00] transition-colors duration-300">About Us</Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[#FF6A00] transition-colors duration-300 flex items-center">
                <span>Login</span>
                <Image src={loginIcon} width={24} height={24} className="sm:w-6 sm:h-6" alt="login" />
              </Link>
            </li>
            <li>
              <Link href="/login">
                <Button className="rounded-full bg-[#CC5500] text-white px-4 sm:px-6 py-2 sm:py-3 font-bold text-md sm:text-lg">
                  Sign Up
                </Button>
              </Link>
            </li>
          </ul>
        </div>

        {/* Hero Section */}
        <div className="flex flex-wrap items-center justify-between py-6 sm:py-10">
          {/* Text Content */}
          <div className="flex flex-col justify-evenly w-full lg:w-1/2 gap-4 sm:gap-6">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-semibold leading-tight text-[#333333]">
              Manage <span className="text-[#FF6A00]">Fleet Operations</span> with Ease: Increase <span className="text-[#FF6A00]">Efficiency</span> and <span className="text-[#FF6A00]">Visibility</span> Across Every Mile
            </h1>
            <p className="text-sm sm:text-md lg:text-lg font-medium text-[#666666]">
              Streamline operations, optimize routes, and drive efficiency with our AI-powered tools and IoT solutions.
            </p>
            <div className="hidden sm:flex items-end h-full">
              <Button className="bg-[#CC5500] w-full lg:w-1/2 py-4 sm:py-6 lg:py-8 rounded-xl">
                <span className="text-white text-lg sm:text-xl lg:text-2xl font-semibold">Schedule Demo</span>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full lg:w-auto flex justify-center lg:justify-end items-end h-full mt-6 sm:mt-10 lg:mt-0">
            <Image
              width={500}
              height={600}
              alt="hero img"
              src={heroImg}
              className="rounded-lg"
            />
          </div>

          {/* Button for Small Screens */}
          <div className="flex items-end h-full w-full sm:hidden">
            <Button className="bg-[#CC5500] w-full py-4 rounded-xl">
              <span className="text-white text-lg font-semibold">Schedule Demo</span>
            </Button>
          </div>
        </div>
      </section>


      {/* Hero Section */}
      <section className="p-4 lg:p-16 bg-white">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-6 ">
          <div className="w-full lg:w-auto flex justify-center items-end h-full mt-10 lg:mt-0">
            <Image src={mobile_img} alt="mobile" width={300} height={380} className="lg:w-auto w-full" />
          </div>

          <div className="flex flex-col items-center justify-center w-full lg:w-1/2 gap-4 lg:gap-8 text-center">
            <h2 className="text-3xl lg:text-5xl font-semibold">Download the App</h2>
            <Image src={appQr} alt="app qr" width={335} height={124} className="hidden sm:block" />
            <Image src={playstore} alt="playstore btn" width={250} height={70} className="w-full lg:w-auto" />
          </div>
        </div>
      </section>


      {/* Additional Sections */}
      <section className="p-8 sm:p-16 bg-[radial-gradient(ellipse_at_right,_#FFC499_0%,_#FFFFFF_80%)]">
        {/* Section Content */}
        <div className="flex flex-col gap-8 sm:gap-16">
          <div>
            <h2 className="text-center font-semibold text-3xl sm:text-5xl text-black">Features</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8">
            {/* Expense Management */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Image src={expenseMgmtIcon} alt="expense icon" width={48} height={48} />
              <div className="flex flex-col">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#FF6A00]">Expense Management</h3>
                <p className="text-base sm:text-lg leading-tight text-[#666666]" style={{ maxWidth: '300px', lineHeight: '1.4em' }}>
                  Simplify expense tracking and manage costs effortlessly.
                </p>
              </div>
            </div>

            {/* Trip Management */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Image src={tripMgntIcon} alt="trip management icon" width={48} height={48} />
              <div className="flex flex-col">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#FF6A00]">Trip Management</h3>
                <p className="text-base sm:text-lg leading-tight text-[#666666]" style={{ maxWidth: '300px', lineHeight: '1.4em' }}>
                  Efficiently plan, track, and manage every trip with real-time insights.
                </p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex justify-center">
            <Image src={section3Img} alt="Section Graphic" width={1000} height={613} />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8">
            {/* AI Fleet Management */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Image src={aiIcon} alt="AI Fleet Management icon" width={48} height={48} />
              <div className="flex flex-col">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#FF6A00] flex items-center gap-2">
                  <span>AI Fleet Management</span>
                  <Image src={commingSoon} alt="coming soon" width={116} height={20} />
                </h3>
                <p className="text-base sm:text-lg leading-tight text-[#666666]" style={{ maxWidth: '300px', lineHeight: '1.4em' }}>
                  Optimize vehicle performance and reduce downtime with AI-powered insights.
                </p>
              </div>
            </div>

            {/* Route Optimization */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Image src={routeIcon} alt="Route Optimization icon" width={48} height={48} />
              <div className="flex flex-col">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#FF6A00] flex items-center gap-2">
                  <span>Route Optimization</span>
                  <Image src={commingSoon} alt="coming soon" width={116} height={20} />
                </h3>
                <p className="text-base sm:text-lg leading-tight text-[#666666]" style={{ maxWidth: '300px', lineHeight: '1.4em' }}>
                  Find the fastest, most cost-effective routes with AI-driven optimization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>




      <section className="p-8 sm:p-16 bg-white text-black">
        {/* Section Content */}
        <h2 className="mt-10 text-3xl sm:text-5xl font-semibold text-center mb-10 sm:mb-20">Why Choose Us?</h2>

        <div className="flex flex-col sm:flex-row items-center justify-evenly mt-10 gap-10 sm:gap-0">
          {/* Left Section */}
          <div className="w-full sm:w-1/4 flex flex-col items-start justify-between h-full space-y-10 sm:space-y-16">
            {/* AI-Driven Optimization */}
            <div className="flex flex-col gap-4 ml-0 sm:transform sm:translate-x-64 -translate-y-0 sm:-translate-y-20">
              <h3 className="text-xl sm:text-2xl font-semibold">AI-Driven Optimization</h3>
              <p className="leading-tight font-semibold">
                Leverage cutting-edge AI technology to enhance fleet performance, minimize costs, and maximize productivity.
              </p>
            </div>

            {/* Dedicated Support */}
            <div className="flex flex-col gap-4 sm:transform sm:translate-x-32 translate-y-0 sm:translate-y-5">
              <h3 className="text-xl sm:text-2xl font-semibold">Dedicated Support</h3>
              <p className="leading-tight font-semibold">
                Our expert team is available 24/7 to assist you, ensuring you get the most out of Awajahi’s features and capabilities.
              </p>
            </div>
          </div>

          {/* Center Image */}
          <div className="w-full sm:w-auto">
            <Image src={mainIllustrationImg} alt='illustration' width={538} height={569} className="mx-auto sm:mx-0" />
          </div>

          {/* Right Section */}
          <div className="w-full sm:w-1/4 flex flex-col items-start justify-between h-full space-y-10 sm:space-y-16">
            {/* Boost Efficiency */}
            <div className="flex flex-col gap-4 sm:transform sm:-translate-x-5 translate-y-0 sm:translate-y-20">
              <h3 className="text-xl sm:text-2xl font-semibold">Boost Efficiency</h3>
              <p className="leading-tight font-semibold">
                Save time and reduce costs with automated processes.
              </p>
            </div>

            {/* Real-Time Visibility */}
            <div className="flex flex-col gap-4 sm:transform sm:-translate-x-40 translate-y-0 sm:translate-y-48">
              <h3 className="text-xl sm:text-2xl font-semibold">Real-Time Visibility</h3>
              <p className="leading-tight font-semibold">
                Stay in control with real-time data and insights, ensuring you’re always informed and ready to make quick, informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#FE8631] text-black p-16 mt-0 sm:mt-10 relative">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-lg">
          {/* Products Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white transition">Trip management</Link></li>
              <li><Link href="#" className="hover:text-white transition">Expense management</Link></li>
              <li><Link href="#" className="hover:text-white transition">Route optimization</Link></li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white transition">About us</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact us</Link></li>
            </ul>
          </div>

          {/* Terms Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="hover:text-white transition" >Terms of service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition" >Privacy & Policy</Link></li>
            </ul>
          </div>

          {/* Get in Touch Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
              <div className="flex space-x-4 items-center">
                <Link href="#">
                  <Image src={instaIcon} alt="Instagram" width={27} height={27} className="hover:opacity-80 transition" />
                </Link>
                <Link href="#">
                  <Image src={linkedinIcon} alt="LinkedIn" width={30} height={30} className="hover:opacity-80 transition" />
                </Link>
                <Link href="#">
                  <Image src={fbIcon} alt="Facebook" width={30} height={30} className="hover:opacity-80 transition" />
                </Link>
                <Link href="#">
                  <Image src={ytIcon} alt="YouTube" width={30} height={30} className="hover:opacity-80 transition" />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Download our app</h3>
              <Link href="#">
                <Image src={playstore} alt="Google Play" width={173} height={51} className="hover:opacity-90 transition" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Line and Copyright */}
        <div className="mt-12 border-t border-white pt-6 text-center">
          <p className="text-lg font-semibold">&copy; 2024 Awajahi. All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}


