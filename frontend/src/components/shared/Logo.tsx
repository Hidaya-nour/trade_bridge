// src/components/landing/shared/Logo.tsx
import { Link } from 'react-router-dom';
import logo from '../../assets/image/logo.png';  // Import image

interface LogoProps {
  variant?: 'default' | 'white' | 'small';
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

const Logo = ({ 
  variant = 'default', 
  showText = true,
  className = '',
  linkTo = '/'
}: LogoProps) => {
  
  const sizeClasses = {
    default: 'h-8 md:h-10',
    white: 'h-8 md:h-10',
    small: 'h-6'
  };

  const filterClass = variant === 'white' ? 'brightness-0 invert' : '';

  return (
    <Link 
      to={linkTo} 
      className={`flex items-center gap-2 ${className}`}
    >
      {/* Image Logo - using imported image */}
      <img 
        src={logo} 
        alt="TradeBridge" 
        className={`${sizeClasses[variant]} w-auto ${filterClass}`}
      />
      
      {/* Optional Text */}
      {showText && variant !== 'small' && (
        <span className={`text-xl md:text-2xl font-bold ${
          variant === 'white' ? 'text-white' : 'text-gray-800'
        }`}>
          TradeBridge
        </span>
      )}
    </Link>
  );
};

export default Logo;