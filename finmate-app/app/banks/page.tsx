'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface Bank {
  name: string;
  type: string;
  features: string[];
  notes?: string[];
}

const FINTECH_FACTS = [
  "💡 The first credit card was introduced in 1950 by Diners Club",
  "🌍 Over 2 billion people worldwide are unbanked or underbanked",
  "📱 Mobile banking users are expected to reach 2.5 billion by 2024",
  "💳 The average American has 3-4 credit cards",
  "🏦 Online-only banks can offer higher interest rates due to lower overhead costs",
  "🔒 FDIC insurance protects deposits up to $250,000 per account",
  "⚡ Digital payments are growing 3x faster than traditional methods",
  "🎓 Students with checking accounts are 6x more likely to attend college"
];

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
];

const VISA_TYPES = [
  'F-1 (Student)',
  'J-1 (Exchange Visitor)',
  'H-1B (Work)',
  'L-1 (Intracompany Transfer)',
  'O-1 (Extraordinary Ability)',
  'Other',
];

export default function BanksPage() {
  const router = useRouter();
  const [country, setCountry] = useState('');
  const [visaType, setVisaType] = useState('');
  const [hasSSN, setHasSSN] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('2000');
  const [age, setAge] = useState('25');
  const [recommendations, setRecommendations] = useState<Bank[]>([]);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [randomFact, setRandomFact] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResults(true);
    setRandomFact(FINTECH_FACTS[Math.floor(Math.random() * FINTECH_FACTS.length)]);

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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          box-sizing: border-box;
        }

        .bank-page-container {
          min-height: 100vh;
          background-color: #FAF2E7;
        }

        .bank-header {
          background-color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(42, 49, 64, 0.08);
        }

        .bank-header-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2A3140;
        }

        .bank-header-subtitle {
          font-size: 1rem;
          font-weight: 500;
          color: #6B7280;
        }

        .bank-back-button {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bank-back-button:hover {
          background-color: #F5F5F5;
        }

        .bank-main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem;
        }

        .bank-form-container {
          max-width: 700px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 18px;
          padding: 3rem;
          box-shadow: 0 4px 12px rgba(42, 49, 64, 0.08);
        }

        .bank-form-hero {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .bank-form-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #2AA46A 0%, #F9A61B 100%);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1rem;
        }

        .bank-form-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2A3140;
          margin-bottom: 0.5rem;
        }

        .bank-form-description {
          font-size: 1rem;
          font-weight: 500;
          color: #6B7280;
        }

        .bank-form-group {
          margin-bottom: 1.5rem;
        }

        .bank-form-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #2A3140;
          margin-bottom: 0.5rem;
        }

        .bank-form-select,
        .bank-form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background-color: #FAF2E7;
          border: 2px solid transparent;
          border-radius: 15px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #2A3140;
          transition: all 0.3s ease;
          outline: none;
        }

        .bank-form-select:focus,
        .bank-form-input:focus {
          border-color: #2AA46A;
          background-color: #FFFFFF;
        }

        .bank-ssn-toggle {
          display: flex;
          gap: 1rem;
        }

        .bank-ssn-button {
          flex: 1;
          padding: 0.875rem;
          border: none;
          border-radius: 15px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .bank-ssn-button.active {
          background-color: #2AA46A;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(42, 164, 106, 0.3);
        }

        .bank-ssn-button.inactive {
          background-color: #EDECEA;
          color: #6B7280;
        }

        .bank-income-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .bank-income-input {
          padding-left: 2.5rem;
        }

        .bank-income-slider {
          width: 100%;
          margin-top: 0.75rem;
          accent-color: #2AA46A;
        }

        .bank-submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #2AA46A 0%, #1D7A4D 100%);
          border: none;
          border-radius: 15px;
          font-size: 1.1rem;
          font-weight: 700;
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(42, 164, 106, 0.3);
        }

        .bank-submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(42, 164, 106, 0.4);
        }

        .bank-results-layout {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .bank-sidebar {
          flex: 1 1 300px;
          max-width: 350px;
        }

        .bank-sidebar-card {
          background-color: #FFFFFF;
          border-radius: 18px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(42, 49, 64, 0.08);
          position: sticky;
          top: 6rem;
        }

        .bank-results-content {
          flex: 2 1 600px;
        }

        .bank-loading-card {
          background-color: #FFFFFF;
          border-radius: 18px;
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(42, 49, 64, 0.08);
        }

        .bank-loading-spinner {
          width: 64px;
          height: 64px;
          border: 4px solid #EDECEA;
          border-top-color: #2AA46A;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .bank-loading-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2A3140;
          margin-bottom: 0.75rem;
        }

        .bank-loading-description {
          font-size: 1rem;
          font-weight: 500;
          color: #6B7280;
          margin-bottom: 1.5rem;
        }

        .bank-loading-fact {
          background: linear-gradient(135deg, #FAF2E7 0%, #EDECEA 100%);
          border-radius: 15px;
          padding: 1rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #2A3140;
          max-width: 500px;
          margin: 0 auto;
        }

        .bank-recommendations-header {
          background: linear-gradient(135deg, #2AA46A 0%, #F9A61B 100%);
          border-radius: 18px;
          padding: 2rem;
          color: #FFFFFF;
          margin-bottom: 1.5rem;
        }

        .bank-recommendations-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .bank-recommendations-explanation {
          font-size: 1rem;
          font-weight: 500;
          opacity: 0.95;
          line-height: 1.6;
        }

        .bank-card {
          background-color: #FFFFFF;
          border-radius: 18px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(42, 49, 64, 0.08);
          transition: all 0.3s ease;
        }

        .bank-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(42, 49, 64, 0.12);
        }

        .bank-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .bank-card-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2A3140;
          margin-bottom: 0.5rem;
        }

        .bank-card-type {
          display: inline-block;
          padding: 0.375rem 1rem;
          background: linear-gradient(135deg, #F9A61B 0%, #C29454 100%);
          color: #FFFFFF;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 15px;
        }

        .bank-card-icon {
          font-size: 2.5rem;
        }

        .bank-card-section {
          margin-bottom: 1.25rem;
        }

        .bank-card-section-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #2A3140;
          margin-bottom: 0.75rem;
        }

        .bank-card-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .bank-card-list-item {
          padding-left: 1.25rem;
          margin-bottom: 0.625rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #6B7280;
          position: relative;
          line-height: 1.5;
        }

        .bank-card-list-item.feature::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #2AA46A;
          font-weight: bold;
          font-size: 1.5rem;
          line-height: 0.9;
        }

        .bank-card-list-item.note::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #F9A61B;
          font-weight: bold;
          font-size: 1.5rem;
          line-height: 0.9;
        }

        .chatbot-button {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #2AA46A 0%, #F9A61B 100%);
          border: none;
          border-radius: 50%;
          box-shadow: 0 10px 40px rgba(42, 164, 106, 0.3);
          cursor: pointer;
          z-index: 50;
          font-size: 1.75rem;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .chatbot-button:hover {
          transform: scale(1.1);
        }

        .chatbot-dialog {
          position: fixed;
          bottom: 6rem;
          right: 1.5rem;
          width: 380px;
          height: 550px;
          background-color: #FFFFFF;
          border-radius: 18px;
          box-shadow: 0 20px 60px rgba(42, 49, 64, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 50;
        }

        .chatbot-dialog-header {
          background: linear-gradient(135deg, #2AA46A 0%, #F9A61B 100%);
          padding: 1rem 1.5rem;
          border-radius: 18px 18px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #FFFFFF;
        }

        .chatbot-dialog-title {
          font-size: 1rem;
          font-weight: 700;
        }

        .chatbot-close-button {
          background: none;
          border: none;
          color: #FFFFFF;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .chatbot-dialog-content {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .chatbot-message {
          background-color: #FAF2E7;
          border-radius: 15px;
          padding: 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #2A3140;
          line-height: 1.6;
        }

        .chatbot-link {
          color: #2AA46A;
          text-decoration: underline;
          cursor: pointer;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 10px 40px rgba(42, 164, 106, 0.3);
          }
          50% {
            box-shadow: 0 10px 60px rgba(249, 166, 27, 0.4);
          }
        }

        @media (max-width: 768px) {
          .bank-header {
            padding: 1rem 1.5rem;
            flex-direction: column;
            gap: 1rem;
          }

          .bank-main-content {
            padding: 1.5rem;
          }

          .bank-form-container {
            padding: 2rem 1.5rem;
          }

          .bank-results-layout {
            flex-direction: column;
          }

          .bank-sidebar {
            max-width: 100%;
          }

          .chatbot-dialog {
            width: 90vw;
            height: 70vh;
            right: 5vw;
          }
        }
      `}} />

      <div className="bank-page-container">
        <div className="bank-header">
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="bank-back-button"
                style={{
                  padding: '0.5rem',
                  borderRadius: '9999px',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none'
                }}
              >
                <ArrowLeft style={{ width: '1.5rem', height: '1.5rem', color: '#2A3140' }} />
              </motion.button>
              <div>
                <div className="bank-header-title">Bank Recommendations</div>
                <div className="bank-header-subtitle">Find the perfect bank account for your needs</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bank-main-content">
          {!showResults ? (
            <div className="bank-form-container">
              <div className="bank-form-hero">
                <div className="bank-form-icon">
                  <Image 
                    src="/icons/icons8-growing-money-matisse-96.png" 
                    alt="Bank Icon" 
                    width={48} 
                    height={48}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="bank-form-title">Find Your Perfect Bank</div>
                <div className="bank-form-description">Tell us about yourself to get personalized recommendations</div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="bank-form-group">
                  <label className="bank-form-label">Country of Origin</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="bank-form-select"
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bank-form-group">
                  <label className="bank-form-label">Visa Type</label>
                  <select
                    value={visaType}
                    onChange={(e) => setVisaType(e.target.value)}
                    required
                    className="bank-form-select"
                  >
                    <option value="">Select visa type</option>
                    {VISA_TYPES.map((visa) => (
                      <option key={visa} value={visa}>
                        {visa}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bank-form-group">
                  <label className="bank-form-label">Do you have a Social Security Number (SSN)?</label>
                  <div className="bank-ssn-toggle">
                    <button
                      type="button"
                      onClick={() => setHasSSN(true)}
                      className={`bank-ssn-button ${hasSSN ? 'active' : 'inactive'}`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasSSN(false)}
                      className={`bank-ssn-button ${!hasSSN ? 'active' : 'inactive'}`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="bank-form-group">
                  <label className="bank-form-label">Monthly Income (USD)</label>
                  <div className="bank-income-wrapper">
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      required
                      min="0"
                      step="100"
                      className="bank-form-input bank-income-input"
                      placeholder="2000"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem', color: '#2AA46A', fontWeight: 600 }}>$</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="bank-income-slider"
                  />
                </div>

                <div className="bank-form-group">
                  <label className="bank-form-label">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="18"
                    max="100"
                    className="bank-form-input"
                    placeholder="25"
                  />
                </div>

                <button type="submit" className="bank-submit-button">
                  Get Recommendations
                </button>
              </form>
            </div>
          ) : (
            <div className="bank-results-layout">
              <div className="bank-sidebar">
                <div className="bank-sidebar-card">
                  <form onSubmit={handleSubmit}>
                    <div className="bank-form-group">
                      <label className="bank-form-label">Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="bank-form-select"
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bank-form-group">
                      <label className="bank-form-label">Visa Type</label>
                      <select
                        value={visaType}
                        onChange={(e) => setVisaType(e.target.value)}
                        required
                        className="bank-form-select"
                      >
                        <option value="">Select visa</option>
                        {VISA_TYPES.map((visa) => (
                          <option key={visa} value={visa}>{visa}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bank-form-group">
                      <label className="bank-form-label">SSN</label>
                      <div className="bank-ssn-toggle">
                        <button
                          type="button"
                          onClick={() => setHasSSN(true)}
                          className={`bank-ssn-button ${hasSSN ? 'active' : 'inactive'}`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasSSN(false)}
                          className={`bank-ssn-button ${!hasSSN ? 'active' : 'inactive'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="bank-form-group">
                      <label className="bank-form-label">Monthly Income</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          required
                          className="bank-form-input"
                          style={{ paddingLeft: '2rem' }}
                        />
                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#2AA46A', fontWeight: 600 }}>$</span>
                      </div>
                    </div>

                    <button type="submit" className="bank-submit-button">
                      Update Results
                    </button>
                  </form>
                </div>
              </div>

              <div className="bank-results-content">
                {isLoading ? (
                  <div className="bank-loading-card">
                    <div className="bank-loading-spinner"></div>
                    <div className="bank-loading-title">Finding Your Perfect Banks...</div>
                    <div className="bank-loading-description">Analyzing your profile and comparing options</div>
                    <div className="bank-loading-fact">{randomFact}</div>
                  </div>
                ) : recommendations.length > 0 ? (
                  <>
                    <div className="bank-recommendations-header">
                      <div className="bank-recommendations-title">✨ Your Recommendations</div>
                      <div className="bank-recommendations-explanation">{explanation}</div>
                    </div>

                    {recommendations.map((bank, index) => {
                      // Determine which bank icon to use
                      const getBankIcon = (bankName: string) => {
                        if (bankName.toLowerCase().includes('chase')) {
                          return '/icons/icons8-chase-bank-50.svg';
                        } else if (bankName.toLowerCase().includes('bank of america')) {
                          return '/icons/icons8-bank-of-america.svg';
                        } else if (bankName.toLowerCase().includes('capital one')) {
                          return '/icons/399D8B8B-0846-43CC-84FE-3BD632553100_4_5005_c.jpeg';
                        }
                        return '/icons/icons8-growing-money-matisse-96.png';
                      };

                      return (
                      <div key={index} className="bank-card">
                        <div className="bank-card-header">
                          <div>
                            <div className="bank-card-name">{bank.name}</div>
                            <span className="bank-card-type">{bank.type}</span>
                          </div>
                          <div className="bank-card-icon">
                            <Image 
                              src={getBankIcon(bank.name)} 
                              alt={`${bank.name} Icon`} 
                              width={40} 
                              height={40}
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        </div>

                        <div className="bank-card-section">
                          <div className="bank-card-section-title">✓ Key Features</div>
                          <ul className="bank-card-list">
                            {bank.features.map((feature, i) => (
                              <li key={i} className="bank-card-list-item feature">
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {bank.notes && bank.notes.length > 0 && (
                          <div className="bank-card-section">
                            <div className="bank-card-section-title">! Important Notes</div>
                            <ul className="bank-card-list">
                              {bank.notes.map((note, i) => (
                                <li key={i} className="bank-card-list-item note">
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="chatbot-button"
        >
          💬
        </button>

        {showChatbot && (
          <div className="chatbot-dialog">
            <div className="chatbot-dialog-header">
              <div className="chatbot-dialog-title">AI Financial Mentor</div>
              <button
                onClick={() => setShowChatbot(false)}
                className="chatbot-close-button"
              >
                ×
              </button>
            </div>
            <div className="chatbot-dialog-content">
              <div className="chatbot-message">
                Hi! I'm your AI Financial Mentor. I can help you understand your bank recommendations, answer questions about features, or provide guidance on choosing the right account.
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', textAlign: 'center' }}>
                For full chat experience, visit the <span onClick={() => router.push('/chat')} className="chatbot-link">Chat Page</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
