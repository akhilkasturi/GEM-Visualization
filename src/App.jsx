import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import diseaseData from './data/diseases.json';


// World map component showing all diseases
const DiseaseMap = ({ diseases, onRegionClick }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [worldData, setWorldData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(topology => {
        const countries = feature(topology, topology.objects.countries);
        setWorldData(countries);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading map data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!worldData) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f0f9ff');

    const g = svg.append('g');

    // Calculate scale based on viewport size for better fit
    const baseScale = Math.min(width, height) / 3;
    
    const projection = d3.geoNaturalEarth1()
      .scale(baseScale)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Draw countries
    g.append('g')
      .attr('class', 'countries')
      .selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#e0f2fe')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 0.5)
      .attr('class', 'country')
      .on('mouseenter', function() {
        d3.select(this)
          .attr('fill', '#bae6fd')
          .attr('stroke-width', 1);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .attr('fill', '#e0f2fe')
          .attr('stroke-width', 0.5);
      });

    const markersGroup = g.append('g').attr('class', 'markers');

    // Function to update markers for all diseases
    const updateMarkers = (transform) => {
      markersGroup.selectAll('*').remove();

      const scale = transform ? transform.k : 1;
      const markerScale = 1 / scale;

      // Show all diseases at once
      diseases.forEach(disease => {
        disease.regions.forEach(region => {
          const [x, y] = projection([region.lng, region.lat]);
          
          if (!x || !y) return;
          
          // Add glow effect
          markersGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 20 * markerScale)
            .attr('fill', disease.color)
            .attr('opacity', 0.15);

          markersGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 12 * markerScale)
            .attr('fill', disease.color)
            .attr('opacity', 0.3);

          // Add marker
          markersGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 7 * markerScale)
            .attr('fill', disease.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2.5 * markerScale)
            .style('cursor', 'pointer')
            .on('mouseenter', function(event) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 10 * markerScale);
              
              setTooltip({
                show: true,
                x: event.pageX,
                y: event.pageY,
                content: `${disease.name} - ${region.country}: ${region.population}`
              });
            })
            .on('mouseleave', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 7 * markerScale);
              
              setTooltip({ show: false, x: 0, y: 0, content: '' });
            })
            .on('click', () => onRegionClick(disease, region));

          // Add clickable label
          const textGroup = markersGroup.append('g')
            .style('cursor', 'pointer')
            .on('click', () => onRegionClick(disease, region))
            .on('mouseenter', function() {
              d3.select(this).select('text')
                .attr('fill', disease.color);
            })
            .on('mouseleave', function() {
              d3.select(this).select('text')
                .attr('fill', '#1e293b');
            });

          textGroup.append('text')
            .attr('x', x)
            .attr('y', y - (20 * markerScale))
            .attr('text-anchor', 'middle')
            .attr('font-size', `${12 * markerScale}px`)
            .attr('font-weight', '700')
            .attr('fill', '#1e293b')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', `${3 * markerScale}px`)
            .attr('paint-order', 'stroke')
            .text(region.country);
        });
      });
    };

    updateMarkers(null);

    // Add zoom behavior with pan restrictions
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [-width * 0.3, -height * 0.3],
        [width * 1.3, height * 1.3]
      ])
      .extent([
        [0, 0],
        [width, height]
      ])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        updateMarkers(event.transform);
      });

    svg.call(zoom);

    // Add instructions
    svg.append('text')
      .attr('x', 30)
      .attr('y', height - 20)
      .attr('font-size', '12px')
      .attr('fill', '#64748b')
      .text('Scroll to zoom • Click and drag to pan • Click labels for details');

  }, [diseases, onRegionClick, worldData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="text-gray-600 text-lg">Loading world map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <svg ref={svgRef} className="w-full h-full" style={{ display: 'block' }} />
      {tooltip.show && (
        <div 
          className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-50"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

// Disease Detail Page
const DiseaseDetailPage = ({ disease, region, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
        >
          <span>←</span> Back to Map
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: disease.color }}
              />
              <h1 className="text-4xl font-bold text-gray-900">{disease.name}</h1>
            </div>
            <p className="text-xl text-gray-600">{disease.description}</p>
          </div>

          {/* Region Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Regional Data: {region.country}</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">Prevalence Rate</p>
                <p className="text-4xl font-bold" style={{ color: disease.color }}>
                  {region.prevalence}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">Affected Population</p>
                <p className="text-2xl font-bold text-gray-900">
                  {region.population}
                </p>
              </div>
            </div>
          </div>

          {/* Evolutionary Context */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Evolutionary Context</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{disease.evolutionaryContext}</p>
          </div>

          {/* Genetic Information */}
          <div className="bg-indigo-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Genetic Marker</h2>
            <p className="text-gray-700 font-mono text-lg">{disease.geneticMarker}</p>
          </div>

          {/* All Regions for this Disease */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Global Distribution</h2>
            <div className="space-y-3">
              {disease.regions.map((r, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    r.country === region.country
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{r.country}</h3>
                      <p className="text-sm text-gray-600 mt-1">{r.population}</p>
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: disease.color }}
                      >
                        {r.prevalence}%
                      </div>
                      <p className="text-xs text-gray-500">prevalence</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [currentView, setCurrentView] = useState('map');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleRegionClick = (disease, region) => {
    setSelectedDisease(disease);
    setSelectedRegion(region);
    setCurrentView('detail');
  };

  const handleBackToMap = () => {
    setCurrentView('map');
    setSelectedDisease(null);
    setSelectedRegion(null);
  };

  return (
    <div>
      {currentView === 'map' ? (
        <DiseaseMap 
          diseases={diseaseData.diseases}
          onRegionClick={handleRegionClick}
        />
      ) : (
        <DiseaseDetailPage 
          disease={selectedDisease}
          region={selectedRegion}
          onBack={handleBackToMap}
        />
      )}
    </div>
  );
}