import React from 'react';
import { Outlet } from 'react-router-dom';
import RadarScan from '../components/RadarScan';

const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — always dark, visual hero */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative bg-gradient-to-br from-[#0a1628] via-[#0d2137] to-[#0f2a3f] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[hsla(175,55%,45%,0.06)] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[hsla(190,60%,40%,0.04)] blur-[100px]" />
          <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] rounded-full bg-[hsla(175,50%,50%,0.03)] blur-[80px]" />
        </div>
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <RadarScan />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] transition-colors duration-300">
        <div className="w-full max-w-sm mx-auto px-6 py-8 md:py-0">
          {/* Mobile header */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0d9488] to-[#06b6d4] flex items-center justify-center mb-3 shadow-lg shadow-teal-500/20">
              <img src="/icon.svg" alt="Skill Radar" className="w-6 h-6" />
            </div>
            <span className="text-lg font-heading font-bold tracking-tight text-gray-800 dark:text-gray-100">
              Skill Radar
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Plataforma de Assessment
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
