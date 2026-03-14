import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-6">
    <Helmet>
      <title>404 | AirLens</title>
    </Helmet>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-10 max-w-lg"
    >
      <div className="space-y-4">
        <p className="text-label text-primary">404 — Node Not Found</p>
        <h1 className="heading-xl !text-8xl text-text-main/10 select-none">404</h1>
        <h2 className="heading-lg !text-3xl">Atmospheric Signal Lost</h2>
        <p className="text-p italic">
          "The page you're looking for has drifted beyond our sensing range."
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Link to="/" className="btn-main flex items-center gap-2">
          <Home size={16} /> Return to Base
        </Link>
        <Link to="/analytics" className="btn-alt flex items-center gap-2">
          <Search size={16} /> Browse Matrix
        </Link>
      </div>
    </motion.div>
  </div>
);

export default NotFound;
