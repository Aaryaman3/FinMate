'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { EchoAuth } from '@/components/echo-auth';
import { DollarSign, TrendingUp, CreditCard, Receipt } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span>🪙</span>
            <span>FinMate</span>
          </div>
          <EchoAuth />
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-bold mb-6">
            Welcome to the U.S. —<br />
            Let&apos;s set up your finances,<br />
            <span className="text-indigo-600">step by step.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Open the right bank account, manage payments, and learn U.S. money rules — 
            all in one AI-powered dashboard.
          </p>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 shadow-lg transition-colors"
          >
            Get Started
          </button>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <DollarSign className="w-12 h-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Financial Mentor</h3>
            <p className="text-gray-600">
              Chat with our AI to understand U.S. banking, taxes, and credit building.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Bank Recommendations</h3>
            <p className="text-gray-600">
              Get personalized bank suggestions based on your visa status and needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <Receipt className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Receipt Parser</h3>
            <p className="text-gray-600">
              Upload receipts and get insights on your spending and payment alternatives.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <CreditCard className="w-12 h-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Financial Tools</h3>
            <p className="text-gray-600">
              Budget trackers, currency converters, and more to manage your money.
            </p>
          </motion.div>
        </div>
      </section>

      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600">
          <p>Built with AI for International Students 🌍</p>
          <p className="text-sm mt-2">Powered by Gemini AI, Echo, and Opik</p>
        </div>
      </footer>
    </div>
  );
}
