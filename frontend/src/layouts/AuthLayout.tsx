import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[55%] rounded-full bg-[hsla(175,55%,60%,0.10)] blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[45%] h-[45%] rounded-full bg-[hsla(35,75%,55%,0.07)] blur-[140px]" />
        <div className="absolute top-[40%] right-[15%] w-[25%] h-[25%] rounded-full bg-[hsla(190,60%,45%,0.05)] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4 animate-scale-in">
        <div className="glass-panel p-8">
          <div className="flex flex-col items-center mb-8">
            <img src="/favicon.svg" alt="Skill Radar" className="w-11 h-11 mb-4" />
            <span className="text-xl font-heading font-bold tracking-tight text-gray-800 dark:text-gray-100">
              Skill Radar
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Plataforma de Assessment</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
