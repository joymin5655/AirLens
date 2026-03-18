export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1a] text-white px-6">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo / Brand */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Air<span className="text-sky-400">Lens</span>
          </h1>
          <p className="text-sky-400/70 text-sm tracking-widest uppercase">
            Air Quality Intelligence
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-sky-400/30 mx-auto" />

        {/* Main message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white/90">Coming Soon</h2>
          <p className="text-white/50 text-base leading-relaxed">
            We're putting the finishing touches on AirLens.<br />
            Real-time air quality monitoring and prediction — launching soon.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-sky-400/60 text-sm">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>Currently in development</span>
        </div>
      </div>
    </div>
  );
}
