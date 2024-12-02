import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import Footer from '@/components/Footer';
import AppDownload from '@/components/AppDownload';

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden text-black">
      {/* First background split */}
      <div className="bg-[radial-gradient(ellipse_at_80%_50%,_#FFC499_0%,_#FFFFFF_80%)]">
        <Navigation />
        <main>
          <HeroSection />
          <Suspense fallback={<div>Loading...</div>}>
            <AppDownload />
          </Suspense>
        </main>
      </div>

      {/* Second background split */}
      <div className="bg-[radial-gradient(ellipse_at_80%_50%,_#FFFFFF_0%,_#FFC499_80%)]">
        <main>
          <Suspense fallback={<div>Loading...</div>}>
            <FeatureSection />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <WhyChooseUs />
          </Suspense>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
