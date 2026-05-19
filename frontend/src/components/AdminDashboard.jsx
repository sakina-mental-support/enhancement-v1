import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { 
    LucideActivity, LucideShieldAlert, LucideBrain, LucideBarChart3, 
    LucideTrendingUp, LucideAlertCircle, LucideLayers, LucideDatabase 
} from 'lucide-react';
import Badge from './Badge';

const API_BASE = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('sakina_token');
                const res = await axios.get(`${API_BASE}/events/analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) return (
        <div className="min-h-screen bg-[#091426] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#00adef] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#091426] text-white p-8 sm:p-16 font-['Inter'] overflow-x-hidden">
            
            {/* 🚀 MISSION CONTROL HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
                <div className="space-y-4">
                    <Badge variant="solid" color="teal" size="sm" className="tracking-[10px] uppercase !bg-[#00adef]/10 !text-[#00adef]">Emotional Intelligence v8.5</Badge>
                    <h1 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase leading-none">
                        Mission <br />
                        <span className="text-[#00adef] italic">Control.</span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                        <p className="text-[10px] font-black uppercase tracking-[4px] text-white/40 mb-2">System Pulse</p>
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-[#00adef] rounded-full animate-pulse shadow-[0_0_15px_#00adef]"></div>
                            <span className="text-2xl font-black">STABLE</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 📊 CORE STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <StatCard icon={<LucideActivity />} title="Total Emotional Events" value={data?.summary?.totalEvents || 0} color="#00adef" />
                <StatCard icon={<LucideShieldAlert />} title="Panic Responses" value={data?.summary?.panicEvents || 0} color="#f43f5e" />
                <StatCard icon={<LucideAlertCircle />} title="High Risk Flags" value={data?.summary?.highRiskFlags || 0} color="#fbbf24" />
                <StatCard icon={<LucideBrain />} title="AI Neural Sync" value="98.4%" color="#6366f1" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 📉 STRESS TRENDS (Line Chart) */}
                <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[48px] p-10 sm:p-14 backdrop-blur-3xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LucideTrendingUp size={120} />
                    </div>
                    <div className="relative z-10 space-y-10">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Global Stress Distribution</h3>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data?.stressTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="_id" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#091426', border: '1px solid #ffffff10', borderRadius: '20px' }}
                                        itemStyle={{ color: '#00adef' }}
                                    />
                                    <Line type="monotone" dataKey="avgStress" stroke="#00adef" strokeWidth={4} dot={{ r: 6, fill: '#00adef' }} activeDot={{ r: 10 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 🍰 EVENT DISTRIBUTION (Pie Chart) */}
                <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[48px] p-10 sm:p-14 backdrop-blur-3xl">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-10">Neural Event Type</h3>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {data?.distribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     contentStyle={{ backgroundColor: '#091426', border: '1px solid #ffffff10', borderRadius: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-10 space-y-4">
                        {data?.distribution?.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="text-white/60 uppercase font-black">{item._id.replace(/_/g, ' ')}</span>
                                </div>
                                <span className="font-black">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 🚀 CMS & MANAGEMENT PREVIEW */}
            <footer className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#00adef]/10 border border-[#00adef]/20 rounded-[40px] p-10 flex items-center justify-between group cursor-pointer hover:bg-[#00adef]/20 transition-all">
                    <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase tracking-tight">Recovery Journey CMS</h4>
                        <p className="text-sm text-[#00adef]/70 font-medium">Create and deploy new emotional paths instantly.</p>
                    </div>
                    <div className="w-16 h-16 bg-[#00adef] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <LucideLayers size={24} />
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                    <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase tracking-tight">AI Memory Explorer</h4>
                        <p className="text-sm text-white/40 font-medium">Audit the deep emotional memories of your OS.</p>
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <LucideDatabase size={24} />
                    </div>
                </div>
            </footer>

        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <motion.div 
        whileHover={{ y: -10 }}
        className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-2xl relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity" style={{ color }}>
            {icon}
        </div>
        <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[4px] text-white/40">{title}</p>
            <h4 className="text-5xl font-black tracking-tighter" style={{ color }}>{value}</h4>
        </div>
    </motion.div>
);

const COLORS = ['#00adef', '#6366f1', '#f43f5e', '#fbbf24', '#0ea5e9', '#ec4899'];

export default AdminDashboard;
