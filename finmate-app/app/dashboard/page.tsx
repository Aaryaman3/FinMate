'use client';

import { useRouter } from 'next/navigation';
import { EchoAuth } from '@/components/echo-auth';
import { MessageSquare, TrendingUp, Receipt, Eye, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
            <span>🪙</span>
            <span>FinMate</span>
          </div>
          <EchoAuth />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-gray-600 text-lg">
            Your AI-powered financial assistant for international students
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div
            onClick={() => router.push('/chat')}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <MessageSquare className="w-8 h-8 text-indigo-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI Financial Mentor</h2>
            <p className="text-gray-600 mb-4">
              Get instant answers about banking, taxes, credit, and more. Chat with our AI expert trained specifically for international students.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Banking</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Taxes</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Credit</span>
            </div>
          </div>

          <div
            onClick={() => router.push('/banks')}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bank Recommendations</h2>
            <p className="text-gray-600 mb-4">
              Find the perfect bank account for your situation. Get personalized recommendations based on your visa type, location, and needs.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">No SSN Required</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Low Fees</span>
            </div>
          </div>

          <div
            onClick={() => router.push('/receipt')}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Receipt className="w-8 h-8 text-purple-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Receipt Scanner</h2>
            <p className="text-gray-600 mb-4">
              Upload receipts to track payments and get AI-powered insights. Discover cheaper alternatives for international transfers.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">OCR</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Smart Analysis</span>
            </div>
          </div>

          <div
            onClick={() => router.push('/transparency')}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI Transparency</h2>
            <p className="text-gray-600 mb-4">
              See exactly how our AI works. View traces, latency metrics, and understand every decision made by the system.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Traces</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Metrics</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-xl text-white">
          <h3 className="text-2xl font-bold mb-4">Why FinMate?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-indigo-100">AI-Powered Guidance</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-indigo-100">Available Support</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Free</div>
              <p className="text-indigo-100">For All Students</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
