'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

interface ReceiptAnalysis {
  payer?: string;
  amount?: string;
  currency?: string;
  purpose?: string;
  date?: string;
  fees?: string;
  suggestions?: string;
  raw_response?: string;
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
          <h1 className="text-xl font-bold">Receipt Scanner</h1>
          <p className="text-sm text-gray-600">Upload and analyze payment receipts</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">Upload Receipt</h2>
              <p className="text-gray-600 mb-6">
                Upload a payment receipt, tuition fee, or money transfer confirmation
              </p>

              <div className="mb-6">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-60 object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium">Click to upload</p>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG, or PDF (max 10MB)
                      </p>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {file && (
                <p className="text-sm text-gray-600 mb-4">
                  Selected: {file.name}
                </p>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || isLoading}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Receipt'
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>

              {!analysis && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-600">
                    Upload a receipt to see the analysis
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Processing your receipt...</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-4">
                  {analysis.raw_response ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {analysis.raw_response}
                      </p>
                    </div>
                  ) : (
                    <>
                      {analysis.payer && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">
                            Payer
                          </label>
                          <p className="text-lg">{analysis.payer}</p>
                        </div>
                      )}

                      {analysis.amount && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">
                            Amount
                          </label>
                          <p className="text-lg">
                            {analysis.currency || ''} {analysis.amount}
                          </p>
                        </div>
                      )}

                      {analysis.purpose && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">
                            Purpose
                          </label>
                          <p className="text-lg">{analysis.purpose}</p>
                        </div>
                      )}

                      {analysis.date && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">
                            Date
                          </label>
                          <p className="text-lg">{analysis.date}</p>
                        </div>
                      )}

                      {analysis.fees && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">
                            Fees
                          </label>
                          <p className="text-lg">{analysis.fees}</p>
                        </div>
                      )}

                      {analysis.suggestions && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <label className="text-sm font-semibold text-green-800">
                            💡 Suggestions
                          </label>
                          <p className="text-green-700 mt-2">
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
  );
}
