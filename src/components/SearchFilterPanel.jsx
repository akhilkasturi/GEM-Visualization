import React, { useState, useMemo } from 'react';

// Search and Filter Panel Component
const SearchFilterPanel = ({ diseases, onFilterChange, activeFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiseases, setSelectedDiseases] = useState(diseases.map(d => d.id));
  const [prevalenceRange, setPrevalenceRange] = useState([0, 100]);
  const [selectedContinents, setSelectedContinents] = useState([]);

  // Get unique continents from disease regions
  const continents = useMemo(() => {
    const continentMap = {
      'Nigeria': 'Africa',
      'DRC': 'Africa',
      'Cameroon': 'Africa',
      'Ghana': 'Africa',
      'Tanzania': 'Africa',
      'China': 'Asia',
      'Japan': 'Asia',
      'South Korea': 'Asia',
      'Thailand': 'Asia',
      'Vietnam': 'Asia',
      'Taiwan': 'Asia',
      'Greece': 'Europe',
      'Saudi Arabia': 'Asia',
      'India': 'Asia',
      'Iraq': 'Asia',
      'Cyprus': 'Europe',
      'Italy': 'Europe',
      'Pakistan': 'Asia',
      'Iran': 'Asia',
      'Ireland': 'Europe',
      'UK': 'Europe',
      'USA': 'North America',
      'France': 'Europe',
      'Australia': 'Oceania',
      'Norway': 'Europe',
      'Germany': 'Europe'
    };

    const uniqueContinents = new Set();
    diseases.forEach(disease => {
      disease.regions.forEach(region => {
        const continent = continentMap[region.country];
        if (continent) uniqueContinents.add(continent);
      });
    });
    
    return Array.from(uniqueContinents).sort();
  }, [diseases]);

  // Handle disease toggle
  const toggleDisease = (diseaseId) => {
    const newSelected = selectedDiseases.includes(diseaseId)
      ? selectedDiseases.filter(id => id !== diseaseId)
      : [...selectedDiseases, diseaseId];
    
    setSelectedDiseases(newSelected);
    applyFilters(searchTerm, newSelected, prevalenceRange, selectedContinents);
  };

  // Handle continent toggle
  const toggleContinent = (continent) => {
    const newSelected = selectedContinents.includes(continent)
      ? selectedContinents.filter(c => c !== continent)
      : [...selectedContinents, continent];
    
    setSelectedContinents(newSelected);
    applyFilters(searchTerm, selectedDiseases, prevalenceRange, newSelected);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(value, selectedDiseases, prevalenceRange, selectedContinents);
  };

  // Handle prevalence range
  const handlePrevalenceChange = (min, max) => {
    setPrevalenceRange([min, max]);
    applyFilters(searchTerm, selectedDiseases, [min, max], selectedContinents);
  };

  // Apply all filters
  const applyFilters = (search, diseaseIds, range, continentsList) => {
    const continentMap = {
      'Nigeria': 'Africa', 'DRC': 'Africa', 'Cameroon': 'Africa', 'Ghana': 'Africa', 'Tanzania': 'Africa',
      'China': 'Asia', 'Japan': 'Asia', 'South Korea': 'Asia', 'Thailand': 'Asia', 'Vietnam': 'Asia', 'Taiwan': 'Asia',
      'Greece': 'Europe', 'Saudi Arabia': 'Asia', 'India': 'Asia', 'Iraq': 'Asia',
      'Cyprus': 'Europe', 'Italy': 'Europe', 'Pakistan': 'Asia', 'Iran': 'Asia',
      'Ireland': 'Europe', 'UK': 'Europe', 'USA': 'North America', 'France': 'Europe', 'Australia': 'Oceania',
      'Norway': 'Europe', 'Germany': 'Europe'
    };

    const filtered = diseases
      .filter(disease => diseaseIds.includes(disease.id))
      .map(disease => ({
        ...disease,
        regions: disease.regions.filter(region => {
          // Search filter
          const matchesSearch = search === '' || 
            disease.name.toLowerCase().includes(search.toLowerCase()) ||
            region.country.toLowerCase().includes(search.toLowerCase());

          // Prevalence filter
          const matchesPrevalence = region.prevalence >= range[0] && region.prevalence <= range[1];

          // Continent filter
          const matchesContinent = continentsList.length === 0 || 
            continentsList.includes(continentMap[region.country]);

          return matchesSearch && matchesPrevalence && matchesContinent;
        })
      }))
      .filter(disease => disease.regions.length > 0);

    onFilterChange(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDiseases(diseases.map(d => d.id));
    setPrevalenceRange([0, 100]);
    setSelectedContinents([]);
    onFilterChange(diseases);
  };

  // Count active filters
  const activeFilterCount = 
    (searchTerm ? 1 : 0) + 
    (selectedDiseases.length < diseases.length ? 1 : 0) +
    (prevalenceRange[0] > 0 || prevalenceRange[1] < 100 ? 1 : 0) +
    (selectedContinents.length > 0 ? 1 : 0);

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-lg p-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Filters & Search</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Reset All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Search diseases or countries..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Disease Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Diseases
        </label>
        <div className="space-y-2">
          {diseases.map(disease => (
            <label
              key={disease.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedDiseases.includes(disease.id)}
                onChange={() => toggleDisease(disease.id)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: disease.color }}
                />
                <span className="text-sm text-gray-700">{disease.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Prevalence Range */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Prevalence Range: {prevalenceRange[0]}% - {prevalenceRange[1]}%
        </label>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Min: {prevalenceRange[0]}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={prevalenceRange[0]}
              onChange={(e) => handlePrevalenceChange(parseInt(e.target.value), prevalenceRange[1])}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Max: {prevalenceRange[1]}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={prevalenceRange[1]}
              onChange={(e) => handlePrevalenceChange(prevalenceRange[0], parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Continent Filter */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Continents
        </label>
        <div className="flex flex-wrap gap-2">
          {continents.map(continent => (
            <button
              key={continent}
              onClick={() => toggleContinent(continent)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedContinents.includes(continent)
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {continent}
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {diseases.filter(d => selectedDiseases.includes(d.id)).reduce((sum, d) => sum + d.regions.length, 0)} regions
        </p>
      </div>
    </div>
  );
};

export default SearchFilterPanel;