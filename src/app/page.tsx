'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import React from "react";
import './globals.css'
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




export default function Home() {
  return (
    <div className="min-w-screen w-screen">
      {/* Navigation Section */}
      <section className="bg-gradient-to-l from-[#FFC499] to-[#FFFFFF]  px-16">
        {/* Top Section: Logo and Navigation */}
        <div className="flex flex-wrap justify-between items-center w-full p-6">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Image src={logo_img} alt="Awajahi Logo" width={60} height={60} />
            <span className="text-2xl font-bold text-black">Awajahi</span>
          </div>

          {/* Navigation Links Section */}
          <ul className="flex items-center space-x-10 text-lg font-bold text-[#333333]">
            <li>
              <Link href="/" className="hover:text-[#FF6A00] transition-colors duration-300">About Us</Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[#FF6A00] transition-colors duration-300">Login</Link>
            </li>
            <li>
              <Link href="/login">
                <Button className="rounded-full bg-[#CC5500] text-white px-6 font-bold">
                  Sign Up
                </Button>
              </Link>
            </li>
          </ul>
        </div>

        {/* Hero Section */}
        <div className="flex flex-wrap items-center justify-between p-6 mt-10">
          {/* Text Content */}
          <div className="flex flex-col justify-evenly w-full lg:w-1/2 gap-6">
            <h1 className="text-4xl lg:text-6xl font-semibold leading-tight text-[#333333]">
              Manage <span className="text-[#FF6A00]">Fleet Operations</span> with Ease: Increase <span className="text-[#FF6A00]">Efficiency</span> and <span className="text-[#FF6A00]">Visibility</span> Across Every Mile
            </h1>
            <p className="text-md lg:text-lg font-medium text-[#666666]">
              Streamline operations, optimize routes, and drive efficiency with our AI-powered tools and IoT solutions.
            </p>
            <div className="flex items-end h-full">
              <Button className="bg-[#CC5500] w-full lg:w-1/2 py-8 rounded-xl">
                <span className="text-white text-2xl font-semibold">Schedule Demo</span>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full lg:w-auto flex justify-center lg:justify-end items-end h-full mt-10 lg:mt-0 ">
            <Image
              width={527}
              height={671}
              alt="hero img"
              src={heroImg}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>




      {/* Hero Section */}
      <section className="p-8">
        <div className="flex flex-wrap items-center justify-between p-6 mt-10">
          <div className="w-full lg:w-auto flex justify-center lg:justify-end items-end h-full mt-10 lg:mt-0">
            <Image src={mobile_img} alt='mobile' width={605} height={770} />
          </div>

          <div className="flex flex-col items-center justify-around w-full lg:w-1/2 gap-8">
            <h2 className="text-center text-5xl font-semibold">Download the App</h2>
            <Image src={appQr} alt="app qr" width={335} height={124} />
            <Image src={playstore} alt="playstore btn" width={350} height={100} />
          </div>
        </div>

      </section>

      {/* Additional Sections */}
      <section className="p-16" style={{ background: 'linear-gradient(122.95deg, #FFFFFF 34%, #FFC499 91.19%)' }}>
        {/* Section Content */}
        <div className="flex flex-col gap-16">
          <div>
            <h2 className="text-center font-semibold text-5xl text-black">Features</h2>
          </div>
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <Image src={expenseMgmtIcon} alt="expense icon" width={48} height={48} />
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold text-[#FF6A00]">Expense Management</h3>
                <p className="text-lg leading-tight text-[#666666]" style={{ maxWidth: '300px', lineHeight: '1.4em' }}>
                  Simplify expense tracking and manage costs effortlessly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Image src={tripMgntIcon} alt="trip management icon" width={48} height={48} />
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold text-[#FF6A00]">Trip Management</h3>
                <p className="text-lg leading-tight text-[#666666]" style={{ maxWidth: '300px', lineHeight: '1.4em' }}>
                  Efficiently plan, track, and manage every trip with real-time insights.
                </p>
              </div>
            </div>

          </div>
          <div className="flex justify-center">
            <Image src={section3Img} alt="Section Graphic" width={1000} height={613} />
          </div>
          <div className="flex items-center justify-between px-8">

            <div className="flex items-center gap-2">
              <Image src={aiIcon} alt="AI Fleet Management icon" width={48} height={48} />
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold text-[#FF6A00] flex items-center gap-2">
                  <span>AI Fleet Management</span>
                  <Image src={commingSoon} alt="coming soon" width={116} height={20} />
                </h3>
                <p className="text-lg leading-tight text-[#666666]" style={{ maxWidth: '300px', lineHeight: '1.4em' }}>
                  Optimize vehicle performance and reduce downtime with AI-powered insights.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Image src={routeIcon} alt="Route Optimization icon" width={48} height={48} />
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold text-[#FF6A00] flex items-center gap-2">
                  <span>Route Optimization</span>
                  <Image src={commingSoon} alt="coming soon" width={116} height={20} />
                </h3>
                <p className="text-lg leading-tight text-[#666666]" style={{ maxWidth: '300px', lineHeight: '1.4em' }}>
                  Find the fastest, most cost-effective routes with AI-driven optimization.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>



      <section className="p-16">
        {/* Section Content */}
        <h2 className="mt-10 text-5xl font-semibold text-center mb-20">Why Choose Us?</h2>
        <div className="flex items-center justify-evenly mt-10">
          {/* Left Section */}
          <div className="w-1/4 flex flex-col items-start justify-between h-full space-y-16">
            {/* AI-Driven Optimization */}
            <div className="flex flex-col gap-4 ml-0 transform translate-x-64 -translate-y-20">
              <h3 className="text-2xl font-semibold">AI-Driven Optimization</h3>
              <p className="leading-tight font-semibold">
                Leverage cutting-edge AI technology to enhance fleet performance, minimize costs, and maximize productivity.
              </p>
            </div>

            {/* Dedicated Support */}
            <div className="flex flex-col gap-4 transform translate-x-32 translate-y-5">
              <h3 className="text-2xl font-semibold">Dedicated Support</h3>
              <p className="leading-tight font-semibold">
                Our expert team is available 24/7 to assist you, ensuring you get the most out of Awajahi’s features and capabilities.
              </p>
            </div>
          </div>

          {/* Center Image */}
          <div>
            <Image src={mainIllustrationImg} alt='illustration' width={538} height={569} />
          </div>

          {/* Right Section */}
          <div className="w-1/4 flex flex-col items-start justify-between h-full space-y-16">
            {/* Boost Efficiency */}
            <div className="flex flex-col gap-4 transform -translate-x-5 translate-y-20">
              <h3 className="text-2xl font-semibold">Boost Efficiency</h3>
              <p className="leading-tight font-semibold">
                Save time and reduce costs with automated processes.
              </p>
            </div>

            {/* Real-Time Visibility */}
            <div className="flex flex-col gap-4 transform -translate-x-40 translate-y-48">
              <h3 className="text-2xl font-semibold">Real-Time Visibility</h3>
              <p className="leading-tight font-semibold">
                Stay in control with real-time data and insights, ensuring you’re always informed and ready to make quick, informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#FE8631] text-black p-16 mt-20">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-lg">
          {/* Products Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul>
              <li className="mb-2"><Link href="#">Trip management</Link></li>
              <li className="mb-2"><Link href="#">Expense management</Link></li>
              <li><Link href="#">Route optimization</Link></li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul>
              <li className="mb-2"><Link href="#">About us</Link></li>
              <li><Link href="#">Contact us</Link></li>
            </ul>
          </div>

          {/* Terms Section */}
          <div>
            <ul>
              <li className="mb-2"><Link href="#">Terms of service</Link></li>
              <li><Link href="#">Privacy & Policy</Link></li>
            </ul>
          </div>

          {/* Get in Touch Section */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
              <div className="flex space-x-4">
                <Link href="#">
                  <Image src={instaIcon} alt="Instagram" width={30} height={30} />
                </Link>
                <Link href="#">
                  <Image src={linkedinIcon} alt="LinkedIn" width={30} height={30} />
                </Link>
                <Link href="#">
                  <Image src={fbIcon} alt="Facebook" width={30} height={30} />
                </Link>
                <Link href="#">
                  <Image src={ytIcon} alt="YouTube" width={30} height={30} />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Download our app</h3>
              <Link href="#">
                <Image src={playstore} alt="Google Play" width={173} height={51} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Line and Copyright */}
        <div className="mt-8 border-t border-white pt-4">
          <p className="text-center text-lg font-semibold">&copy; 2024 Awajahi. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}


