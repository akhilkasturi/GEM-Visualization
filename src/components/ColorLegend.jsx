import React, { useState } from 'react';

const ColorLegend = ({ diseases, visibleDiseases, onToggleDisease }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Count visible regions for each disease
  const getVisibleCount = (diseaseId) => {
    const disease = diseases.find(d => d.id === diseaseId);
    return disease ? disease.regions.length : 0;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-gray-900">Disease Legend</h3>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {/* Legend Items */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-2 max-h-96 overflow-y-auto">
          {diseases.map(disease => {
            const isVisible = visibleDiseases.includes(disease.id);
            const count = getVisibleCount(disease.id);

            return (
              <div
                key={disease.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  isVisible 
                    ? 'bg-gray-50 hover:bg-gray-100' 
                    : 'bg-gray-100 opacity-50 hover:opacity-75'
                }`}
                onClick={() => onToggleDisease(disease.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Color indicator */}
                  <div 
                    className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      isVisible ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{ 
                      backgroundColor: disease.color,
                      ringColor: disease.color
                    }}
                  />
                  
                  {/* Disease name */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      isVisible ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {disease.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {count} {count === 1 ? 'region' : 'regions'}
                    </div>
                  </div>

                  {/* Toggle indicator */}
                  <div className="flex-shrink-0">
                    {isVisible ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Show All / Hide All buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                diseases.forEach(d => {
                  if (!visibleDiseases.includes(d.id)) {
                    onToggleDisease(d.id);
                  }
                });
              }}
              className="flex-1 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            >
              Show All
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                diseases.forEach(d => {
                  if (visibleDiseases.includes(d.id)) {
                    onToggleDisease(d.id);
                  }
                });
              }}
              className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Hide All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorLegend;