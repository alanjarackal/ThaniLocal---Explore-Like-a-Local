import Spline from '@splinetool/react-spline';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Spline 3D Scene */}
      <div className="absolute inset-0 w-full h-full">
        <Spline
          scene="https://prod.spline.design/2Gi6Nd9BVxdQIVPV/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Get Started Button */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <Link
          to="/home"
          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
} 