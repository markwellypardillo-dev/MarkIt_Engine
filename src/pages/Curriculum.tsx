import React, { useState } from 'react';
import { BookOpen, Upload, CircleCheck, CircleX, Search } from 'lucide-react';

export default function Curriculum() {
  const [isUploading, setIsUploading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload and AI processing
    setTimeout(() => {
      setIsUploading(false);
      setAnalyzed(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <BookOpen className="h-6 w-6 text-orange-500 mr-2" />
            Curriculum Compliance Engine
          </h2>
          <p className="mt-2 text-slate-500">
            Upload syllabi to cross-reference against institutional and state standards. Identify missing competencies instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center h-full flex flex-col justify-center border-dashed border-2">
            <div className="mx-auto w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Upload Syllabus</h3>
            <p className="text-sm text-slate-500 mb-6">PDF, DOCX up to 10MB</p>
            <button 
              onClick={handleUpload}
              disabled={isUploading || analyzed}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Analyzing...' : 'Browse Files'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-medium text-slate-800">Compliance Report</h3>
              {analyzed && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  85% Compliant
                </span>
              )}
            </div>
            
            <div className="flex-1 p-6">
              {!analyzed ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Search className="h-12 w-12 mb-3 text-slate-300" />
                  <p>Upload a syllabus to generate a compliance report</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Satisfied Competencies</h4>
                    <ul className="space-y-2">
                      {['Core Mathematical Concepts', 'Historical Context & Analysis', 'Research Methodology'].map((item) => (
                        <li key={item} className="flex items-center text-sm text-slate-700">
                          <CircleCheck className="h-4 w-4 text-green-500 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Missing Competencies</h4>
                    <ul className="space-y-3">
                      {[
                        { title: 'Digital Literacy standard 4.2', detail: 'Missing required instruction on digital safety.' },
                        { title: 'Modern Civic Engagement', detail: 'No modules found covering contemporary civic duties.' }
                      ].map((item) => (
                        <li key={item.title} className="flex items-start text-sm bg-orange-50 p-3 rounded-md">
                          <CircleX className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                          <div>
                            <div className="font-medium text-orange-800">{item.title}</div>
                            <div className="text-orange-700 mt-0.5">{item.detail}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
