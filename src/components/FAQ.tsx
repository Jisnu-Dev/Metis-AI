'use client';

import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "How accurate is MetisAI&apos;s LCA analysis?",
    answer: "Our AI-powered platform achieves 95% accuracy rates, verified through third-party audits and validated against traditional LCA methodologies. The system continuously learns and improves from each analysis."
  },
  {
    question: "What types of metals and alloys does the platform support?",
    answer: "MetisAI supports comprehensive analysis for steel, aluminum, copper, zinc, lead, nickel, and their alloys. We continuously expand our database to include new materials and their environmental impact data."
  },
  {
    question: "How long does it take to complete an LCA assessment?",
    answer: "Traditional LCA assessments that take weeks can be completed in hours with MetisAI. Simple assessments can be done in minutes, while complex multi-material analyses typically take 2-4 hours."
  },
  {
    question: "Is the platform compliant with international standards?",
    answer: "Yes, MetisAI is fully compliant with ISO 14040/14044 standards, EU Product Environmental Footprint (PEF), and other major international LCA standards. All reports are audit-ready."
  },
  {
    question: "Can I integrate MetisAI with my existing systems?",
    answer: "MetisAI offers robust API integration capabilities and supports popular formats like CSV, Excel, and XML. We also provide direct integrations with major ERP and sustainability reporting platforms."
  },
  {
    question: "What kind of support and training do you provide?",
    answer: "We offer comprehensive onboarding, live training sessions, detailed documentation, and 24/7 technical support. Our customer success team ensures you maximize the platform's value."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-transparent relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/5 to-transparent"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Questions</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get answers to common questions about MetisAI&apos;s LCA platform
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/30 backdrop-blur-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800/20 transition-all duration-300"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                <span className="font-semibold text-white text-lg">{faq.question}</span>
                <div className="flex-shrink-0 ml-4">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Plus className="w-5 h-5 text-purple-400" />
                  )}
                </div>
              </button>
              
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">Still have questions? Our team is here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            >
              Contact Sales
            </button>
            <button 
              className="px-8 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-purple-500 hover:text-white transition-all duration-300"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            >
              View Documentation
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
