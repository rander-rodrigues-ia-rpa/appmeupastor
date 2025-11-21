import React from 'react';

interface IndicatorCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between transition-transform transform hover:scale-[1.02]">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-green-700 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-green-100 rounded-full">
        <Icon className="h-8 w-8 text-green-600" />
      </div>
    </div>
  );
};

export default IndicatorCard;
