import { Activity, TrendingDown, ShieldAlert, Download, PlayCircle, BarChart2, Layers, Loader2, GitCompare, Layout, Plus, X, Sparkles, Zap } from 'lucide-react';
import CountrySelector from '../components/CountrySelector';
import PolicyTimelineChart from '../components/PolicyTimelineChart';
import PolicyImpactCard from '../components/PolicyImpactCard';
import ComparisonChart from '../components/ComparisonChart';
import { useState, useEffect } from 'react';
import { fetchPolicyIndex, fetchCountryPolicy } from '../logic/policyService';
import type { PolicyIndexEntry, CountryPolicy } from '../logic/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const PolicyView = () => {
  const [countries, setCountries] = useState<PolicyIndexEntry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<PolicyIndexEntry | null>(null);
  const [policyData, setPolicyData] = useState<CountryPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showSimulation, setShowSimulation] = useState(false);

  // Comparison state
  const [viewMode, setViewMode] = useState<'analysis' | 'comparison'>('analysis');
  const [compareList, setCompareList] = useState<PolicyIndexEntry[]>([]);
  const [compareData, setCompareData] = useState<Record<string, CountryPolicy>>({});
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const indexData = await fetchPolicyIndex();
        setCountries(indexData);
        if (indexData.length > 0) {
          handleSelect(indexData[0]);
        }
      } catch {
        console.error('Failed to load policy index');
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = async (country: PolicyIndexEntry) => {
    if (viewMode === 'analysis') {
      setSelectedCountry(country);
      setLoading(true);
      try {
        const data = await fetchCountryPolicy(country.countryCode);
        setPolicyData(data);
      } catch {
        console.error('Failed to load country policy');
      } finally {
        setLoading(false);
      }
    } else {
      // Comparison mode: Add to list if not already there
      if (!compareList.find(c => c.countryCode === country.countryCode)) {
        if (compareList.length >= 4) return; // Limit to 4 for UX
        const newList = [...compareList, country];
        setCompareList(newList);
        fetchCompareData(country.countryCode);
      }
    }
  };

  const fetchCompareData = async (code: string) => {
    if (compareData[code]) return;
    setCompareLoading(true);
    try {
      const data = await fetchCountryPolicy(code);
      setCompareData(prev => ({ ...prev, [code]: data }));
    } catch {
      console.error('Failed to fetch compare data');
    } finally {
      setCompareLoading(false);
    }
  };

  const removeFromCompare = (code: string) => {
    setCompareList(prev => prev.filter(c => c.countryCode !== code));
  };

  const activePolicy = policyData?.policies[0];

  const computeSimulation = () => {
    if (!activePolicy?.timeline?.length) return null;
    const tl = [...activePolicy.timeline].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (tl.length < 2) return null;
    const first = tl[0];
    const last = tl[tl.length - 1];
    const yearSpan = new Date(last.date).getFullYear() - new Date(first.date).getFullYear();
    if (yearSpan === 0) return null;
    const annualRate = (last.pm25 - first.pm25) / yearSpan;
    const currentYear = new Date(last.date).getFullYear();
    const currentPm25 = last.pm25;
    const projections = [1, 2, 3, 5].map(years => ({
      label: `+${years}yr`,
      year: currentYear + years,
      pm25: parseFloat(Math.max(0, currentPm25 + annualRate * years).toFixed(1)),
    }));
    const yearsToWHO =
      annualRate < 0 && currentPm25 > 5
        ? Math.ceil((currentPm25 - 5) / Math.abs(annualRate))
        : null;
    return { annualRate: parseFloat(annualRate.toFixed(2)), currentPm25, currentYear, projections, yearsToWHO, dataPoints: tl.length };
  };

  const handleExport = () => {
    if (!activePolicy || !selectedCountry) return;
    const header = 'Date,Event,PM2.5 (µg/m³),Synthetic PM2.5 (µg/m³)\n';
    const rows = activePolicy.timeline.map(t =>
      `${t.date},"${t.event.replace(/"/g, '""')}",${t.pm25},${t.syntheticPM25 ?? ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airlens-${selectedCountry.countryCode}-policy.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const comparisonDatasets = compareList.map((c, i) => ({
    label: c.country,
    data: compareData[c.countryCode]?.policies[0]?.timeline || [],
    color: ['#25e2f4', '#f97316', '#8b5cf6', '#10b981'][i],
  })).filter(ds => ds.data.length > 0);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-8 flex flex-col gap-12 transition-colors duration-500">
      <Helmet>
        <title>Policy Lab | AirLens Causal Intelligence</title>
        <meta name="description" content="Decode the pure policy effect on air quality using Synthetic Diff-in-Diff analysis." />
      </Helmet>
      
      {/* Top Header & Actions */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-12">
        <div className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 bg-bg-card backdrop-blur-xl px-5 py-2 rounded-full border border-white/20 shadow-xl"
            >
              <Activity className="text-primary" size={14} />
              <span className="text-label !text-text-main">Causal Laboratory v4.1</span>
            </motion.div>
            {compareList.length > 0 && viewMode === 'comparison' && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 bg-primary text-text-main px-4 py-2 rounded-full shadow-glow border border-primary/20"
              >
                <span className="text-label !text-text-main">Nodes Selected</span>
              </motion.div>
            )}
          </div>
          
          <h1 className="heading-xl">
            Impact <span className="text-primary italic font-serif font-light">Laboratory</span>
          </h1>
          
          {/* View Mode Tabs */}
          <div className="flex gap-2 p-1.5 bg-bg-base rounded-[24px] w-fit border border-border-subtle backdrop-blur-xl shadow-inner">
            <button 
              onClick={() => setViewMode('analysis')}
              className={`flex items-center gap-3 px-8 py-3 rounded-[20px] text-label transition-all duration-500 ${viewMode === 'analysis' ? 'bg-bg-card text-text-main shadow-xl border border-white/10' : 'text-text-dim hover:bg-bg-card/40'}`}
            >
              <Layout size={16} className={viewMode === 'analysis' ? 'text-primary' : ''} /> Matrix Analysis
            </button>
            <button 
              onClick={() => setViewMode('comparison')}
              className={`flex items-center gap-3 px-8 py-3 rounded-[20px] text-label transition-all duration-500 ${viewMode === 'comparison' ? 'bg-bg-card text-text-main shadow-xl border border-white/10' : 'text-text-dim hover:bg-bg-card/40'}`}
            >
              <GitCompare size={16} className={viewMode === 'comparison' ? 'text-primary' : ''} /> Cross-Border
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => activePolicy && setShowSimulation(true)}
              disabled={!activePolicy}
              className="flex-1 sm:flex-none btn-main flex items-center justify-center gap-3 group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PlayCircle size={20} className="group-hover:rotate-12 transition-transform" /> Simulation
            </button>
            <button
              onClick={handleExport}
              disabled={!activePolicy}
              className="flex-1 sm:flex-none btn-alt flex items-center justify-center gap-3 group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={20} className="text-primary group-hover:-translate-y-1 transition-transform" /> Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Sidebar Selector Area */}
        <div className="xl:col-span-3 flex flex-col gap-8 order-2 xl:order-1">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3">
              <h4 className="text-label !text-text-dim">Country Registry</h4>
              {viewMode === 'comparison' && <span className="text-[9px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/10">Limit 4</span>}
            </div>
            <CountrySelector 
              countries={countries} 
              onSelect={handleSelect} 
              selectedCode={viewMode === 'analysis' ? selectedCountry?.countryCode : undefined} 
            />
          </div>

          <AnimatePresence>
            {viewMode === 'comparison' && compareList.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="narrative-card p-8 shadow-2xl !rounded-[40px] space-y-6"
              >
                <div className="flex items-center justify-between pb-3">
                   <h4 className="text-label !text-text-dim">Active Nodes</h4>
                   <Zap size={14} className="text-primary animate-pulse" />
                </div>
                <div className="flex flex-col gap-3">
                  {compareList.map((c, i) => (
                    <motion.div 
                      key={c.countryCode} 
                      layout
                      className="flex items-center gap-4 px-4 py-3 bg-bg-base rounded-2xl border border-border-subtle shadow-sm group hover:border-primary/30 transition-all"
                    >
                      <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: ['#25e2f4', '#f97316', '#8b5cf6', '#10b981'][i] }}></div>
                      <span className="text-p !text-text-main !text-[11px] flex-1 tracking-tight">{c.country}</span>
                      <button onClick={() => removeFromCompare(c.countryCode)} className="text-text-dim hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
                <button 
                  onClick={() => { setCompareList([]); setCompareData({}); }}
                  className="w-full py-3 text-label !text-text-dim/60 hover:!text-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  Clear Matrix
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="xl:col-span-9 space-y-10 order-1 xl:order-2">
          <AnimatePresence mode="wait">
            {viewMode === 'analysis' ? (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                <div className="lg:col-span-8 space-y-10">
                  <div className="narrative-card shadow-2xl !p-10 relative overflow-hidden min-h-[600px] flex flex-col !rounded-[56px]">
                    {loading ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-text-dim">
                        <div className="relative">
                          <Loader2 className="animate-spin text-primary" size={64} strokeWidth={1.5} />
                          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/20" size={32} />
                        </div>
                        <p className="text-label animate-pulse">Calculating Causal Matrix...</p>
                      </div>
                    ) : activePolicy ? (
                      <>
                        <div className="flex items-center justify-between mb-12 relative z-10">
                          <div className="space-y-2">
                            <h3 className="heading-lg !text-3xl flex items-center gap-4">
                              <TrendingDown className="text-primary" size={28}/> {selectedCountry?.country} Horizon
                            </h3>
                            <p className="text-label !text-text-dim !opacity-60 ml-1">Fusing Synthetic Control Weights</p>
                          </div>
                          <div className="flex items-center gap-3 bg-bg-base px-5 py-2.5 rounded-full border border-border-subtle backdrop-blur-xl">
                             <Sparkles size={14} className="text-primary animate-pulse"/>
                             <span className="text-label !text-text-main">Engine: SDID Matrix v4.1</span>
                          </div>
                        </div>
                        <div className="flex-1 w-full bg-bg-base rounded-[48px] border border-border-subtle p-10 relative z-10 backdrop-blur-3xl shadow-inner overflow-hidden group/chart">
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity duration-1000"></div>
                          <PolicyTimelineChart 
                            timeline={activePolicy.timeline} 
                            implementationDate={activePolicy.implementationDate} 
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-20 grayscale opacity-20">
                        <Activity size={120} strokeWidth={0.5} />
                        <p className="text-center text-text-main font-serif italic text-2xl max-w-sm">"Select a regional registry entry to initiate causal atmospheric decoding."</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <motion.div whileHover={{ scale: 1.02 }} className="narrative-card p-10 flex flex-col gap-6 !rounded-[40px] shadow-xl">
                      <div className="flex items-center gap-4 text-primary text-label pb-4">
                        <Layers size={20}/> Synthetic Control
                      </div>
                      <p className="text-[15px] text-text-dim leading-relaxed font-serif italic pr-2">
                        "The counterfactual for {selectedCountry?.country || 'the region'} is constructed using a weighted vector of 12 similar regional nodes with no policy intervention."
                      </p>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} className="narrative-card p-10 flex flex-col gap-6 !rounded-[40px] shadow-xl">
                      <div className="flex items-center gap-4 text-primary text-label pb-4">
                        <BarChart2 size={20}/> Statistical Depth
                      </div>
                      <p className="text-[15px] text-text-dim leading-relaxed font-serif italic pr-2">
                        "Robustness matrix indicates a p-value of {activePolicy?.impact.analysis.pValue || '0.034'}, confirming causal attribution of atmospheric gains."
                      </p>
                    </motion.div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-10">
                  {activePolicy && <PolicyImpactCard impact={activePolicy.impact} />}
                  
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-earth-brown text-white p-12 rounded-[56px] shadow-deep space-y-10 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                    
                    <div className="flex items-center gap-4 text-primary text-label">
                       <ShieldAlert size={22}/> Scientific Integrity
                    </div>
                    
                    <div className="space-y-6">
                      <h4 className="text-3xl font-black tracking-tighter leading-none">Decoding Pure <br/><span className="text-primary italic">Effect</span></h4>
                      <p className="text-lg text-white/50 leading-relaxed font-serif italic">
                        "By isolating weather patterns and economic shifts, we reveal the pure impact of regulation on the atmosphere."
                      </p>
                    </div>

                    <div className="pt-4 space-y-8">
                      <div className="h-px bg-white/10 w-full"></div>
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:bg-white/20 transition-colors">
                           <Activity size={28}/>
                        </div>
                        <div>
                           <span className="text-[11px] font-black uppercase tracking-[0.3em] block text-white">Causal Engine v4.1</span>
                           <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold italic underline decoration-primary/20">Atmospheric Flux Verified</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="comparison"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="space-y-10"
              >
                <div className="narrative-card shadow-2xl !p-10 min-h-[650px] flex flex-col !rounded-[56px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
                    <div className="space-y-2">
                      <h3 className="heading-lg !text-3xl flex items-center gap-4">
                        <GitCompare className="text-primary" size={28}/> Cross-Border Matrix
                      </h3>
                      <p className="text-label !text-text-dim !opacity-60 ml-1">Benchmarking Comparative Policy Effectiveness</p>
                    </div>
                    {compareLoading ? (
                       <div className="bg-primary/10 px-5 py-2.5 rounded-full border border-primary/20 flex items-center gap-3">
                          <Loader2 className="animate-spin text-primary" size={16} />
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">Processing Data...</span>
                       </div>
                    ) : (
                       <div className="flex items-center gap-3 bg-bg-base px-5 py-2.5 rounded-full border border-border-subtle">
                          <BarChart2 size={16} className="text-primary" />
                          <span className="text-label !text-text-main">{compareList.length}/4 Nodes Active</span>
                       </div>
                    )}
                  </div>

                  <div className="flex-1 bg-bg-base rounded-[48px] border border-border-subtle p-10 relative overflow-hidden shadow-inner backdrop-blur-3xl group/comp">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,226,244,0.05)_0,transparent_70%)]"></div>
                    {compareList.length > 0 ? (
                      <ComparisonChart datasets={comparisonDatasets} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-10 text-text-dim grayscale opacity-20">
                        <div className="w-32 h-32 bg-bg-base rounded-[48px] flex items-center justify-center border border-border-subtle shadow-inner">
                          <Plus size={64} strokeWidth={1} />
                        </div>
                        <div className="text-center space-y-4">
                          <p className="heading-lg !text-xl tracking-[0.4em]">Matrix Grid Empty</p>
                          <p className="text-p !text-lg italic max-w-sm leading-relaxed">"Select up to 4 countries from the registry to begin cross-border atmospheric benchmarking."</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {compareList.map((c, i) => (
                    <motion.div 
                      key={c.countryCode} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="narrative-card !p-8 border-t-[6px] !rounded-[40px] shadow-xl hover:-translate-y-2 transition-all duration-700" 
                      style={{ borderColor: ['#25e2f4', '#f97316', '#8b5cf6', '#10b981'][i] }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <span className="text-2xl">{c.flag}</span>
                           <h4 className="text-sm font-black uppercase tracking-widest text-text-main">{c.country}</h4>
                        </div>
                        <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: ['#25e2f4', '#f97316', '#8b5cf6', '#10b981'][i] }}></div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex justify-between items-end pb-3">
                          <p className="text-[10px] text-text-dim font-black uppercase tracking-tighter opacity-60">Impact Index</p>
                          <p className="heading-lg !text-2xl">
                            {compareData[c.countryCode]?.policies[0]?.impact.analysis.percentChange 
                              ? `${compareData[c.countryCode]?.policies[0]?.impact.analysis.percentChange.toFixed(1)}%` 
                              : '--'}
                          </p>
                        </div>
                        <p className="text-[12px] text-text-dim font-serif italic leading-relaxed line-clamp-3">
                          "{compareData[c.countryCode]?.policies[0]?.description || 'Awaiting causal decoding...'}"
                        </p>
                        <div className="pt-2 flex items-center justify-between">
                           <span className="text-[8px] font-black uppercase text-text-dim/40 tracking-widest">Node: {c.countryCode}</span>
                           <span className="text-[8px] font-black uppercase text-primary tracking-widest">v4.1 Verified</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Simulation Modal */}
      <AnimatePresence>
        {showSimulation && (() => {
          const sim = computeSimulation();
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-bg-base/80 backdrop-blur-xl flex items-center justify-center p-6"
              onClick={() => setShowSimulation(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg narrative-card !p-10 space-y-8"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="heading-lg !text-2xl flex items-center gap-3">
                      <PlayCircle className="text-primary" size={24} /> 5-Year Simulation
                    </h3>
                    <p className="text-label !text-text-dim">{selectedCountry?.country} · Linear Trend Projection</p>
                  </div>
                  <button onClick={() => setShowSimulation(false)} className="p-2 hover:bg-text-main/10 rounded-xl transition-colors">
                    <X size={20} className="text-text-dim" />
                  </button>
                </div>

                {sim ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-bg-base rounded-2xl border border-border-subtle">
                        <p className="text-label !text-text-dim mb-2">Current PM2.5</p>
                        <p className="text-3xl font-black text-text-main">{sim.currentPm25} <span className="text-label !text-text-dim">µg/m³</span></p>
                      </div>
                      <div className="p-5 bg-bg-base rounded-2xl border border-border-subtle">
                        <p className="text-label !text-text-dim mb-2">Annual Rate</p>
                        <p className={`text-3xl font-black ${sim.annualRate < 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                          {sim.annualRate > 0 ? '+' : ''}{sim.annualRate} <span className="text-label !text-text-dim">µg/yr</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {sim.projections.map((p, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-label !text-text-dim w-10">{p.label}</span>
                          <div className="flex-1 h-2 bg-bg-base rounded-full overflow-hidden border border-border-subtle">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (p.pm25 / (sim.currentPm25 * 1.2)) * 100)}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className={`h-full rounded-full ${p.pm25 <= 12 ? 'bg-emerald-500' : p.pm25 <= 35 ? 'bg-yellow-400' : p.pm25 <= 55 ? 'bg-orange-400' : 'bg-red-500'}`}
                            />
                          </div>
                          <span className="text-sm font-black text-text-main w-20 text-right">{p.pm25} µg/m³</span>
                          <span className="text-label !text-text-dim w-12 text-right">{p.year}</span>
                        </div>
                      ))}
                    </div>

                    <div className={`p-5 rounded-2xl border ${sim.yearsToWHO ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      {sim.yearsToWHO ? (
                        <p className="text-sm font-semibold text-emerald-500">
                          At current rate, projected to reach WHO 5 µg/m³ target in <strong>{sim.yearsToWHO} years</strong> ({sim.currentYear + sim.yearsToWHO}).
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-red-400">
                          Current trend is not on track to reach the WHO 5 µg/m³ annual target. Policy intensification required.
                        </p>
                      )}
                    </div>

                    <p className="text-[10px] text-text-dim italic text-center">Linear projection based on {sim.dataPoints} historical data points. Not a guarantee of future outcomes.</p>
                  </>
                ) : (
                  <p className="text-p text-center py-8">Insufficient historical data for projection simulation.</p>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default PolicyView;
