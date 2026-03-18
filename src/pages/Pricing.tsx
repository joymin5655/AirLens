import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, Globe, Database, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../logic/useAuthStore';
import type { PlanType } from '../logic/useAuthStore';
import { supabase } from '../logic/supabase';

const Pricing = () => {
  const navigate = useNavigate();
  const { user, profile, fetchUserProfile } = useAuthStore();
  const plan = profile?.plan ?? 'Free';
  const [processing] = useState<string | null>(null);
  const [confirmDowngrade, setConfirmDowngrade] = useState(false);

  const handlePlanClick = async (tierName: PlanType) => {
    if (!user || user.is_anonymous) {
      navigate('/auth', { state: { from: { pathname: '/pricing' }, message: 'Please create an account to upgrade your plan.' } });
      return;
    }

    if (plan === tierName) {
      toast.info(`You are already on the ${tierName} plan.`);
      return;
    }

    if (tierName === 'Free') {
      if (!confirmDowngrade) {
        setConfirmDowngrade(true);
        toast.warning('Click "Downgrade to Free" again to confirm cancellation.', { duration: 5000 });
        return;
      }
      setConfirmDowngrade(false);
      await updatePlan();
      return;
    }

    if (tierName === 'Plus') {
      const productId = import.meta.env.VITE_POLAR_PRODUCT_ID_PLUS;
      const checkoutUrl = `https://buy.polar.sh/checkout?product_id=${productId}&metadata[user_id]=${user.id}`;
      window.open(checkoutUrl, '_blank');
      return;
    }
  };

  const updatePlan = async () => {
    if (!user) return;
    const { error } = await supabase.functions.invoke('cancel-subscription');
    if (error) {
      toast.error('Failed to cancel your subscription. Please contact support.');
      throw error;
    }
    await fetchUserProfile(user.id);
  };

  const tiers: { name: PlanType; price: string; unit?: string; description: string; features: string[]; icon: React.ReactNode; btnText: string; highlight: boolean }[] = [
    {
      name: 'Free',
      price: '$0',
      description: '매일 공기 상태를 확인해보세요. 카메라로 하루 3번까지 직접 측정할 수 있어요.',
      features: [
        '실시간 AQI 대시보드',
        '기본 3D Globe (PM2.5)',
        '카메라 AI 3회/일',
        '3일 Air Quality 예보',
        '커뮤니티 데이터'
      ],
      icon: <Globe className="text-primary" size={24} />,
      btnText: plan === 'Free' ? 'Current Plan' : 'Downgrade to Free',
      highlight: false
    },
    {
      name: 'Plus',
      price: '$2.99',
      unit: '/mo',
      description: '광고 없이 매끄러운 지구본, 무제한 카메라 측정, 더 길어진 예보까지.',
      features: [
        '광고 제거 (전체)',
        '카메라 AI 무제한',
        '7–10일 Air Quality Forecast',
        '개인 측정 기록 무제한 + 통계',
        'Globe 추가 레이어 (AOD·DQSS)'
      ],
      icon: <Zap className="text-primary" size={24} />,
      btnText: plan === 'Plus' ? 'Current Plan' : 'Upgrade to Plus — $2.99/mo',
      highlight: true
    }
  ];

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6 transition-colors duration-500">
      <Helmet>
        <title>Pricing | AirLens Intelligence Plans</title>
        <meta name="description" content="광고 없는 깨끗한 환경에서 AirLens를 사용해보세요. 무제한 카메라 측정, 더 긴 예보, 추가 Globe 레이어." />
      </Helmet>

      <header className="text-center space-y-6 mb-20">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
          <ShieldCheck className="text-primary" size={14} />
          <span className="text-label text-primary">AirLens · Free / Plus / Pro</span>
        </div>
        <h1 className="heading-xl">
          깨끗한 공기, <span className="text-primary italic font-serif font-light">깨끗한 경험</span>
        </h1>
        <p className="text-p text-lg italic max-w-2xl mx-auto !text-text-main/80">
          "광고 없이 더 쾌적하게 — Plus로 업그레이드하면 AirLens의 모든 기능을 마음껏 사용할 수 있어요."
        </p>
      </header>

      {/* Main 2-tier grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`narrative-card group relative flex flex-col p-10 h-full transition-all duration-500 ${tier.highlight ? 'ring-2 ring-primary shadow-glow scale-105 z-10' : 'border-border-subtle'}`}
          >
            {tier.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black px-5 py-1 rounded-full text-label shadow-glow">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <div className="w-14 h-14 bg-text-main/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                {tier.icon}
              </div>
              <h3 className="heading-lg mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-text-main tracking-tighter">{tier.price}</span>
                {tier.unit && <span className="text-label !text-text-main/60">{tier.unit}</span>}
              </div>
              <p className="text-p text-sm italic mt-6 !text-text-main/70 leading-relaxed">
                {tier.description}
              </p>
            </div>

            <div className="flex-1 space-y-5 mb-12">
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-start gap-4">
                  <div className="mt-1 bg-primary/20 rounded-full p-1 text-primary shadow-sm">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-p text-sm !text-text-main/90 font-semibold">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handlePlanClick(tier.name)}
              disabled={processing !== null || plan === tier.name}
              className={`${tier.highlight ? 'btn-primary' : 'btn-alt'} w-full py-5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {processing === tier.name ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing...
                </>
              ) : (
                tier.btnText
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Pro — Research & Institution section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16 narrative-card border-dashed border-2 border-primary/20 p-8 sm:p-12 max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-8"
      >
        <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
          <Database className="text-primary" size={32} />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="heading-lg !text-xl">Pro · 연구자/NGO 전용</h4>
          <p className="text-p text-sm italic !text-text-main/70 leading-relaxed">
            정책 영향 분석(SDID), 데이터 다운로드, API가 필요한 전문가를 위한 플랜입니다. $14.99/mo
          </p>
          <ul className="mt-3 space-y-1">
            {['SDID 정책 영향 분석', 'CSV 원본 데이터 다운로드', 'API 액세스 (10k req/mo)'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-text-dim font-semibold">
                <Check size={12} className="text-primary shrink-0" strokeWidth={3} /> {f}
              </li>
            ))}
          </ul>
        </div>
        {import.meta.env.VITE_POLAR_PRODUCT_ID_PRO ? (
          <a
            href={`https://buy.polar.sh/checkout?product_id=${import.meta.env.VITE_POLAR_PRODUCT_ID_PRO}&metadata[user_id]=${user?.id ?? ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-alt whitespace-nowrap shrink-0 flex items-center justify-center"
          >
            Upgrade to Pro
          </a>
        ) : (
          <a
            href="mailto:research@airlens.earth?subject=Pro%20Plan%20Inquiry"
            className="btn-alt whitespace-nowrap shrink-0 flex items-center justify-center"
          >
            Apply for Research Access
          </a>
        )}
      </motion.div>

      {/* Public Benefit Policy */}
      <div className="mt-12 narrative-card !bg-primary/5 border-dashed border-2 border-primary/20 p-8 sm:p-12 lg:p-16 text-center flex flex-col items-center gap-8">
        <div className="p-5 bg-bg-card rounded-full shadow-glow border border-primary/20">
          <ShieldCheck className="text-primary" size={48} />
        </div>
        <div className="space-y-4">
          <h4 className="heading-lg !text-3xl uppercase tracking-tight">Public Benefit Policy</h4>
          <p className="text-p text-base italic max-w-2xl mx-auto !text-text-main/80 leading-relaxed">
            Environmental researchers, university labs, and non-profit NGOs are eligible for 75% to 100% discounts. We believe data transparency is a fundamental right.
          </p>
        </div>
        <button
          onClick={() => toast.info('Academic grant applications: contact hello@airlens.earth')}
          className="text-label text-primary border-b-2 border-primary/30 pb-1 hover:border-primary hover:scale-105 transition-all"
        >
          Apply for Academic Grant
        </button>
      </div>
    </div>
  );
};

export default Pricing;
