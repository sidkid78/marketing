import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Eye, MousePointerClick, Repeat } from 'lucide-react';
import { Metric } from '../types';

const data = [
  { name: 'Mon', impressions: 4000, engagement: 240, clicks: 80 },
  { name: 'Tue', impressions: 3000, engagement: 139, clicks: 50 },
  { name: 'Wed', impressions: 2000, engagement: 980, clicks: 200 },
  { name: 'Thu', impressions: 2780, engagement: 390, clicks: 120 },
  { name: 'Fri', impressions: 1890, engagement: 480, clicks: 90 },
  { name: 'Sat', impressions: 2390, engagement: 380, clicks: 110 },
  { name: 'Sun', impressions: 3490, engagement: 430, clicks: 130 },
];

const mockMetrics: Metric[] = [
  { name: 'Total Impressions', value: '24.5K', change: 12.5, trend: 'up' },
  { name: 'Engagement Rate', value: '4.2%', change: 0.8, trend: 'up' },
  { name: 'Link Clicks', value: '1,203', change: -2.4, trend: 'down' },
  { name: 'Austin Followers', value: '856', change: 5.1, trend: 'up' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 text-sm font-medium">{metric.name}</h3>
              {index === 0 ? <Eye size={18} className="text-blue-500" /> :
               index === 1 ? <Repeat size={18} className="text-purple-500" /> :
               index === 2 ? <MousePointerClick size={18} className="text-green-500" /> :
               <Users size={18} className="text-orange-500" />}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-800">{metric.value}</span>
              <div className={`flex items-center text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                {Math.abs(metric.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Reach & Engagement Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="impressions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorImp)" />
                <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Interaction Types</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Legend />
                <Bar dataKey="engagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Likes/Replies" />
                <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} name="Link Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h4 className="font-bold text-blue-900 mb-2">Campaign Insight</h4>
        <p className="text-blue-800 text-sm">
          Retweets are up 15% following the "Preventative Home Safety" thread on Wednesday. 
          Focus on statistics-heavy content for next week's push in the Austin area.
        </p>
      </div>
    </div>
  );
};
