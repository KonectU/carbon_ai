"use client";

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

type AIAnalysisSectionProps = {
  summary: string;
  detailedAnalysis: string;
  metrics: {
    pageWeightKB: number;
    domNodes: number;
    jsExecutionMs: number;
  };
  energy_kWh: number;
  carbon_kg: number;
};

export default function AIAnalysisSection({
  summary,
  detailedAnalysis,
  metrics,
  energy_kWh,
  carbon_kg,
}: AIAnalysisSectionProps) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // Performance score calculation (0-100)
  const calculateScore = (value: number, threshold: number, inverse: boolean = false) => {
    const ratio = value / threshold;
    const score = inverse ? Math.max(0, 100 - ratio * 100) : Math.min(100, ratio * 100);
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  // Performance radar data
  const performanceData = [
    {
      metric: 'Page Weight',
      score: calculateScore(metrics.pageWeightKB, 5000, true), // Lower is better
      fullMark: 100,
    },
    {
      metric: 'DOM Complexity',
      score: calculateScore(metrics.domNodes, 10000, true), // Lower is better
      fullMark: 100,
    },
    {
      metric: 'JS Performance',
      score: calculateScore(metrics.jsExecutionMs, 20000, true), // Lower is better
      fullMark: 100,
    },
    {
      metric: 'Energy Efficiency',
      score: calculateScore(energy_kWh, 0.01, true), // Lower is better
      fullMark: 100,
    },
    {
      metric: 'Carbon Footprint',
      score: calculateScore(carbon_kg, 0.005, true), // Lower is better
      fullMark: 100,
    },
  ];

  // Overall performance score
  const overallScore = Math.round(
    performanceData.reduce((sum, item) => sum + item.score, 0) / performanceData.length
  );

  // Performance grade
  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 75) return { grade: 'B', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(overallScore);

  // Impact timeline data
  const impactData = [
    { time: 'Current', carbon: carbon_kg, energy: energy_kWh },
    { time: 'After 25% Opt', carbon: carbon_kg * 0.75, energy: energy_kWh * 0.75 },
    { time: 'After 50% Opt', carbon: carbon_kg * 0.5, energy: energy_kWh * 0.5 },
    { time: 'After 75% Opt', carbon: carbon_kg * 0.25, energy: energy_kWh * 0.25 },
  ];

  // Key insights extraction
  const extractKeyPoints = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 4).map(s => s.trim());
  };

  const keyPoints = extractKeyPoints(detailedAnalysis);

  return (
    <section className="mt-10 space-y-6">
      {/* Header with Score */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-600 p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-emerald-900">AI-Generated Performance Analysis</h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-800">{summary}</p>
            </div>
          </div>
          <div className={`flex flex-col items-center rounded-xl ${gradeInfo.bg} px-6 py-4`}>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">Grade</span>
            <span className={`text-4xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
            <span className="text-sm font-semibold text-zinc-700">{overallScore}/100</span>
          </div>
        </div>
      </div>

      {/* Performance Radar Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-zinc-900">Performance Radar</h3>
          <p className="mt-1 text-sm text-zinc-600">Multi-dimensional performance assessment</p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Performance Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            {performanceData.map((item) => (
              <div key={item.metric} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
                <span className="font-medium text-zinc-700">{item.metric}</span>
                <span className={`font-bold ${item.score >= 70 ? 'text-emerald-600' : item.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Impact Timeline */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-zinc-900">Optimization Impact Projection</h3>
          <p className="mt-1 text-sm text-zinc-600">Projected carbon reduction over time</p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number | undefined) => value?.toFixed(6) ?? '0'}
                />
                <Area type="monotone" dataKey="carbon" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Carbon (kg)" />
                <Area type="monotone" dataKey="energy" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} name="Energy (kWh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-zinc-600">Carbon Emissions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-zinc-600">Energy Usage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-zinc-900">Key Insights from AI Analysis</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {keyPoints.map((point, index) => (
            <div key={index} className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                {index + 1}
              </div>
              <p className="text-sm leading-relaxed text-zinc-700">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis - Expandable */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">Detailed Technical Analysis</h3>
          <button
            onClick={() => setShowFullAnalysis(!showFullAnalysis)}
            className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200"
          >
            {showFullAnalysis ? 'Show Less' : 'Read Full Analysis'}
            <svg
              className={`h-4 w-4 transition-transform ${showFullAnalysis ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className={`mt-4 overflow-hidden transition-all ${showFullAnalysis ? 'max-h-[2000px]' : 'max-h-32'}`}>
          <div className="prose prose-sm max-w-none text-zinc-700">
            {detailedAnalysis.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        {!showFullAnalysis && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {/* Action Items */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-600 p-2">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900">Next Steps</h3>
            <p className="mt-2 text-sm text-blue-800">
              Based on this AI analysis, review the optimization recommendations below to reduce your carbon footprint and improve performance.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700">Priority: High Impact</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700">Focus: Quick Wins</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700">Goal: 50% Reduction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
