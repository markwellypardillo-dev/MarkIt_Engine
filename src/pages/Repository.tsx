import React, { useState } from 'react';
import { Library, Star, Download, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

const mockResources = [
  { id: 1, title: 'Introduction to Algebra', subject: 'Mathematics', grade: '8th Grade', author: 'Sarah Williams', rating: 4.8, downloads: 124 },
  { id: 2, title: 'Cellular Biology Basics', subject: 'Science', grade: '9th Grade', author: 'Dr. John Doe', rating: 4.9, downloads: 312 },
  { id: 3, title: 'The Cold War Timeline', subject: 'History', grade: '11th Grade', author: 'Alex Johnson', rating: 4.5, downloads: 89 },
  { id: 4, title: 'Poetry Analysis: Robert Frost', subject: 'English literature', grade: '10th Grade', author: 'Emily Stanton', rating: 4.7, downloads: 156 },
  { id: 5, title: 'Newtonian Physics Lab', subject: 'Physics', grade: '12th Grade', author: 'Mark Peterson', rating: 4.6, downloads: 210 }
];

export default function Repository() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subjects = ['All', ...new Set(mockResources.map(r => r.subject))];

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || resource.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Library className="h-6 w-6 text-orange-500 mr-2" />
          Resource & Lesson Repository
        </h2>
        <p className="mt-2 text-slate-500">Discover, rate, and share teaching materials across the institution.</p>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search lesson plans, rubrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white w-full"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject / Grade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Author</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{resource.title}</div>
                    <div className="text-sm text-slate-500">{resource.downloads} downloads</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{resource.subject}</div>
                    <div className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {resource.grade}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{resource.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1.5" />
                      <span className="text-sm font-medium text-slate-900">{resource.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-orange-600 hover:text-orange-900 inline-flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Save
                    </button>
                  </td>
                </tr>
              ))}
              {filteredResources.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No resources found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
