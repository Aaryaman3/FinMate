'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Activity, Clock, CheckCircle, TrendingUp, ExternalLink, Shield } from 'lucide-react';

interface Trace {
  id: string;
  type: string;
  timestamp: Date;
  latency: number;
  status: string;
  category?: string;
  country?: string;
  safety_score?: number;
  tokens?: number;
  cost_usd?: number;
}

interface OpikStats {
  total_traces: number;
  avg_latency_ms: number;
  success_rate: number;
  total_cost_usd: number;
  avg_safety_score: number;
  categories: Record<string, number>;
  countries: Record<string, number>;
  pii_blocked_count: number;
}

export default function TransparencyPage() {
  const router = useRouter();
  const [traces, setTraces] = useState<Trace[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    avgLatency: 0,
    successRate: 100,
  });
  const [opikStats, setOpikStats] = useState<OpikStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [isLiveMode, setIsLiveMode] = useState(false);

  useEffect(() => {
    fetchTraces();
    // Refresh every 30 seconds if in live mode
    const interval = setInterval(() => {
      if (isLiveMode) {
        fetchTraces();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [timeRange, isLiveMode]);

  async function fetchTraces() {
    setLoading(true);
    try {
      // Try to fetch from Opik API
      const response = await fetch(`/api/opik/traces?range=${timeRange}`);
      const data = await response.json();
      
      if (data.stats) {
        setOpikStats(data.stats);
        setIsLiveMode(true);
        
        // Update basic stats
        setStats({
          total: data.stats.total_traces,
          avgLatency: data.stats.avg_latency_ms / 1000, // Convert to seconds
          successRate: data.stats.success_rate,
        });
        
        // Transform Opik traces to our format
        if (data.traces && data.traces.length > 0) {
          const transformedTraces = data.traces.map((t: any) => ({
            id: t.id,
            type: t.name,
            timestamp: new Date(t.start_time),
            latency: t.duration_ms / 1000, // Convert to seconds
            status: t.metadata?.status || 'success',
            category: t.metadata?.category,
            country: t.metadata?.country,
            safety_score: t.metadata?.safety_score,
            tokens: t.metadata?.tokens,
            cost_usd: t.metadata?.cost_usd,
          }));
          setTraces(transformedTraces);
        }
      } else {
        // Fallback to mock data
        loadMockData();
        setIsLiveMode(false);
      }
    } catch (error) {
      console.error('Error fetching traces:', error);
      loadMockData();
      setIsLiveMode(false);
    } finally {
      setLoading(false);
    }
  }

  function loadMockData() {
    // Mock trace data
    const mockTraces: Trace[] = [
      {
        id: '1',
        type: 'chat_mentor',
        timestamp: new Date(),
        latency: 1.2,
        status: 'success',
        category: 'banking',
        country: 'India',
        safety_score: 1.0,
        tokens: 234,
        cost_usd: 0.000035,
      },
      {
        id: '2',
        type: 'bank_recommendation',
        timestamp: new Date(Date.now() - 300000),
        latency: 2.1,
        status: 'success',
        category: 'banking',
        tokens: 456,
        cost_usd: 0.000068,
      },
      {
        id: '3',
        type: 'chat_mentor',
        timestamp: new Date(Date.now() - 600000),
        latency: 1.8,
        status: 'success',
        category: 'tax',
        country: 'China',
        safety_score: 1.0,
        tokens: 312,
        cost_usd: 0.000047,
      },
    ];

    setTraces(mockTraces);
    
    // Calculate stats
    const total = mockTraces.length;
    const avgLatency = mockTraces.reduce((sum, t) => sum + t.latency, 0) / total;
    const successRate = (mockTraces.filter(t => t.status === 'success').length / total) * 100;
    
    setStats({
      total,
      avgLatency: Math.round(avgLatency * 100) / 100,
      successRate: Math.round(successRate),
    });

    // Mock Opik stats
    setOpikStats({
      total_traces: 156,
      avg_latency_ms: 342,
      success_rate: 98.7,
      total_cost_usd: 0.0234,
      avg_safety_score: 0.96,
      categories: {
        banking: 45,
        tax: 32,
        remittance: 28,
        credit: 24,
        visa: 15,
        investment: 12,
      },
      countries: {
        India: 52,
        China: 34,
        Mexico: 21,
        Vietnam: 15,
        'South Korea': 12,
        Nigeria: 8,
      },
      pii_blocked_count: 7,
    });
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .transparency-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #FAF2E7 0%, #EDECEA 50%, #FFFFFF 100%);
        }

        .transparency-header {
          background-color: #FFFFFF;
          border-bottom: 1px solid #EDECEA;
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: 0 2px 8px rgba(42, 49, 64, 0.08);
        }

        .transparency-back-btn {
          padding: 0.5rem;
          border-radius: 9999px;
          transition: background-color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
        }

        .transparency-back-btn:hover {
          background-color: #F5F5F5;
        }

        .transparency-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #2A3140;
          margin: 0;
        }

        .transparency-subtitle {
          color: #6B7280;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-card {
          background-color: #FFFFFF;
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 10px 40px rgba(42, 49, 64, 0.12);
          border: 1px solid #EDECEA;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 50px rgba(42, 49, 64, 0.18);
        }

        .trace-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .trace-table thead tr {
          border-bottom: 2px solid #EDECEA;
        }

        .trace-table tbody tr {
          border-bottom: 1px solid #F3F4F6;
          transition: background-color 0.2s;
        }

        .trace-table tbody tr:hover {
          background-color: #FAF2E7;
        }

        .trace-table th {
          text-align: left;
          padding: 1rem;
          font-weight: 700;
          color: #2A3140;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .trace-table td {
          padding: 1rem;
          color: #2A3140;
          font-weight: 500;
        }

        .badge {
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          display: inline-block;
        }

        .badge-primary {
          background-color: rgba(42, 164, 106, 0.1);
          color: #2AA46A;
          border: 1px solid rgba(42, 164, 106, 0.3);
        }

        .badge-success {
          background-color: rgba(42, 164, 106, 0.15);
          color: #15803D;
          border: 1px solid #2AA46A;
        }

        .link-button {
          color: #2AA46A;
          font-weight: 600;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .link-button:hover {
          color: #259456;
        }
      `}} />

      <div className="transparency-container">
        {/* Header */}
        <div className="transparency-header">
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => router.push('/')}
                  className="transparency-back-btn"
                >
                  <ArrowLeft style={{ width: '1.25rem', height: '1.25rem', color: '#2A3140' }} />
                </button>
                <div>
                  <h1 className="transparency-title">AI Transparency Dashboard</h1>
                  <p className="transparency-subtitle">Monitor AI calls and performance metrics in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              backgroundColor: '#2AA46A',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 4px 12px rgba(42, 164, 106, 0.3)'
            }}>
              <Shield style={{ width: '2.5rem', height: '2.5rem', color: '#FFFFFF' }} />
            </div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2A3140',
              marginBottom: '0.75rem'
            }}>System Performance</h2>
            <p style={{
              color: '#6B7280',
              fontSize: '1.125rem',
              fontWeight: '500',
              maxWidth: '42rem',
              margin: '0 auto'
            }}>
              All AI operations are tracked and monitored in real-time using Opik
            </p>
          </div>

          {/* Live Status Banner */}
          <div style={{
            backgroundColor: isLiveMode ? '#ECFDF5' : '#FEF2F2',
            border: `2px solid ${isLiveMode ? '#6EE7B7' : '#FCA5A5'}`,
            borderRadius: '15px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{isLiveMode ? '🟢' : '⚠️'}</span>
              <div>
                <div style={{ fontWeight: '600', color: '#2A3140', marginBottom: '0.25rem' }}>
                  {isLiveMode ? 'Live Monitoring Active' : 'Demo Mode'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                  {isLiveMode ? 'Real-time data from Opik • Updates every 30 seconds' : 'Using demonstration data'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #EDECEA',
                  background: '#FFFFFF',
                  color: '#2A3140',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={fetchTraces}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#2AA46A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                {loading ? '↻ Refreshing...' : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: 'rgba(42, 164, 106, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity style={{ width: '1.5rem', height: '1.5rem', color: '#2AA46A' }} />
                </div>
                <h3 style={{
                  color: '#6B7280',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Total AI Calls</h3>
              </div>
              <p style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#2A3140',
                lineHeight: '1'
              }}>{stats.total}</p>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock style={{ width: '1.5rem', height: '1.5rem', color: '#3B82F6' }} />
                </div>
                <h3 style={{
                  color: '#6B7280',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Avg Latency</h3>
              </div>
              <p style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#2A3140',
                lineHeight: '1'
              }}>{stats.avgLatency}s</p>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: 'rgba(42, 164, 106, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#2AA46A' }} />
                </div>
                <h3 style={{
                  color: '#6B7280',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Success Rate</h3>
              </div>
              <p style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#2A3140',
                lineHeight: '1'
              }}>{stats.successRate}%</p>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: '#A855F7' }} />
                </div>
                <h3 style={{
                  color: '#6B7280',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Uptime</h3>
              </div>
              <p style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#2A3140',
                lineHeight: '1'
              }}>99.9%</p>
            </div>

            {/* Additional Opik Stats */}
            {opikStats && (
              <>
                <div className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>💰</span>
                    </div>
                    <h3 style={{
                      color: '#6B7280',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Total Cost</h3>
                  </div>
                  <p style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#2A3140',
                    lineHeight: '1'
                  }}>${opikStats.total_cost_usd.toFixed(4)}</p>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                    </div>
                    <h3 style={{
                      color: '#6B7280',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Safety Score</h3>
                  </div>
                  <p style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#2A3140',
                    lineHeight: '1'
                  }}>{(opikStats.avg_safety_score * 100).toFixed(0)}%</p>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🔒</span>
                    </div>
                    <h3 style={{
                      color: '#6B7280',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>PII Blocked</h3>
                  </div>
                  <p style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#2A3140',
                    lineHeight: '1'
                  }}>{opikStats.pii_blocked_count}</p>
                </div>
              </>
            )}
          </div>

          {/* Category & Country Distribution */}
          {opikStats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {/* Categories */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                boxShadow: '0 10px 40px rgba(42, 49, 64, 0.12)',
                padding: '2rem',
                border: '1px solid #EDECEA'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#2A3140',
                  marginBottom: '1.5rem'
                }}>Question Categories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(opikStats.categories).map(([category, count]) => (
                    <div key={category} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB'
                    }}>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#2A3140',
                        textTransform: 'capitalize'
                      }}>{category}</span>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#2AA46A'
                      }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Countries */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                boxShadow: '0 10px 40px rgba(42, 49, 64, 0.12)',
                padding: '2rem',
                border: '1px solid #EDECEA'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#2A3140',
                  marginBottom: '1.5rem'
                }}>Student Countries</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(opikStats.countries).map(([country, count]) => (
                    <div key={country} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB'
                    }}>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#2A3140'
                      }}>{country}</span>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#3B82F6'
                      }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Traces */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            boxShadow: '0 10px 40px rgba(42, 49, 64, 0.12)',
            padding: '2rem',
            border: '1px solid #EDECEA',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#2A3140',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #EDECEA',
              paddingBottom: '1rem'
            }}>Recent AI Traces</h2>

            {traces.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 1rem'
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
                  <Activity style={{
                    width: '3rem',
                    height: '3rem',
                    color: '#2AA46A',
                    opacity: 0.5
                  }} />
                </div>
                <p style={{
                  color: '#6B7280',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>No traces yet. Start using the app to see activity.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="trace-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Timestamp</th>
                      <th>Latency</th>
                      <th>Status</th>
                      {opikStats && <th>Category</th>}
                      {opikStats && <th>Safety</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traces.map((trace) => (
                      <tr key={trace.id}>
                        <td>
                          <span className="badge badge-primary">
                            {trace.type}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.875rem' }}>
                          {trace.timestamp.toLocaleString()}
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          {trace.latency}s
                        </td>
                        <td>
                          <span className="badge badge-success">
                            {trace.status}
                          </span>
                        </td>
                        {opikStats && (
                          <td>
                            {trace.category && (
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '8px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#3B82F6',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textTransform: 'capitalize'
                              }}>
                                {trace.category}
                              </span>
                            )}
                            {trace.country && (
                              <div style={{
                                marginTop: '0.25rem',
                                fontSize: '0.75rem',
                                color: '#6B7280'
                              }}>
                                📍 {trace.country}
                              </div>
                            )}
                          </td>
                        )}
                        {opikStats && (
                          <td>
                            {trace.safety_score !== undefined && (
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '8px',
                                background: trace.safety_score >= 0.9 ? 'rgba(34, 197, 94, 0.1)' : 
                                           trace.safety_score >= 0.7 ? 'rgba(251, 191, 36, 0.1)' : 
                                           'rgba(239, 68, 68, 0.1)',
                                color: trace.safety_score >= 0.9 ? '#22C55E' : 
                                       trace.safety_score >= 0.7 ? '#F59E0B' : 
                                       '#EF4444',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}>
                                🛡️ {(trace.safety_score * 100).toFixed(0)}%
                              </span>
                            )}
                          </td>
                        )}
                        <td>
                          <a
                            href={`https://www.comet.com/${process.env.NEXT_PUBLIC_OPIK_WORKSPACE || 'aaryaman-bajaj'}/redirect/projects?name=finmate`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-button"
                          >
                            View Details
                            <ExternalLink style={{ width: '1rem', height: '1rem' }} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(42, 164, 106, 0.1) 0%, rgba(249, 166, 27, 0.1) 100%)',
            border: '2px solid #2AA46A',
            borderRadius: '18px',
            padding: '2.5rem',
            boxShadow: '0 10px 40px rgba(42, 49, 64, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                backgroundColor: '#2AA46A',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Shield style={{ width: '2rem', height: '2rem', color: '#FFFFFF' }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#2A3140',
                  marginBottom: '0.75rem'
                }}>About Opik Tracing</h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  color: '#2A3140',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  fontWeight: '500'
                }}>
                  <p>
                    <strong style={{ color: '#2AA46A' }}>Opik</strong> is an open-source AI observability platform that helps us track and monitor all AI operations in FinMate.
                  </p>
                  <p>
                    Every chat message, bank recommendation, and receipt analysis is logged with detailed metrics including:
                  </p>
                  <ul style={{
                    listStyleType: 'disc',
                    listStylePosition: 'inside',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginLeft: '1rem'
                  }}>
                    <li>Request and response payloads</li>
                    <li>Latency and performance metrics</li>
                    <li>Error tracking and debugging info</li>
                    <li>Model usage and costs</li>
                  </ul>
                  <p style={{ marginTop: '0.5rem' }}>
                    This transparency ensures our AI system is reliable, performant, and trustworthy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}