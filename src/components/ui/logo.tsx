
import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 bg-brand-primary rounded-lg shadow-md flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-opacity-70 animate-pulse-slow">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-accent"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="font-bold text-xl text-brand-primary tracking-tight">
        CrowdPath<span className="text-brand-accent">Pulse</span>
      </div>
    </div>
  );
};

export default Logo;
