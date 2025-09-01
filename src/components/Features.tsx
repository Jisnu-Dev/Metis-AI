'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  Recycle, 
  BarChart3, 
  Target, 
  Zap,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "AI-Driven Analysis",
    description: "Smart parameter estimation with ML models",
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-600/20"
  },
  {
    icon: Recycle,
    title: "Circular Economy",
    description: "Optimize recycling and resource efficiency",
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-pink-600/20"
  },
  {
    icon: BarChart3,
    title: "Real-time Insights",
    description: "Interactive dashboards and visualizations",
    color: "text-red-400",
    gradient: "from-red-500/20 to-red-600/20"
  },
  {
    icon: Target,
    title: "Automated LCA",
    description: "Streamlined assessment for all metals",
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-600/20"
  },
  {
    icon: Zap,
    title: "Rapid Results",
    description: "Minutes, not weeks for comprehensive reports",
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-yellow-600/20"
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "International LCA standards compliance",
    color: "text-green-400",
    gradient: "from-green-500/20 to-green-600/20"
  }
];

export default function Features() {
  return (
    <section id="features" className="pt-16 pb-12 bg-transparent relative -mt-8">
      {/* Smooth transition gradient at top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Why Choose
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400"> MetisAI</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Transform your sustainability approach with cutting-edge AI technology
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative h-full"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Main card */}
                <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-8 h-full border border-white/10 group-hover:border-white/20 transition-all duration-500 overflow-hidden">
                  {/* Background decoration */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700`}></div>
                  
                  {/* Icon container */}
                  <div className="relative z-10 mb-6">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                      <div className="flex items-center justify-center w-full h-full bg-black/60 rounded-2xl backdrop-blur-sm">
                        <IconComponent className={`w-10 h-10 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-gray-200 group-hover:to-white transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Subtle bottom accent */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 backdrop-blur-sm">
            <div className="bg-black/40 rounded-full px-8 py-3 backdrop-blur-sm">
              <p className="text-gray-300 text-sm">
                Ready to revolutionize your LCA process? 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold ml-1">
                  Get started today
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
