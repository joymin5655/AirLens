import { useAuthStore } from '../logic/useAuthStore';

interface AdBannerProps {
  position?: 'bottom' | 'side';
}

const AdBanner = ({ position = 'bottom' }: AdBannerProps) => {
  const { profile } = useAuthStore();
  const plan = profile?.plan ?? 'Free';

  if (plan !== 'Free') return null;

  return (
    <div
      className={`w-full flex items-center justify-center bg-text-main/5 border border-text-main/10 rounded-2xl overflow-hidden ${position === 'side' ? 'h-[250px]' : 'h-[50px]'}`}
      aria-label="Advertisement"
    >
      {/* TODO: Replace with <ins class="adsbygoogle" ...> when AdSense is configured */}
      <span className="text-[10px] font-black text-text-dim uppercase tracking-widest opacity-40">
        Advertisement
      </span>
    </div>
  );
};

export default AdBanner;
