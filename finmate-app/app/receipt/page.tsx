'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, FileText, Receipt } from 'lucide-react';

interface ReceiptAnalysis {
  payer?: string;
  amount?: string;
  currency?: string;
  purpose?: string;
  date?: string;
  fees?: string;
  suggestions?: string;
  raw_response?: string;
  // Enhanced insights
  category?: string;
  monthlySpending?: {
    current: number;
    category: number;
    percentOfBudget: number;
  };
  cheaperAlternatives?: Array<{
    name: string;
    savings: string;
    distance?: string;
    note?: string;
  }>;
  taxDeductible?: {
    eligible: boolean;
    form?: string;
    estimatedSaving?: string;
    details?: string;
  };
  smartTips?: string[];
  budgetAlert?: {
    type: 'warning' | 'info' | 'success';
    message: string;
  };
}

export default function ReceiptPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analysis, setAnalysis] = useState<ReceiptAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse receipt');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .receipt-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #FAF2E7 0%, #EDECEA 50%, #FFFFFF 100%);
        }

        .receipt-header {
          background-color: #FFFFFF;
          border-bottom: 1px solid #EDECEA;
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: 0 2px 8px rgba(42, 49, 64, 0.08);
        }

        .receipt-back-btn {
          padding: 0.5rem;
          border-radius: 9999px;
          transition: background-color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
        }

        .receipt-back-btn:hover {
          background-color: #F5F5F5;
        }

        .receipt-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #2A3140;
          margin: 0;
        }

        .receipt-subtitle {
          color: #6B7280;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}} />

      <div className="receipt-container">
        {/* Header */}
        <div className="receipt-header">
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => router.push('/')}
                  className="receipt-back-btn"
                >
                  <ArrowLeft style={{ width: '1.25rem', height: '1.25rem', color: '#2A3140' }} />
                </button>
                <div>
                  <h1 className="receipt-title">Receipt Scanner</h1>
                  <p className="receipt-subtitle">Upload and analyze payment receipts instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            {/* Upload Section */}
            <div style={{ flex: '0 0 100%', maxWidth: '500px' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                boxShadow: '0 10px 40px rgba(42, 49, 64, 0.12)',
                padding: '2rem',
                border: '1px solid #EDECEA'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#2AA46A',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    boxShadow: '0 4px 12px rgba(42, 164, 106, 0.3)'
                  }}>
                    <Receipt style={{ width: '2rem', height: '2rem', color: '#FFFFFF' }} />
                  </div>
                  <h2 style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#2A3140',
                    marginBottom: '0.5rem'
                  }}>Upload Receipt</h2>
                  <p style={{
                    color: '#6B7280',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    lineHeight: '1.5'
                  }}>
                    Upload a payment receipt, tuition fee, or money transfer confirmation to analyze
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label
                    htmlFor="file-upload"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '16rem',
                      border: '2px dashed #2AA46A',
                      borderRadius: '15px',
                      cursor: 'pointer',
                      backgroundColor: preview ? '#FFFFFF' : '#FAF2E7',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!preview) e.currentTarget.style.backgroundColor = '#EDECEA';
                    }}
                    onMouseLeave={(e) => {
                      if (!preview) e.currentTarget.style.backgroundColor = '#FAF2E7';
                    }}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        style={{
                          maxHeight: '15rem',
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <Upload style={{
                          width: '3rem',
                          height: '3rem',
                          color: '#2AA46A',
                          marginBottom: '1rem',
                          opacity: 0.7
                        }} />
                        <p style={{
                          color: '#2A3140',
                          fontWeight: '600',
                          fontSize: '1rem',
                          marginBottom: '0.5rem'
                        }}>
                          Click to upload or drag & drop
                        </p>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#6B7280',
                          fontWeight: '500'
                        }}>
                          PNG, JPG, or PDF (max 10MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      style={{ display: 'none' }}
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {file && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #2AA46A',
                    borderRadius: '12px',
                    marginBottom: '1rem'
                  }}>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#2AA46A',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FileText style={{ width: '1rem', height: '1rem' }} />
                      {file.name}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!file || isLoading}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    backgroundColor: !file || isLoading ? '#9CA3AF' : '#2AA46A',
                    color: '#FFFFFF',
                    borderRadius: '15px',
                    fontWeight: '700',
                    fontSize: '1rem',
                    border: 'none',
                    cursor: !file || isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: !file || isLoading ? 'none' : '0 4px 12px rgba(42, 164, 106, 0.3)',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (file && !isLoading) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.backgroundColor = '#259456';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (file && !isLoading) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = '#2AA46A';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Receipt'
                  )}
                </button>

                {error && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '12px'
                  }}>
                    <p style={{
                      color: '#DC2626',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                boxShadow: '0 10px 40px rgba(42, 49, 64, 0.12)',
                padding: '2rem',
                border: '1px solid #EDECEA',
                minHeight: '500px'
              }}>
                <h2 style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#2A3140',
                  marginBottom: '1.5rem',
                  borderBottom: '2px solid #EDECEA',
                  paddingBottom: '1rem'
                }}>Analysis Results</h2>

                {!analysis && !isLoading && (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem'
                  }}>
                    <div style={{
                      width: '6rem',
                      height: '6rem',
                      backgroundColor: '#FAF2E7',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem auto',
                      border: '3px dashed #2AA46A'
                    }}>
                      <FileText style={{
                        width: '3rem',
                        height: '3rem',
                        color: '#2AA46A',
                        opacity: 0.5
                      }} />
                    </div>
                    <p style={{
                      color: '#6B7280',
                      fontSize: '1rem',
                      fontWeight: '500',
                      lineHeight: '1.5'
                    }}>
                      Upload a receipt to see the analysis results
                    </p>
                  </div>
                )}

                {isLoading && (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem'
                  }}>
                    <Loader2 style={{
                      width: '3rem',
                      height: '3rem',
                      color: '#2AA46A',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1.5rem auto'
                    }} />
                    <p style={{
                      color: '#2A3140',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Processing your receipt...
                    </p>
                    <p style={{
                      color: '#6B7280',
                      fontSize: '0.875rem'
                    }}>
                      This may take a few seconds
                    </p>
                  </div>
                )}

                {analysis && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Budget Alert (if exists) */}
                    {analysis.budgetAlert && (
                      <div style={{
                        padding: '1.25rem',
                        backgroundColor: analysis.budgetAlert.type === 'warning' ? '#FFF7ED' : 
                                       analysis.budgetAlert.type === 'success' ? '#F0FDF4' : '#EFF6FF',
                        border: `2px solid ${analysis.budgetAlert.type === 'warning' ? '#F9A61B' : 
                                             analysis.budgetAlert.type === 'success' ? '#2AA46A' : '#3B82F6'}`,
                        borderRadius: '15px'
                      }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: analysis.budgetAlert.type === 'warning' ? '#C2410C' : 
                                 analysis.budgetAlert.type === 'success' ? '#15803D' : '#1E40AF',
                          marginBottom: '0.5rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {analysis.budgetAlert.type === 'warning' ? '⚠️ Budget Alert' : 
                           analysis.budgetAlert.type === 'success' ? '✅ Good Job!' : 'ℹ️ Info'}
                        </p>
                        <p style={{
                          color: '#2A3140',
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          lineHeight: '1.5'
                        }}>
                          {analysis.budgetAlert.message}
                        </p>
                      </div>
                    )}

                    {/* Monthly Spending Overview (if exists) */}
                    {analysis.monthlySpending && (
                      <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #FAF2E7 0%, #FFFFFF 100%)',
                        border: '2px solid #EDECEA',
                        borderRadius: '15px'
                      }}>
                        <h3 style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: '#2A3140',
                          marginBottom: '1rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          📊 Your Spending This Month
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600', marginBottom: '0.25rem' }}>
                              TOTAL SPENT
                            </p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2A3140' }}>
                              ${analysis.monthlySpending.current}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600', marginBottom: '0.25rem' }}>
                              {analysis.category?.toUpperCase()}
                            </p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2AA46A' }}>
                              ${analysis.monthlySpending.category}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600', marginBottom: '0.25rem' }}>
                              OF BUDGET
                            </p>
                            <p style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: '700', 
                              color: analysis.monthlySpending.percentOfBudget > 90 ? '#F9A61B' : '#2AA46A' 
                            }}>
                              {analysis.monthlySpending.percentOfBudget}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {analysis.raw_response ? (
                      <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#FAF2E7',
                        borderRadius: '15px',
                        border: '1px solid #EDECEA'
                      }}>
                        <p style={{
                          color: '#2A3140',
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.9375rem',
                          lineHeight: '1.6',
                          fontWeight: '500'
                        }}>
                          {analysis.raw_response}
                        </p>
                      </div>
                    ) : (
                      <>
                        {analysis.payer && (
                          <div style={{
                            padding: '1.25rem',
                            backgroundColor: '#FFFFFF',
                            border: '2px solid #EDECEA',
                            borderRadius: '15px'
                          }}>
                            <label style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: '#6B7280',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              display: 'block',
                              marginBottom: '0.5rem'
                            }}>
                              Merchant / Payer
                            </label>
                            <p style={{
                              fontSize: '1.25rem',
                              fontWeight: '600',
                              color: '#2A3140'
                            }}>
                              {analysis.payer}
                              {analysis.category && (
                                <span style={{
                                  marginLeft: '0.75rem',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#2AA46A',
                                  backgroundColor: '#F0FDF4',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px'
                                }}>
                                  {analysis.category}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        {analysis.amount && (
                          <div style={{
                            padding: '1.25rem',
                            backgroundColor: '#F0FDF4',
                            border: '2px solid #2AA46A',
                            borderRadius: '15px'
                          }}>
                            <label style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: '#15803D',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              display: 'block',
                              marginBottom: '0.5rem'
                            }}>
                              Total Amount
                            </label>
                            <p style={{
                              fontSize: '2rem',
                              fontWeight: '700',
                              color: '#2AA46A'
                            }}>
                              {analysis.currency || '$'} {analysis.amount}
                            </p>
                          </div>
                        )}

                        {/* Cheaper Alternatives */}
                        {analysis.cheaperAlternatives && analysis.cheaperAlternatives.length > 0 && (
                          <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#FFF7ED',
                            border: '2px solid #F9A61B',
                            borderRadius: '15px'
                          }}>
                            <h3 style={{
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              color: '#C2410C',
                              marginBottom: '1rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1.125rem' }}>💰</span>
                              Cheaper Alternatives Nearby
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {analysis.cheaperAlternatives.map((alt, idx) => (
                                <div key={idx} style={{
                                  padding: '1rem',
                                  backgroundColor: '#FFFFFF',
                                  borderRadius: '12px',
                                  border: '1px solid #FED7AA'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <p style={{ fontSize: '1rem', fontWeight: '700', color: '#2A3140' }}>
                                      {alt.name}
                                    </p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#2AA46A' }}>
                                      Save {alt.savings}
                                    </p>
                                  </div>
                                  {alt.distance && (
                                    <p style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: '500' }}>
                                      📍 {alt.distance} away
                                    </p>
                                  )}
                                  {alt.note && (
                                    <p style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: '500', marginTop: '0.25rem' }}>
                                      {alt.note}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tax Deductible Info */}
                        {analysis.taxDeductible && analysis.taxDeductible.eligible && (
                          <div style={{
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                            border: '2px solid #3B82F6',
                            borderRadius: '15px'
                          }}>
                            <h3 style={{
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              color: '#1E40AF',
                              marginBottom: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1.125rem' }}>🎓</span>
                              Tax Deductible!
                            </h3>
                            <p style={{
                              color: '#2A3140',
                              fontSize: '0.9375rem',
                              fontWeight: '600',
                              lineHeight: '1.5',
                              marginBottom: '0.75rem'
                            }}>
                              {analysis.taxDeductible.details}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                              {analysis.taxDeductible.form && (
                                <div style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#FFFFFF',
                                  borderRadius: '8px',
                                  border: '1px solid #93C5FD'
                                }}>
                                  <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' }}>
                                    IRS FORM
                                  </p>
                                  <p style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1E40AF' }}>
                                    {analysis.taxDeductible.form}
                                  </p>
                                </div>
                              )}
                              {analysis.taxDeductible.estimatedSaving && (
                                <div style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#FFFFFF',
                                  borderRadius: '8px',
                                  border: '1px solid #93C5FD'
                                }}>
                                  <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' }}>
                                    SAVE UP TO
                                  </p>
                                  <p style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#2AA46A' }}>
                                    {analysis.taxDeductible.estimatedSaving}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {analysis.purpose && (
                          <div style={{
                            padding: '1.25rem',
                            backgroundColor: '#FFFFFF',
                            border: '2px solid #EDECEA',
                            borderRadius: '15px'
                          }}>
                            <label style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: '#6B7280',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              display: 'block',
                              marginBottom: '0.5rem'
                            }}>
                              Purpose / Description
                            </label>
                            <p style={{
                              fontSize: '1rem',
                              fontWeight: '500',
                              color: '#2A3140',
                              lineHeight: '1.5'
                            }}>
                              {analysis.purpose}
                            </p>
                          </div>
                        )}

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: analysis.date && analysis.fees ? '1fr 1fr' : '1fr',
                          gap: '1rem'
                        }}>
                          {analysis.date && (
                            <div style={{
                              padding: '1.25rem',
                              backgroundColor: '#FFFFFF',
                              border: '2px solid #EDECEA',
                              borderRadius: '15px'
                            }}>
                              <label style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#6B7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'block',
                                marginBottom: '0.5rem'
                              }}>
                                Date
                              </label>
                              <p style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#2A3140'
                              }}>
                                {analysis.date}
                              </p>
                            </div>
                          )}

                          {analysis.fees && (
                            <div style={{
                              padding: '1.25rem',
                              backgroundColor: '#FFF7ED',
                              border: '2px solid #F9A61B',
                              borderRadius: '15px'
                            }}>
                              <label style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#C2410C',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'block',
                                marginBottom: '0.5rem'
                              }}>
                                Fees
                              </label>
                              <p style={{
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: '#F9A61B'
                              }}>
                                {analysis.fees}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Smart Tips */}
                        {analysis.smartTips && analysis.smartTips.length > 0 && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, rgba(42, 164, 106, 0.1) 0%, rgba(249, 166, 27, 0.1) 100%)',
                            border: '2px solid #2AA46A',
                            borderRadius: '15px'
                          }}>
                            <label style={{
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              color: '#2AA46A',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.75rem'
                            }}>
                              <span style={{
                                fontSize: '1.25rem'
                              }}>💡</span>
                              Smart Money Tips
                            </label>
                            <ul style={{
                              listStyle: 'none',
                              padding: 0,
                              margin: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem'
                            }}>
                              {analysis.smartTips.map((tip, idx) => (
                                <li key={idx} style={{
                                  color: '#2A3140',
                                  fontSize: '0.9375rem',
                                  lineHeight: '1.6',
                                  fontWeight: '500',
                                  paddingLeft: '1.5rem',
                                  position: 'relative'
                                }}>
                                  <span style={{
                                    position: 'absolute',
                                    left: 0,
                                    color: '#2AA46A',
                                    fontWeight: '700'
                                  }}>•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysis.suggestions && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, rgba(42, 164, 106, 0.1) 0%, rgba(249, 166, 27, 0.1) 100%)',
                            border: '2px solid #2AA46A',
                            borderRadius: '15px'
                          }}>
                            <label style={{
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              color: '#2AA46A',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.75rem'
                            }}>
                              <span style={{
                                fontSize: '1.25rem'
                              }}>💡</span>
                              Smart Suggestions
                            </label>
                            <p style={{
                              color: '#2A3140',
                              fontSize: '0.9375rem',
                              lineHeight: '1.6',
                              fontWeight: '500'
                            }}>
                              {analysis.suggestions}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
