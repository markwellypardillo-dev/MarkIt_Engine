import React, { useState } from 'react';
import { PenTool, FileText, Send, Sparkles, Loader2, MessageSquare, UserCheck, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { useData } from '../contexts/DataContext';

type ToolType = 'rubric' | 'lesson' | 'communication';

export default function TeacherToolkit() {
  const [activeTool, setActiveTool] = useState<ToolType>('rubric');
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('9th Grade');
  const [criteria, setCriteria] = useState('');
  
  // Communication Log state
  const [studentName, setStudentName] = useState('');
  const [performance, setPerformance] = useState('Meeting Expectations');
  const [tone, setTone] = useState('Encouraging');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const { students } = useData();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setResult(null);
    setError(null);
    setIsSaved(false);

    try {
      let endpoint = '/api/ai/generate-rubric';
      let body: any = { topic, gradeLevel, criteria: criteria.split(',').map(c => c.trim()), type: activeTool };

      if (activeTool === 'communication') {
        endpoint = '/api/ai/generate-communication';
        body = { studentName, performance, tone, themes: criteria.split(',').map(c => c.trim()) };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setResult(activeTool === 'communication' ? data.communication : data.rubric);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Sparkles className="h-6 w-6 text-orange-500 mr-2" />
          Teacher Automation Toolkit
        </h2>
        <p className="mt-2 text-slate-500">Accelerate your workflow with AI-powered institutional tools.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-800">Select Tool</h3>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => setActiveTool('rubric')}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center transition-colors",
                  activeTool === 'rubric' ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className="bg-white p-1.5 rounded border border-slate-200 mr-3 shadow-sm">
                  <PenTool className="h-4 w-4" />
                </div>
                Criteria Rubric Generator
              </button>
              <button
                onClick={() => setActiveTool('lesson')}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center transition-colors",
                  activeTool === 'lesson' ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className="bg-white p-1.5 rounded border border-slate-200 mr-3 shadow-sm">
                  <FileText className="h-4 w-4" />
                </div>
                Lesson Plan Builder
              </button>
              <button
                onClick={() => setActiveTool('communication')}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center transition-colors",
                  activeTool === 'communication' ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className="bg-white p-1.5 rounded border border-slate-200 mr-3 shadow-sm">
                  <MessageSquare className="h-4 w-4" />
                </div>
                Communication Log Generator
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-800">
                {activeTool === 'rubric' && 'Configure Rubric'}
                {activeTool === 'lesson' && 'Configure Lesson Plan'}
                {activeTool === 'communication' && 'Configure Communication Log'}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {result ? (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h4 className="font-semibold text-lg text-slate-800">Generated Content</h4>
                    <div className="flex items-center space-x-3">
                      {activeTool === 'communication' && (
                        <button 
                          onClick={() => setIsSaved(true)}
                          disabled={isSaved}
                          className="text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50"
                        >
                          {isSaved ? <><Check className="w-4 h-4 mr-1"/> Saved Log</> : <><UserCheck className="w-4 h-4 mr-1"/> Save to Student Record</>}
                        </button>
                      )}
                      <button 
                        onClick={() => setResult(null)}
                        className="text-sm text-slate-500 hover:text-orange-600 font-medium px-2 py-1.5"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    {activeTool === 'communication' && studentName && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-sm text-slate-600">
                        <strong>Drafted for:</strong> {studentName} • <strong>Performance:</strong> {performance}
                      </div>
                    )}
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerate} className="space-y-5">
                  {(activeTool === 'rubric' || activeTool === 'lesson') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                        <input
                          type="text"
                          required
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g., The Causes of the French Revolution"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
                        <select
                          value={gradeLevel}
                          onChange={(e) => setGradeLevel(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        >
                          {['6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'University'].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {activeTool === 'rubric' ? 'Assessment Criteria (comma separated)' : 'Learning Objectives'}
                        </label>
                        <textarea
                          required
                          value={criteria}
                          onChange={(e) => setCriteria(e.target.value)}
                          placeholder={activeTool === 'rubric' ? "Historical accuracy, thesis clarity, structure" : "Understand the timeline, identify key figures"}
                          rows={4}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                    </>
                  )}

                  {activeTool === 'communication' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
                        <input
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="e.g., Alex Johnson"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Performance Level</label>
                        <select
                          value={performance}
                          onChange={(e) => setPerformance(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        >
                          {['Excelling', 'Meeting Expectations', 'Approaching Expectations', 'Needs Improvement', 'At-Risk'].map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                        <select
                           value={tone}
                           onChange={(e) => setTone(e.target.value)}
                           className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        >
                          {['Encouraging', 'Informative', 'Serious', 'Collaborative'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Key Themes (comma separated)
                        </label>
                        <textarea
                          required
                          value={criteria}
                          onChange={(e) => setCriteria(e.target.value)}
                          placeholder="e.g., declining quiz scores, missing homework, lacks participation"
                          rows={4}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Generating Engine Output...
                      </>
                    ) : (
                      <>
                        <Send className="-ml-1 mr-2 h-4 w-4" />
                        Generate {activeTool === 'rubric' ? 'Rubric' : activeTool === 'lesson' ? 'Lesson Plan' : 'Email Draft'}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
