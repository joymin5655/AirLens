import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, MapPin, History, ArrowRight, ChevronRight, Bookmark } from 'lucide-react';
import { useAuthStore } from '../../logic/useAuthStore';
import { supabase } from '../../logic/supabase';
import { motion } from 'framer-motion';

const PersonalVault = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [userCaptures, setUserCaptures] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (user) {
      const fetchArchive = async () => {
        const { data: captures } = await supabase
          .from('captures')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);

        if (captures && captures.length > 0) {
          const paths = captures.filter(c => c.image_url).map(c => c.image_url);
          if (paths.length > 0) {
            try {
              const { data: signedData, error: signedError } = await supabase.storage
                .from('captures')
                .createSignedUrls(paths, 3600);

              if (!signedError && signedData) {
                const urlMap: Record<string, string> = {};
                signedData.forEach(item => {
                  if (item.signedUrl) urlMap[item.path || ''] = item.signedUrl;
                });

                const enriched = captures.map(c => ({
                  ...c,
                  signed_url: urlMap[c.image_url] || null
                }));
                setUserCaptures(enriched);
              } else {
                setUserCaptures(captures);
              }
            } catch (err) {
              console.error('Error fetching signed URLs:', err);
              setUserCaptures(captures);
            }
          } else {
            setUserCaptures(captures);
          }
        }
      };
      fetchArchive();
    }
  }, [user]);

  if (!user) return null;

  return (
    <section className="w-full min-h-screen lg:min-w-[100vw] lg:h-screen flex items-center justify-center snap-center px-6 sm:px-10 lg:px-24 py-28 lg:py-0 bg-bg-base/30 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(37,226,244,0.1)_0,transparent_60%)]"></div>
      </div>

      <div className="max-w-7xl w-full space-y-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-12 gap-10">
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 text-primary"
            >
              <div className="p-2 bg-primary/10 rounded-xl">
                <History size={20} strokeWidth={2.5} />
              </div>
              <span className="text-label !text-primary">Personal Sensing Archive</span>
            </motion.div>
            <h2 className="heading-xl !text-4xl sm:!text-5xl md:!text-6xl lg:!text-8xl">
              Intelligence <br/><span className="italic font-serif font-light text-primary">Chronicle</span>
            </h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-right space-y-3 narrative-card !p-8 !rounded-[40px] shadow-2xl min-w-[240px]"
          >
            <div className="flex items-center justify-end gap-3 text-primary mb-1">
               <Bookmark size={16} className="fill-primary" />
               <p className="text-label !text-primary">Active Entries</p>
            </div>
            <p className="heading-xl !text-6xl">{userCaptures.length.toString().padStart(2, '0')}</p>
            <div className="h-1 w-12 bg-primary ml-auto rounded-full"></div>
          </motion.div>
        </div>

        {userCaptures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userCaptures.map((cap, i) => (
              <motion.div 
                key={cap.id as string} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="narrative-card group !p-0 overflow-hidden !rounded-[48px]"
              >
                <div className="h-64 bg-text-main/5 relative overflow-hidden">
                  {cap.signed_url ? (
                    <img
                      src={String(cap.signed_url)}
                      alt="Capture" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-primary/20 gap-2">
                       <Camera size={64} strokeWidth={1} />
                       <span className="text-label">No Imagery Found</span>
                    </div>
                  )}
                  <div className="absolute top-6 right-6 bg-text-main/80 backdrop-blur-xl text-bg-base px-5 py-2.5 rounded-full text-label shadow-deep flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow"></span>
                    PM2.5: {cap.pm25_est as number}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-text-main/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>

                <div className="p-10 space-y-6">
                  <div className="flex justify-between items-start pb-6">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-primary">
                          <MapPin size={12} />
                          <p className="text-label !text-primary">Location Node</p>
                       </div>
                       <p className="heading-lg !text-xl group-hover:text-primary transition-colors">{(cap.city_name as string) || 'Ungauged Region'}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-label !text-text-dim">{new Date(cap.created_at as string).toLocaleDateString()}</p>
                       <p className="text-[10px] text-primary font-bold uppercase tracking-tighter mt-1">Matrix v1.1</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group/row">
                    <div className="space-y-1">
                       <p className="text-label !text-text-dim">Atmospheric Grading</p>
                       <p className="heading-lg !text-2xl italic group-hover:text-primary transition-colors">{(cap.aqi_class as string) || 'Inference Active'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-text-main/10 flex items-center justify-center text-text-main group-hover:bg-primary group-hover:text-black transition-all duration-700 shadow-sm border border-text-main/10 group-hover:rotate-12">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="narrative-card flex flex-col items-center justify-center py-32 text-center space-y-10 border-dashed border-2 !border-primary/20 !rounded-[64px]"
          >
            <div className="relative">
               <div className="absolute inset-0 bg-primary/10 rounded-full blur-[40px] animate-pulse"></div>
               <div className="bg-bg-card p-12 rounded-full text-primary shadow-2xl relative z-10 border border-white/10"><Camera size={80} strokeWidth={1} /></div>
            </div>
            <div className="space-y-4">
              <h4 className="heading-lg !text-4xl">{t('DASHBOARD.NO_CAPTURES')}</h4>
              <p className="text-p max-w-sm mx-auto leading-relaxed">{t('DASHBOARD.EMPTY_VAULT')}</p>
            </div>
            <Link to="/camera" className="bg-text-main text-bg-base px-14 py-6 rounded-full text-label shadow-deep hover:scale-110 hover:shadow-primary/20 transition-all flex items-center gap-4 group">
              Start Atmospheric Sensing <ChevronRight size={22} className="text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PersonalVault;