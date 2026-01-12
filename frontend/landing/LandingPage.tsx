import React from 'react';
import { LandingNavbar } from './components/LandingNavbar';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { FeaturesSection } from './components/FeaturesSection';
import { AppPreview } from './components/AppPreview';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-midnight-bg">
      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Problem Section - "We understand" */}
        <ProblemSection />

        {/* Features Section - "How It Helps" */}
        <FeaturesSection />

        {/* App Preview - Screenshots */}
        <AppPreview />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
