"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

type ChartsProps = {
  pageWeightKB: number;
  domNodes: number;
  jsExecutionMs: number;
  energy_kWh: number;
  carbon_kg: number;
  recommendations: Array<{
    title: string;
    estimatedReductionPercent: number;
    effort: "low" | "medium" | "high";
  }>;
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardCharts({
  pageWeightKB,
  domNodes,
  jsExecutionMs,
  energy_kWh,
  carbon_kg,
  recommendations,
}: ChartsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    energy: 0,
    carbon: 0,
    pageWeight: 0,
    domNodes: 0,
    jsTime: 0,
  });

  const [hoveredChart, setHoveredChart] = useState<string | null>(null);

  // Animate numbers on mount
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedValues({
        energy: energy_kWh * easeOutQuart,
        carbon: carbon_kg * easeOutQuart,
        pageWeight: pageWeightKB * easeOutQuart,
        domNodes: domNodes * easeOutQuart,
        jsTime: jsExecutionMs * easeOutQuart,
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [energy_kWh, carbon_kg, pageWeightKB, domNodes, jsExecutionMs]);
  
  // Energy breakdown pie chart data - using real website metrics
  const totalPageWeight = pageWeightKB || 1;
  const totalJsTime = jsExecutionMs || 1;
  const totalDomNodes = domNodes || 1;
  
  // Calculate actual percentages based on energy impact
  const networkImpact = (totalPageWeight / 1024) * 0.0002; // KB to MB, energy factor
  const jsImpact = (totalJsTime / 1000) * 0.00002; // ms to seconds, energy factor
  const domImpact = (totalDomNodes / 1000) * 0.000005; // nodes, energy factor
  
  const totalImpact = networkImpact + jsImpact + domImpact;
  
  const energyBreakdown = [
    { 
      name: 'Network Transfer', 
      value: Math.round(networkImpact * 1000000),
      percentage: ((networkImpact / totalImpact) * 100).toFixed(1),
      actualValue: `${totalPageWeight.toFixed(0)} KB`
    },
    { 
      name: 'JavaScript Execution', 
      value: Math.round(jsImpact * 1000000),
      percentage: ((jsImpact / totalImpact) * 100).toFixed(1),
      actualValue: `${totalJsTime.toFixed(0)} ms`
    },
    { 
      name: 'DOM Rendering', 
      value: Math.round(domImpact * 1000000),
      percentage: ((domImpact / totalImpact) * 100).toFixed(1),
      actualValue: `${totalDomNodes.toFixed(0)} nodes`
    },
  ];

  // Recommendations bar chart data
  const recommendationsData = recommendations.slice(0, 5).map(rec => {
    // Shorten the title intelligently
    let shortName = rec.title;
    if (rec.title.length > 25) {
      // Try to break at word boundary
      const words = rec.title.split(' ');
      shortName = '';
      for (const word of words) {
        if ((shortName + word).length > 22) break;
        shortName += (shortName ? ' ' : '') + word;
      }
      shortName += '...';
    }
    
    return {
      name: shortName,
      fullName: rec.title,
      reduction: rec.estimatedReductionPercent,
      effort: rec.effort,
    };
  });

  // Metrics comparison data
  const metricsData = [
    { name: 'Page Weight', value: pageWeightKB, unit: 'KB', color: '#3b82f6', icon: '📦' },
    { name: 'DOM Nodes', value: domNodes, unit: 'nodes', color: '#10b981', icon: '🌳' },
    { name: 'JS Time', value: jsExecutionMs, unit: 'ms', color: '#f59e0b', icon: '⚡' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="max-w-xs rounded-xl border-2 border-zinc-200 bg-white p-4 shadow-2xl backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200">
          <p className="text-sm font-bold text-zinc-900 break-words">
            {data.fullName || data.name}
          </p>
          {data.actualValue && (
            <p className="mt-2 text-base font-semibold text-emerald-600">
              {data.actualValue}
            </p>
          )}
          {data.percentage && (
            <p className="mt-1 text-lg font-bold text-emerald-700">
              {data.percentage}% of total energy
            </p>
          )}
          {data.reduction && (
            <p className="mt-1 text-lg font-semibold text-emerald-600">
              {data.reduction}% reduction potential
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-10 space-y-8">
      {/* Energy Breakdown Pie Chart */}
      <section 
        className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-6 shadow-sm hover:shadow-md transition-all duration-300"
        onMouseEnter={() => setHoveredChart('energy')}
        onMouseLeave={() => setHoveredChart(null)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">⚡ Energy Consumption Breakdown</h2>
            <p className="mt-2 text-sm text-zinc-600">Distribution of energy usage across different components</p>
          </div>
          <div className={`transition-transform duration-300 ${hoveredChart === 'energy' ? 'scale-110' : 'scale-100'}`}>
            <div className="rounded-full bg-emerald-100 p-3">
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center">
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={energyBreakdown}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: '#71717a',
                  strokeWidth: 2,
                }}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const RADIAN = Math.PI / 180;
                  const safeMidAngle = midAngle ?? 0;
                  const safePercent = percent ?? 0;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-safeMidAngle * RADIAN);
                  const y = cy + radius * Math.sin(-safeMidAngle * RADIAN);
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill="white" 
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      className="font-bold text-sm"
                      style={{ fontSize: '16px', fontWeight: 'bold' }}
                    >
                      {`${(safePercent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius={110}
                innerRadius={65}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
                paddingAngle={3}
              >
                {energyBreakdown.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-90 transition-opacity cursor-pointer"
                    strokeWidth={2}
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-3 gap-6 w-full">
            {energyBreakdown.map((item, index) => (
              <div 
                key={item.name} 
                className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white border-2 border-zinc-100 hover:border-zinc-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              >
                <div className="h-5 w-5 rounded-full shadow-md" style={{ backgroundColor: COLORS[index] }} />
                <p className="text-sm font-bold text-zinc-800 text-center leading-tight">{item.name}</p>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: COLORS[index] }}>{item.percentage}%</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-600">{item.actualValue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Optimization Potential Bar Chart */}
      <section 
        className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-sm hover:shadow-md transition-all duration-300"
        onMouseEnter={() => setHoveredChart('optimization')}
        onMouseLeave={() => setHoveredChart(null)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">📊 Optimization Potential</h2>
            <p className="mt-2 text-sm text-zinc-600">Estimated carbon reduction by implementing recommendations</p>
          </div>
          <div className={`transition-transform duration-300 ${hoveredChart === 'optimization' ? 'scale-110' : 'scale-100'}`}>
            <div className="rounded-full bg-blue-100 p-3">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={recommendationsData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="horizontal"
            >
              <defs>
                <linearGradient id="colorReduction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                type="number"
                tick={{ fontSize: 13, fill: '#52525b', fontWeight: 500 }}
                label={{ value: 'Reduction %', position: 'insideBottom', offset: -5, style: { fontSize: 13, fill: '#52525b', fontWeight: 600 } }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 12, fill: '#52525b', fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
              <Bar 
                dataKey="reduction" 
                fill="url(#colorReduction)" 
                radius={[0, 12, 12, 0]}
                animationBegin={200}
                animationDuration={1000}
                animationEasing="ease-out"
                label={{ position: 'right', fill: '#10b981', fontSize: 13, fontWeight: 600 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex items-center justify-center gap-8 text-sm bg-white rounded-xl p-4 border border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-sm" />
            <span className="font-medium text-zinc-700">Low Effort</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-blue-500 shadow-sm" />
            <span className="font-medium text-zinc-700">Medium Effort</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-orange-500 shadow-sm" />
            <span className="font-medium text-zinc-700">High Effort</span>
          </div>
        </div>
      </section>

      {/* Performance Metrics Comparison */}
      <section 
        className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm hover:shadow-md transition-all duration-300"
        onMouseEnter={() => setHoveredChart('metrics')}
        onMouseLeave={() => setHoveredChart(null)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">🎯 Performance Metrics Overview</h2>
            <p className="mt-2 text-sm text-zinc-600">Key performance indicators for your website</p>
          </div>
          <div className={`transition-transform duration-300 ${hoveredChart === 'metrics' ? 'scale-110' : 'scale-100'}`}>
            <div className="rounded-full bg-purple-100 p-3">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {metricsData.map((metric, index) => (
            <div 
              key={metric.name} 
              className="group rounded-2xl border border-zinc-100 bg-white p-6 hover:border-zinc-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{metric.icon}</span>
                    <p className="text-xs uppercase tracking-wider font-bold text-zinc-500">{metric.name}</p>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-zinc-900 transition-all duration-300 group-hover:scale-110">
                    {metric.name === 'Page Weight' 
                      ? animatedValues.pageWeight.toFixed(0)
                      : metric.name === 'DOM Nodes'
                      ? animatedValues.domNodes.toFixed(0)
                      : animatedValues.jsTime.toFixed(0)
                    }
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-500">{metric.unit}</p>
                </div>
                <div 
                  className="h-20 w-20 rounded-2xl opacity-10 group-hover:opacity-20 transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: metric.color }}
                />
              </div>
              <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                  style={{ 
                    width: `${Math.min((metric.value / (metric.name === 'Page Weight' ? 5000 : metric.name === 'DOM Nodes' ? 10000 : 20000)) * 100, 100)}%`,
                    backgroundColor: metric.color 
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500 text-center">
                {Math.min((metric.value / (metric.name === 'Page Weight' ? 5000 : metric.name === 'DOM Nodes' ? 10000 : 20000)) * 100, 100).toFixed(1)}% of benchmark
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Carbon Impact Visualization */}
      <section 
        className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
        onMouseEnter={() => setHoveredChart('carbon')}
        onMouseLeave={() => setHoveredChart(null)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 tracking-tight">🌍 Environmental Impact</h2>
            <p className="mt-2 text-base text-emerald-700 font-medium">Your website's carbon footprint in perspective</p>
          </div>
          <div className={`transition-transform duration-300 ${hoveredChart === 'carbon' ? 'scale-110 rotate-12' : 'scale-100'}`}>
            <div className="rounded-full bg-emerald-200 p-4 shadow-md">
              <svg className="h-10 w-10 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 shadow-sm">
                <svg className="h-8 w-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-700 uppercase tracking-wide">Energy Usage</p>
                <p className="mt-2 text-3xl font-black text-emerald-600">
                  {animatedValues.energy.toFixed(6)}
                </p>
                <p className="text-sm font-semibold text-zinc-500">kWh per month</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-green-100 to-green-200 p-4 shadow-sm">
                <svg className="h-8 w-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-700 uppercase tracking-wide">Carbon Emissions</p>
                <p className="mt-2 text-3xl font-black text-green-600">
                  {animatedValues.carbon.toFixed(6)}
                </p>
                <p className="text-sm font-semibold text-zinc-500">kg CO₂ per month</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-md">
          <p className="text-base font-bold text-zinc-800 mb-4">🌱 Equivalent to:</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:shadow-md transition-all duration-200">
              <span className="text-4xl">🚗</span>
              <div>
                <p className="text-xl font-bold text-blue-900">{(carbon_kg * 2.2).toFixed(2)}</p>
                <p className="text-xs font-semibold text-blue-700">miles driven by car</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:shadow-md transition-all duration-200">
              <span className="text-4xl">🌳</span>
              <div>
                <p className="text-xl font-bold text-green-900">{(carbon_kg * 0.05).toFixed(2)}</p>
                <p className="text-xs font-semibold text-green-700">trees needed to offset</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 hover:shadow-md transition-all duration-200">
              <span className="text-4xl">💡</span>
              <div>
                <p className="text-xl font-bold text-amber-900">{(energy_kWh * 12).toFixed(0)}</p>
                <p className="text-xs font-semibold text-amber-700">hours of LED bulb usage</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
