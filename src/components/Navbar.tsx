import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../logic/useAuthStore';
import { supabase } from '../logic/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuthStore();

  const links = [
    { name: 'Our Story', path: '/' },
    { name: 'Globe', path: '/globe' },
    { name: 'Methods', path: '/camera' },
    { name: 'Impact', path: '/policy' },
    { name: 'Resources', path: '/about' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-warm-cream/90 backdrop-blur-md border-b border-earth-brown/5 z-50 px-4 md:px-8 flex items-center justify-between transition-all">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-forest text-3xl">eco</span>
        <Link to="/" className="font-sans font-bold text-2xl tracking-tight text-forest flex items-baseline">
          AirLens
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-10 font-sans text-xs font-semibold uppercase tracking-widest text-clay">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`transition-colors hover:text-forest ${
              location.pathname === link.path ? 'text-forest border-b-2 border-forest pb-1' : ''
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-sans font-bold text-clay hidden lg:inline uppercase tracking-widest">
                {user.email?.split('@')[0]}
              </span>
              {isAdmin && (
                <span className="text-[8px] font-black bg-earth-brown text-warm-cream px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
                  System Admin
                </span>
              )}
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-earth-brown text-warm-cream px-5 py-2 rounded-full font-sans font-bold text-xs shadow-lg hover:bg-earth-brown/90 transition-all flex items-center gap-2"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        ) : (
          <Link 
            to="/auth"
            className="bg-forest text-warm-cream px-6 py-2 rounded-full font-sans font-bold text-sm shadow-lg hover:bg-forest/90 transition-all flex items-center gap-2"
          >
            <User size={16} />
            Sign In
          </Link>
        )}
        
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-earth-brown">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-20 left-0 right-0 bg-warm-cream border-b border-earth-brown/10 p-6 md:hidden animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-6 font-sans text-sm font-semibold uppercase tracking-widest text-clay">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`${location.pathname === link.path ? 'text-forest' : ''}`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <button 
                onClick={() => { handleSignOut(); setIsOpen(false); }}
                className="text-left text-red-500"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;