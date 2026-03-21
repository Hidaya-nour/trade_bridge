// FeatureCard.tsx
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'centered' | 'horizontal';
}

const FeatureCard = ({ icon, title, description, variant = 'centered' }: FeatureCardProps) => {
  const variants = {
    centered: 'text-center',
    default: 'text-left',
    horizontal: 'flex items-start gap-4'
  };

  if (variant === 'horizontal') {
    return (
      <div className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {icon}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${variants[variant]}`}>
      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;