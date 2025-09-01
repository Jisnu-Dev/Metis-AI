'use client';

import { motion } from 'framer-motion';
import { Upload, Cpu, BarChart3, FileText } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: "Upload Data",
    description: "Simply upload your process data or let our AI estimate missing parameters",
    color: "from-purple-500 to-purple-600",
    accent: "purple"
  },
  {
    icon: Cpu,
    title: "AI Processing",
    description: "Advanced ML models analyze your data and predict environmental indicators",
    color: "from-pink-500 to-pink-600",
    accent: "pink"
  },
  {
    icon: BarChart3,
    title: "View Results",
    description: "Explore interactive dashboards with comprehensive impact visualizations",
    color: "from-red-500 to-red-600",
    accent: "red"
  },
  {
    icon: FileText,
    title: "Get Reports",
    description: "Download actionable reports with sustainability recommendations",
    color: "from-orange-500 to-orange-600",
    accent: "orange"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="pt-24 pb-16 bg-transparent relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/20 to-transparent"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Get comprehensive LCA insights in four simple steps
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-orange-500 opacity-30"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative text-center group"
                >
                  {/* Step number */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {/* Main icon container */}
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                        <div className="w-full h-full bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      
                      {/* Step number badge */}
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center z-20 border-2 border-black`}>
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>

                  {/* Mobile arrow */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-8">
                      <div className={`w-1 h-12 bg-gradient-to-b ${step.color} opacity-50 rounded-full`}></div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-300 mb-6 text-lg">
              Transform your sustainability approach with AI-powered LCA analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25">
                Start Free Trial
              </button>
              <button className="border border-white/20 text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-all duration-300 backdrop-blur-sm">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
