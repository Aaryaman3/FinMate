'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { BankCard } from '@/components/bank-card';
import { Bank } from '@/lib/bank-data';

export default function BanksPage() {
  const router = useRouter();
  const [hasSSN, setHasSSN] = useState(false);
  const [country, setCountry] = useState('');
  const [visaType, setVisaType] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [recommendations, setRecommendations] = useState<Bank[]>([]);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/recommend-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          has_ssn: hasSSN,
          country,
          visa_type: visaType,
          monthly_income: parseInt(monthlyIncome) || 0,
        }),
      });

      const data = await response.json();
      setRecommendations(data.banks);
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Bank Recommendations</h1>
          <p className="text-sm text-gray-600">Find the perfect bank for your needs</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., India, China, Brazil"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Visa Type
                  </label>
                  <select
                    value={visaType}
                    onChange={(e) => setVisaType(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">Select visa type</option>
                    <option value="F-1">F-1 (Student)</option>
                    <option value="J-1">J-1 (Exchange Visitor)</option>
                    <option value="H-1B">H-1B (Work)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Do you have an SSN?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setHasSSN(true)}
                      className={`flex-1 p-3 border rounded-lg font-medium transition-colors ${
                        hasSSN
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasSSN(false)}
                      className={`flex-1 p-3 border rounded-lg font-medium transition-colors ${
                        !hasSSN
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Income ($)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="e.g., 1000"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting Recommendations...
                    </>
                  ) : (
                    'Get Recommendations'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!recommendations.length && !isLoading && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏦</div>
                <h2 className="text-2xl font-bold mb-2">Find Your Perfect Bank</h2>
                <p className="text-gray-600">
                  Fill out your profile to get personalized bank recommendations
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Analyzing your profile...</p>
              </div>
            )}

            {recommendations.length > 0 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">Your Recommendations</h2>
                  {explanation && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                      <p className="text-gray-700 whitespace-pre-wrap">{explanation}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {recommendations.map((bank, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          Top Choice
                        </span>
                      </div>
                      <BankCard bank={bank} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
