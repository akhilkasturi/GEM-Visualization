import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

// Disease data with real prevalence statistics
const diseaseData = {
  diseases: [
    {
      id: 'sickle-cell',
      name: 'Sickle Cell Disease',
      description: 'Genetic blood disorder affecting hemoglobin',
      color: '#ef4444',
      regions: [
        { country: 'Nigeria', lat: 9.082, lng: 8.6753, prevalence: 24, population: '2-3% carrier rate' },
        { country: 'DRC', lat: -4.0383, lng: 21.7587, prevalence: 20, population: '1-2% affected' },
        { country: 'Cameroon', lat: 7.3697, lng: 12.3547, prevalence: 18, population: '20-25% carrier rate' },
        { country: 'Ghana', lat: 7.9465, lng: -1.0232, prevalence: 15, population: '15-20% carrier rate' },
        { country: 'Tanzania', lat: -6.3690, lng: 34.8888, prevalence: 13, population: '13% carrier rate' },
      ],
      evolutionaryContext: 'Provides protection against malaria in heterozygous carriers. The sickle cell trait confers resistance to Plasmodium falciparum malaria, explaining its high prevalence in sub-Saharan Africa.',
      geneticMarker: 'HBB gene mutation (Glu6Val)'
    },
    {
      id: 'lactose-intolerance',
      name: 'Lactose Intolerance',
      description: 'Inability to digest lactose in dairy products',
      color: '#3b82f6',
      regions: [
        { country: 'China', lat: 35.8617, lng: 104.1954, prevalence: 90, population: '~90% of adults' },
        { country: 'Japan', lat: 36.2048, lng: 138.2529, prevalence: 85, population: '~85% of adults' },
        { country: 'South Korea', lat: 35.9078, lng: 127.7669, prevalence: 75, population: '~75% of adults' },
        { country: 'Thailand', lat: 15.8700, lng: 100.9925, prevalence: 90, population: '~90% of adults' },
        { country: 'Vietnam', lat: 14.0583, lng: 108.2772, prevalence: 87, population: '~87% of adults' },
        { country: 'Nigeria', lat: 9.082, lng: 8.6753, prevalence: 89, population: '~89% of adults' },
      ],
      evolutionaryContext: 'Lactase persistence evolved independently in populations with long histories of dairy farming, particularly in Northern Europe and some African pastoralist groups. The majority of humanity loses lactase production after weaning.',
      geneticMarker: 'LCT gene regulation (MCM6 variants)'
    },
    {
      id: 'g6pd-deficiency',
      name: 'G6PD Deficiency',
      description: 'Enzyme deficiency affecting red blood cells',
      color: '#8b5cf6',
      regions: [
        { country: 'Greece', lat: 39.0742, lng: 21.8243, prevalence: 15, population: '3-15% of males' },
        { country: 'Saudi Arabia', lat: 23.8859, lng: 45.0792, prevalence: 12, population: '2-12% of males' },
        { country: 'India', lat: 20.5937, lng: 78.9629, prevalence: 10, population: '5-10% of males' },
        { country: 'Iraq', lat: 33.2232, lng: 43.6793, prevalence: 13, population: '10-13% of males' },
        { country: 'Nigeria', lat: 9.082, lng: 8.6753, prevalence: 20, population: '20-25% of males' },
      ],
      evolutionaryContext: 'Provides resistance to malaria parasites. G6PD deficiency impairs parasite growth in red blood cells, offering protection in malaria-endemic regions.',
      geneticMarker: 'G6PD gene mutations (X-linked)'
    },
    {
      id: 'thalassemia',
      name: 'Thalassemia',
      description: 'Inherited blood disorder causing reduced hemoglobin production',
      color: '#f59e0b',
      regions: [
        { country: 'Cyprus', lat: 35.1264, lng: 33.4299, prevalence: 16, population: '~16% carrier rate' },
        { country: 'Italy', lat: 41.8719, lng: 12.5674, prevalence: 7, population: '2-7% carrier rate' },
        { country: 'Greece', lat: 39.0742, lng: 21.8243, prevalence: 8, population: '5-8% carrier rate' },
        { country: 'Thailand', lat: 15.8700, lng: 100.9925, prevalence: 5, population: '3-5% affected' },
        { country: 'India', lat: 20.5937, lng: 78.9629, prevalence: 3, population: '1.25-1.66% carrier rate' },
        { country: 'Pakistan', lat: 30.3753, lng: 69.3451, prevalence: 5, population: '5% carrier rate' },
        { country: 'Iran', lat: 32.4279, lng: 53.6880, prevalence: 6, population: '4-6% carrier rate' },
      ],
      evolutionaryContext: 'Like sickle cell disease, thalassemia carriers have increased resistance to malaria. The high prevalence in Mediterranean, Middle Eastern, and Asian populations correlates with historical malaria distribution.',
      geneticMarker: 'HBB gene (β-thalassemia) or HBA genes (α-thalassemia)'
    },
    {
      id: 'cystic-fibrosis',
      name: 'Cystic Fibrosis',
      description: 'Genetic disorder affecting lungs and digestive system',
      color: '#ec4899',
      regions: [
        { country: 'Ireland', lat: 53.4129, lng: -8.2439, prevalence: 0.1, population: '1 in 1,461 births' },
        { country: 'UK', lat: 55.3781, lng: -3.4360, prevalence: 0.08, population: '1 in 2,500 births' },
        { country: 'USA', lat: 37.0902, lng: -95.7129, prevalence: 0.04, population: '1 in 3,500 births' },
        { country: 'France', lat: 46.2276, lng: 2.2137, prevalence: 0.06, population: '1 in 4,700 births' },
        { country: 'Australia', lat: -25.2744, lng: 133.7751, prevalence: 0.04, population: '1 in 2,500-3,000 births' },
      ],
      evolutionaryContext: 'Theories suggest CF carriers may have had protection against cholera and typhoid fever, which were common in European populations. The CFTR mutation affects chloride transport, potentially preventing toxin-induced diarrhea.',
      geneticMarker: 'CFTR gene mutations (most common: ΔF508)'
    },
    {
      id: 'hemochromatosis',
      name: 'Hemochromatosis',
      description: 'Iron overload disorder causing excess iron absorption',
      color: '#14b8a6',
      regions: [
        { country: 'Ireland', lat: 53.4129, lng: -8.2439, prevalence: 10, population: '1 in 83 people (homozygous)' },
        { country: 'Norway', lat: 60.4720, lng: 8.4689, prevalence: 8, population: '5-10% carrier rate' },
        { country: 'UK', lat: 55.3781, lng: -3.4360, prevalence: 7, population: '1 in 200-300 people' },
        { country: 'Germany', lat: 51.1657, lng: 10.4515, prevalence: 6, population: '5-7% carrier rate' },
        { country: 'USA', lat: 37.0902, lng: -95.7129, prevalence: 5, population: '1 in 300 people' },
      ],
      evolutionaryContext: 'The high prevalence in Northern Europeans may relate to iron deficiency being common in ancient diets. Carriers with one mutated gene may have had an advantage in iron-poor environments, while homozygotes face iron overload.',
      geneticMarker: 'HFE gene mutations (C282Y and H63D)'
    },
    {
      id: 'aldh2-deficiency',
      name: 'ALDH2 Deficiency',
      description: 'Enzyme deficiency causing alcohol flush reaction',
      color: '#f43f5e',
      regions: [
        { country: 'Japan', lat: 36.2048, lng: 138.2529, prevalence: 40, population: '~40% of population' },
        { country: 'China', lat: 35.8617, lng: 104.1954, prevalence: 36, population: '~35-40% of population' },
        { country: 'South Korea', lat: 35.9078, lng: 127.7669, prevalence: 28, population: '~28% of population' },
        { country: 'Taiwan', lat: 23.6978, lng: 120.9605, prevalence: 45, population: '~45% of population' },
        { country: 'Vietnam', lat: 14.0583, lng: 108.2772, prevalence: 30, population: '~30% of population' },
      ],
      evolutionaryContext: 'The ALDH2*2 variant is almost exclusively found in East Asian populations. While it causes unpleasant reactions to alcohol (facial flushing, nausea), it may have been neutral or even protective against alcohol-related harm in ancestral populations.',
      geneticMarker: 'ALDH2*2 allele (Glu504Lys)'
    }
  ]
};

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

// Bar Chart Component for Prevalence Comparison
const PrevalenceChart = ({ disease }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort regions by prevalence
    const sortedRegions = [...disease.regions].sort((a, b) => b.prevalence - a.prevalence);

    // Scales
    const x = d3.scaleBand()
      .domain(sortedRegions.map(d => d.country))
      .range([0, chartWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedRegions, d => d.prevalence) * 1.1])
      .range([chartHeight, 0]);

    // Bars
    g.selectAll('.bar')
      .data(sortedRegions)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.country))
      .attr('y', chartHeight)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', disease.color)
      .attr('opacity', 0.8)
      .on('mouseenter', function() {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .transition()
      .duration(800)
      .attr('y', d => y(d.prevalence))
      .attr('height', d => chartHeight - y(d.prevalence));

    // Value labels on bars
    g.selectAll('.label')
      .data(sortedRegions)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.country) + x.bandwidth() / 2)
      .attr('y', d => y(d.prevalence) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1e293b')
      .attr('opacity', 0)
      .text(d => `${d.prevalence}%`)
      .transition()
      .delay(800)
      .duration(400)
      .attr('opacity', 1);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('font-size', '11px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .attr('font-size', '11px');

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#64748b')
      .text('Prevalence Rate (%)');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .attr('fill', '#1e293b')
      .text('Regional Prevalence Comparison');

  }, [disease]);

  return <svg ref={svgRef} className="w-full" />;
};

// Mini Map Component showing just one disease
const MiniDiseaseMap = ({ disease }) => {
  const svgRef = useRef();
  const [worldData, setWorldData] = useState(null);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(topology => {
        const countries = feature(topology, topology.objects.countries);
        setWorldData(countries);
      })
      .catch(error => {
        console.error('Error loading map data:', error);
      });
  }, []);

  useEffect(() => {
    if (!worldData) return;

    const width = 500;
    const height = 300;

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

    const projection = d3.geoNaturalEarth1()
      .scale(80)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Draw countries
    svg.append('g')
      .selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#e0f2fe')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 0.3);

    // Plot markers
    disease.regions.forEach(region => {
      const [x, y] = projection([region.lng, region.lat]);
      
      if (!x || !y) return;

      // Glow
      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 15)
        .attr('fill', disease.color)
        .attr('opacity', 0.2);

      // Marker
      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 6)
        .attr('fill', disease.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      // Label
      svg.append('text')
        .attr('x', x)
        .attr('y', y - 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .attr('fill', '#1e293b')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', '2px')
        .attr('paint-order', 'stroke')
        .text(region.country);
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .attr('fill', '#1e293b')
      .text('Global Distribution');

  }, [disease, worldData]);

  if (!worldData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Loading map...</div>
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full" />;
};

// Disease Detail Page
const DiseaseDetailPage = ({ disease, region, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
        >
          <span>←</span> Back to Map
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Selected Region: {region.country}</h2>
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
        </div>

        {/* Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <PrevalenceChart disease={disease} />
          </div>

          {/* Mini Map */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <MiniDiseaseMap disease={disease} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolutionary Context */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Evolutionary Context
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">{disease.evolutionaryContext}</p>
            
            {/* Genetic Information */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Genetic Marker</h3>
              <p className="text-gray-700 font-mono text-base">{disease.geneticMarker}</p>
            </div>
          </div>

          {/* All Regions Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">All Affected Regions</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
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