import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  color?: 'purple' | 'blue'; // [NEW] Theme prop
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, color = 'purple' }) => {
  
  // Color mapping
  const themeClasses = {
    purple: {
      icon: 'text-purple-200',
      title: 'text-purple-300'
    },
    blue: {
      icon: 'text-blue-200',
      title: 'text-blue-300'
    }
  };

  const theme = themeClasses[color];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <Icon size={48} className={`mx-auto mb-4 ${theme.icon}`} />
      <h3 className={`text-lg font-bold ${theme.title}`}>{title}</h3>
      <p className="text-xs mt-2 text-gray-400 max-w-xs mx-auto">{message}</p>
    </div>
  );
};

export default EmptyState;