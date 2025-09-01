'use client';

import { ArrowRight, Cpu, Recycle, BarChart3, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Pre-generate consistent particle positions to avoid hydration mismatch
  const particlePositions = Array.from({ length: 20 }, (_, i) => ({
    initialX: (i * 137.5) % windowSize.width, // Use a deterministic pattern
    initialY: (i * 97.3) % windowSize.height,
    duration: 10 + (i % 10),
  }));

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-transparent overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating particles - Only render on client */}
        <div className="absolute inset-0">
          {isClient && particlePositions.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              initial={{ 
                x: particle.initialX, 
                y: particle.initialY,
                opacity: 0
              }}
              animate={{ 
                y: [particle.initialY, (particle.initialY + 200) % windowSize.height],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: particle.duration,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-900/5 to-transparent"></div>
      
      {/* Smooth transition gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm"
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Industry Leading LCA Platform</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </motion.div>

          {/* Main headline with enhanced animation */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            AI-Powered{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              Life Cycle
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              Assessment
            </span>{' '}
            Platform
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            Transform your sustainability approach with intelligent LCA analysis for metals. 
            Drive circularity, reduce environmental impact, and make data-driven decisions 
            for a sustainable future.
          </motion.p>

          {/* Feature highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            <div className="flex items-center space-x-2 text-gray-300">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>AI-Driven Analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Recycle className="w-5 h-5 text-pink-400" />
              <span>Circular Economy Focus</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <BarChart3 className="w-5 h-5 text-red-400" />
              <span>Real-time Insights</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/demo">
              <button 
                className="group cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-purple-500/25"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                Start Demo
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
