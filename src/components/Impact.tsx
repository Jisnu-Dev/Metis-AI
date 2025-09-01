'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const impactStats = [
  {
    number: "85%",
    label: "Faster Analysis",
    sublabel: "vs traditional methods",
    icon: Zap
  },
  {
    number: "60%",
    label: "Cost Savings",
    sublabel: "operational efficiency",
    icon: TrendingUp
  },
  {
    number: "500+",
    label: "Companies",
    sublabel: "trust our platform",
    icon: Users
  },
  {
    number: "95%",
    label: "Accuracy",
    sublabel: "AI-powered precision",
    icon: Award
  }
];

const successStories = [
  {
    company: "Global Steel Corp",
    improvement: "40% carbon reduction",
    timeframe: "6 months"
  },
  {
    company: "EcoMetal Industries",
    improvement: "₹2.5M cost savings",
    timeframe: "1 year"
  },
  {
    company: "Sustainable Alloys Ltd",
    improvement: "Zero compliance issues",
    timeframe: "18 months"
  }
];

export default function Impact() {
  return (
    <section id="impact" className="pt-24 pb-20 bg-transparent relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Real Impact,
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Real Results</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how companies are transforming their sustainability journey with MetisAI
          </p>
        </motion.div>

        {/* Stats Grid - Clean and Minimal */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {impactStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="mb-4 flex justify-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 group-hover:border-purple-400/40 transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-300 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.sublabel}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">Success Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                  <span className="text-gray-400 text-sm">{story.company}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">{story.improvement}</div>
                <div className="text-gray-400 text-sm">Achieved in {story.timeframe}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 backdrop-blur-sm">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to see your impact?</h3>
              <p className="text-gray-400">Join the sustainability revolution today</p>
            </div>
            <Link href="/demo">
              <button className="cursor-pointer flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
