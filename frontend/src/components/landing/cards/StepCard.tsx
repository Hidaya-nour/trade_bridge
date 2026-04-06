// StepCard.tsx
import type { ReactNode } from 'react';

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon?: ReactNode;
}

const StepCard = ({ number, title, description, icon }: StepCardProps) => {
  return (
    <div className="relative group">
      {/* Step Number Background */}
      <div className="absolute -top-3 -left-3 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl z-10">
        {number}
      </div>
      
      {/* Card Content */}
      <div className="relative pt-8 p-6 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-100">
        {icon && (
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default StepCard;