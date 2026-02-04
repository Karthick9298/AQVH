import React from 'react';

const Card = ({ title, children, className = '', icon: Icon }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="text-blue-400 text-xl" />}
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
