import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Info, Filter, Download, Globe, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { fetchPolicyIndex } from '../logic/policyService';
import type { PolicyIndexEntry } from '../logic/types';

const Analytics = () => {
  const [countries, setCountries] = useState<PolicyIndexEntry[]>([]);

  useEffect(() => {
    fetchPolicyIndex().then(data => {
      setCountries(data);
    });
  }, []);

  const globalStats = [
    { label: 'Global PM2.5 Avg', value: '28.4', unit: 'µg/m³', trend: -2.4, status: 'improving', color: 'text-primary' },
    { label: 'Active Matrix Nodes', value: '12,482', unit: 'Units', trend: 156, status: 'growing', color: 'text-emerald-500' },
    { label: 'Intelligence Coverage', value: '64.2%', unit: 'Pop.', trend: 5.1, status: 'improving', color: 'text-orange-500' },
  ];

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-8 space-y-16">
      <Helmet>
        <title>Analytics | AirLens Global Matrix</title>
        <meta name="description" content="Real-time global trends and comparative policy effectiveness across 66 countries." />
      </Helmet>
      
      <header className="space-y-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 bg-bg-card backdrop-blur-xl px-5 py-2 rounded-full border border-white/20 shadow-xl"
          >
            <BarChart3 className="text-primary" size={14} />
            <span className="text-label">Global Matrix v1.1</span>
          </motion.div>
          <h1 className="heading-xl">
            Atmospheric <br/><span className="text-primary italic font-serif font-light">Intelligence</span>
          </h1>
        </div>
        <div className="max-w-md space-y-4">
           <div className="h-1 w-20 bg-primary mx-auto md:ml-0 rounded-full"></div>
           <p className="text-p italic">
            "Fusing causal inference with real-time sensing to reveal the Pure State of our planet's atmosphere across 66 regional nodes."
           </p>
        </div>
      </header>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {globalStats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="narrative-card group bg-bg-card backdrop-blur-3xl border-white/20 shadow-2xl !p-12 relative overflow-hidden"
          >
            <div className={`absolute -top-10 -right-10 w-40 h-40 bg-bg-base rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000`}></div>
            
            <p className="text-label !text-text-dim mb-4 flex items-center gap-2">
               <span className={`w-1.5 h-1.5 rounded-full ${stat.color} animate-pulse`}></span>
               {stat.label}
            </p>
            <div className="flex items-baseline gap-3 relative z-10">
              <h2 className="heading-xl">{stat.value}</h2>
              <span className="text-label !text-text-dim">{stat.unit}</span>
            </div>
            <div className="mt-8 flex items-center gap-3 relative z-10">
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${stat.trend < 0 || stat.status === 'improving' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-text-main shadow-primary/20'}`}>
                {stat.trend > 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                {Math.abs(stat.trend)}% {stat.status === 'improving' ? 'Gain' : 'Drift'}
              </div>
              <span className="text-label !text-text-dim/40 leading-none">Seasonal Adjust</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Ranking Table */}
        <div className="lg:col-span-8 space-y-8">
          <div className="narrative-card bg-bg-card backdrop-blur-3xl border-white/20 shadow-2xl !p-0 overflow-hidden !rounded-[56px]">
            <div className="p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                 <h3 className="heading-lg flex items-center gap-4">
                  <TrendingUp className="text-primary" size={28} /> Policy Effectiveness Ranking
                </h3>
                <p className="text-label !text-text-dim ml-11">Cross-Border Benchmark Matrix</p>
              </div>
              <div className="flex gap-3 ml-11 sm:ml-0">
                <button className="p-3 bg-bg-card text-text-main rounded-2xl hover:bg-primary hover:text-text-main transition-all border border-border-subtle shadow-inner"><Filter size={20} /></button>
                <button className="p-3 bg-bg-card text-text-main rounded-2xl hover:bg-primary hover:text-text-main transition-all border border-border-subtle shadow-inner"><Download size={20} /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-bg-base text-label !text-text-dim">
                    <th className="px-10 py-6">Index</th>
                    <th className="px-10 py-6">Node / Region</th>
                    <th className="px-10 py-6">Score</th>
                    <th className="px-10 py-6">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {countries.slice(0, 8).map((c, i) => (
                    <tr key={c.countryCode} className="hover:bg-primary/10 transition-colors group cursor-pointer">
                      <td className="px-10 py-8 text-p !text-text-dim group-hover:text-primary">#{(i + 1).toString().padStart(2, '0')}</td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{c.flag}</span>
                          <div>
                            <p className="text-p !text-text-main !font-black !text-lg leading-tight tracking-tight group-hover:text-primary transition-colors">{c.country}</p>
                            <p className="text-label !text-text-dim/60 font-black">{c.region}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6 min-w-[180px]">
                          <div className="flex-1 h-2 bg-bg-base rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${85 - i * 4}%` }}
                              transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                              className="h-full bg-primary shadow-[0_0_12px_rgba(37,226,244,0.5)] rounded-full"
                            />
                          </div>
                          <span className="text-p !text-text-main font-black">{85 - i * 4}.2</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2.5 text-primary">
                          <ShieldCheck size={16} className="animate-pulse" />
                          <span className="text-label">Verified</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-bg-base text-center">
               <button className="text-label !text-text-dim hover:text-primary transition-colors">Expand Full Registry Matrix</button>
            </div>
          </div>
        </div>

        {/* Sidebar Info Area */}
        <div className="lg:col-span-4 space-y-10">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-earth-brown text-white p-12 rounded-[56px] shadow-2xl space-y-10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000"><AlertTriangle size={140} /></div>
            
            <div className="flex items-center gap-4 text-primary font-sans font-black text-[10px] uppercase tracking-[0.4em]">
               <Info size={20}/> Methodology Note
            </div>
            
            <div className="space-y-6">
              <h4 className="text-3xl font-black tracking-tighter leading-none">Synthetic Benchmarking</h4>
              <p className="text-lg text-white/50 leading-relaxed font-serif italic pr-4">
                "Effectiveness scores are normalized using SDID weights across a control pool of 480 regional nodes, accounting for seasonal volatility."
              </p>
            </div>

            <div className="h-px bg-white/10 w-full"></div>
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:bg-white/10 transition-colors"><TrendingUp size={28}/></div>
               <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] block text-white">Engine: SDID-V4.1</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Causal Attribution Active</span>
               </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="narrative-card bg-bg-card backdrop-blur-3xl border-white/20 p-12 !rounded-[56px] space-y-8 shadow-2xl relative overflow-hidden"
          >
             <div className="flex items-center justify-between pb-4">
                <h4 className="text-label !text-text-dim">Regional High-Performers</h4>
                <Globe size={16} className="text-primary opacity-40"/>
             </div>
             <div className="space-y-6">
               {[
                 { region: 'Northern Europe', score: 92.4, trend: 1.2, color: 'bg-primary' },
                 { region: 'East Asia', score: 78.1, trend: 4.5, color: 'bg-emerald-500' },
                 { region: 'North America', score: 81.6, trend: -0.8, color: 'bg-orange-500' }
               ].map((r, i) => (
                 <div key={i} className="flex items-center justify-between p-6 bg-bg-card rounded-[32px] border border-border-subtle shadow-sm group hover:border-primary/30 transition-all duration-500">
                   <div className="space-y-1">
                     <p className="text-p !text-text-main font-black tracking-tight">{r.region}</p>
                     <p className="text-label !text-text-dim/60 font-black">Matrix Index Score</p>
                   </div>
                   <div className="text-right flex flex-col items-end">
                     <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${r.color}`}></div>
                        <p className="heading-lg !text-xl">{r.score}</p>
                     </div>
                     <div className={`flex items-center gap-1 text-label !text-text-dim/40 !tracking-tighter mt-1 ${r.trend > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                       {r.trend > 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                       {Math.abs(r.trend)}%
                     </div>
                   </div>
                 </div>
               ))}
             </div>
             <div className="pt-4 flex items-center justify-center gap-3">
                <Zap size={14} className="text-primary animate-pulse"/>
                <p className="text-label !text-text-dim/40 text-center">Decentralized Sensing Active</p>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
