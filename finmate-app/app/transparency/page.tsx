'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Activity, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface Trace {
  id: string;
  type: string;
  timestamp: Date;
  latency: number;
  status: string;
}

export default function TransparencyPage() {
  const router = useRouter();
  const [traces, setTraces] = useState<Trace[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    avgLatency: 0,
    successRate: 100,
  });

  useEffect(() => {
    // Mock data for demonstration
    // In production, fetch from Opik API
    fetchTraces();
  }, []);

  async function fetchTraces() {
    // Mock trace data
    const mockTraces: Trace[] = [
      {
        id: '1',
        type: 'chat_mentor',
        timestamp: new Date(),
        latency: 1.2,
        status: 'success',
      },
      {
        id: '2',
        type: 'bank_recommendation',
        timestamp: new Date(Date.now() - 300000),
        latency: 2.1,
        status: 'success',
      },
      {
        id: '3',
        type: 'parse_receipt',
        timestamp: new Date(Date.now() - 600000),
        latency: 3.4,
        status: 'success',
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
  }

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
          <h1 className="text-xl font-bold">AI Transparency Dashboard</h1>
          <p className="text-sm text-gray-600">Monitor AI calls and performance metrics</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">System Performance</h2>
          <p className="text-gray-600">
            All AI operations are tracked and monitored in real-time using Opik
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="text-gray-600 font-medium">Total AI Calls</h3>
            </div>
            <p className="text-4xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-gray-600 font-medium">Avg Latency</h3>
            </div>
            <p className="text-4xl font-bold">{stats.avgLatency}s</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-gray-600 font-medium">Success Rate</h3>
            </div>
            <p className="text-4xl font-bold">{stats.successRate}%</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-gray-600 font-medium">Uptime</h3>
            </div>
            <p className="text-4xl font-bold">99.9%</p>
          </div>
        </div>

        {/* Recent Traces */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Recent AI Traces</h2>

          {traces.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No traces yet. Start using the app to see activity.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Latency</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {traces.map((trace) => (
                    <tr key={trace.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                          {trace.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {trace.timestamp.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {trace.latency}s
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {trace.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={`https://www.comet.com/opik/traces/${trace.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          View Details →
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
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl">
          <h3 className="text-2xl font-bold mb-4">About Opik Tracing</h3>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Opik</strong> is an open-source AI observability platform that helps us track and monitor all AI operations in FinMate.
            </p>
            <p>
              Every chat message, bank recommendation, and receipt analysis is logged with detailed metrics including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Request and response payloads</li>
              <li>Latency and performance metrics</li>
              <li>Error tracking and debugging info</li>
              <li>Model usage and costs</li>
            </ul>
            <p className="mt-4">
              This transparency ensures our AI system is reliable, performant, and trustworthy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
