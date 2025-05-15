import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ variant = 'dark' }) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  
  return (
    <Link to="/" className="flex items-center">
      <Zap size={28} className="text-yellow-500 mr-1" />
      <span className={`text-xl font-bold ${textColor}`}>RAUSHAN</span>
      <span className={`text-xl font-bold text-blue-600`}>ELECTRONIC</span>
    </Link>
  );
};

export default Logo;