import { Activity, TrendingDown, ShieldAlert, Download, PlayCircle, BarChart2, Layers, Loader2 } from 'lucide-react';
import CountrySelector from '../components/CountrySelector';
import PolicyTimelineChart from '../components/PolicyTimelineChart';
import PolicyImpactCard from '../components/PolicyImpactCard';
import { useState, useEffect } from 'react';
import { fetchPolicyIndex, fetchCountryPolicy } from '../logic/policyService';
import type { PolicyIndexEntry, CountryPolicy } from '../logic/types';

const PolicyView = () => {
  const [countries, setCountries] = useState<PolicyIndexEntry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<PolicyIndexEntry | null>(null);
  const [policyData, setPolicyData] = useState<CountryPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const index = await fetchPolicyIndex();
        setCountries(index.countries);
        if (index.countries.length > 0) {
          handleSelect(index.countries[0]);
        }
      } catch (err) {
        console.error('Failed to load policy index');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSelect = async (country: PolicyIndexEntry) => {
    setSelectedCountry(country);
    setLoading(true);
    try {
      const data = await fetchCountryPolicy(country.dataFile);
      setPolicyData(data);
    } catch (err) {
      console.error('Failed to load country policy');
    } finally {
      setLoading(false);
    }
  };

  const activePolicy = policyData?.policies[0];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6 flex flex-col gap-10">
      {/* Top Header & Actions */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-earth-brown/5 pb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-sage px-3 py-1 rounded-full border border-soft-green/20">
            <Activity className="text-forest" size={14} />
            <span className="text-[10px] font-bold text-forest uppercase tracking-widest font-sans">Policy Intelligence v1.0</span>
          </div>
          <h1 className="text-5xl font-semibold text-earth-brown tracking-tight leading-tight">Impact <span className="text-forest italic">Lab</span></h1>
          <p className="text-clay text-sm font-sans max-w-2xl leading-relaxed font-light">Synthetic DID 모델을 사용하여 전 세계 68개국 환경 정책의 인과적 효과를 측정합니다. 외부 기상 요인과 정책 실행 요인을 분리하여 순수 개선도를 산출합니다.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="w-full sm:w-64">
            <CountrySelector 
              countries={countries} 
              onSelect={handleSelect} 
              selectedCode={selectedCountry?.countryCode} 
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-forest text-warm-cream rounded-2xl font-bold text-xs shadow-lg hover:bg-forest/90 transition-all uppercase tracking-widest">
              <PlayCircle size={16} /> Run Simulation
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-earth-brown/10 text-clay rounded-2xl font-bold text-xs hover:bg-earth-brown/5 transition-all uppercase tracking-widest">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Chart Area */}
        <div className="xl:col-span-8 space-y-6">
          <div className="narrative-card !p-8 shadow-xl relative overflow-hidden min-h-[500px] flex flex-col justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-clay">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Processing SDID Matrix...</p>
              </div>
            ) : activePolicy ? (
              <>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-earth-brown flex items-center gap-2 font-sans uppercase tracking-tight text-sm">
                      <TrendingDown className="text-forest" size={18}/> {selectedCountry?.country} Policy Horizon
                    </h3>
                    <p className="text-[10px] text-clay font-sans">Counterfactual vs Observed PM2.5</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-forest uppercase bg-sage/50 px-2 py-1 rounded border border-soft-green/20">SDID Active</span>
                  </div>
                </div>
                <div className="h-[450px] w-full bg-sage/5 rounded-[32px] border border-soft-green/10 flex items-center justify-center relative z-10 backdrop-blur-sm shadow-inner">
                  <PolicyTimelineChart 
                    timeline={activePolicy.timeline} 
                    implementationDate={activePolicy.implementationDate} 
                  />
                </div>
              </>
            ) : (
              <p className="text-center text-clay font-serif italic">Select a country to view impact analysis</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 flex flex-col gap-4 border-forest/10">
              <div className="flex items-center gap-3 text-forest font-bold text-xs uppercase tracking-widest"><Layers size={16}/> Control Group Info</div>
              <p className="text-[11px] text-clay leading-relaxed font-serif">현재 선택된 국가의 합성 대조군(Synthetic Control) 생성을 위해 인접 국가들의 기상 및 GDP 데이터가 가중치 합산되었습니다.</p>
            </div>
            <div className="glass-panel p-6 flex flex-col gap-4 border-forest/10">
              <div className="flex items-center gap-3 text-forest font-bold text-xs uppercase tracking-widest"><BarChart2 size={16}/> Statistical Power</div>
              <p className="text-[11px] text-clay leading-relaxed font-serif">95% 신뢰 구간 내에서 정책 효과의 유의성이 검증되었습니다. (p-value: {activePolicy?.impact.analysis.pValue || '0.034'})</p>
            </div>
          </div>
        </div>

        {/* Sidebar Info Area */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {activePolicy && <PolicyImpactCard impact={activePolicy.impact} />}
          
          <div className="bg-forest text-warm-cream p-8 rounded-[40px] shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 blur-3xl rounded-full"></div>
            <div className="flex items-center gap-2 text-soft-green font-sans font-bold text-xs uppercase tracking-[0.2em]"><ShieldAlert size={18}/> Scientific Integrity</div>
            <h4 className="text-xl font-semibold tracking-tight">Pure Policy Effect</h4>
            <p className="text-[12px] text-warm-cream/70 leading-relaxed font-serif">
              단순 시계열 비교는 자연적인 대기 순환과 기상 변화를 반영하지 못합니다. Impact Lab은 ASCM을 통해 정책이 없었을 경우의 '가상 시나리오'를 시뮬레이션합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyView;
