import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

// Story data for sickle cell disease
const storySteps = [
  {
    id: 'intro',
    title: 'A Deadly Trade-Off',
    text: 'In sub-Saharan Africa, a genetic mutation causes a painful disease—yet persists in 25% of the population. Why? The answer lies in one of evolution\'s most fascinating compromises.',
    mapFocus: null,
    highlightRegions: []
  },
  {
    id: 'malaria-threat',
    title: 'The Malaria Belt',
    text: 'For thousands of years, malaria has been one of the deadliest diseases in tropical Africa. The Plasmodium parasite, transmitted by mosquitoes, kills hundreds of thousands annually.',
    mapFocus: { center: [20, 0], scale: 400 },
    highlightRegions: ['Nigeria', 'DRC', 'Cameroon', 'Ghana', 'Tanzania'],
    showMalariaZone: true
  },
  {
    id: 'sickle-cell-emerges',
    title: 'A Mutation Emerges',
    text: 'Around 7,300 years ago in West Africa, a mutation occurred in the HBB gene. This single change (Glu6Val) causes red blood cells to become sickle-shaped, leading to painful episodes and shorter lifespan.',
    mapFocus: { center: [10, 8], scale: 800 },
    highlightRegions: ['Nigeria', 'Cameroon', 'Ghana'],
    showSickleCell: true
  },
  {
    id: 'the-advantage',
    title: 'The Hidden Advantage',
    text: 'People with ONE copy of the sickle cell gene (carriers) have a remarkable resistance to malaria. The parasite cannot thrive in their modified red blood cells. This protection was a game-changer in malaria zones.',
    mapFocus: { center: [10, 8], scale: 600 },
    highlightRegions: ['Nigeria', 'DRC', 'Cameroon', 'Ghana', 'Tanzania'],
    showSickleCell: true,
    showProtection: true
  },
  {
    id: 'natural-selection',
    title: 'Natural Selection at Work',
    text: 'In areas with high malaria rates, carriers of the sickle cell trait survived and reproduced more successfully. Despite the cost to those with two copies, the gene spread throughout malaria-endemic regions.',
    mapFocus: { center: [15, 15], scale: 350 },
    highlightRegions: ['Nigeria', 'DRC', 'Cameroon', 'Ghana', 'Tanzania'],
    showSickleCell: true,
    showPrevalence: true
  },
  {
    id: 'global-distribution',
    title: 'Today\'s Distribution',
    text: 'Today, sickle cell trait is most common where malaria has historically been deadliest. Up to 25% of people in some African regions carry the gene—a living example of evolution in action.',
    mapFocus: { center: [10, 10], scale: 300 },
    highlightRegions: ['Nigeria', 'DRC', 'Cameroon', 'Ghana', 'Tanzania'],
    showSickleCell: true,
    showPrevalence: true,
    showStats: true
  }
];

// Scrollytelling Map Component
const ScrollytellingMap = ({ step }) => {
  const svgRef = useRef();
  const [worldData, setWorldData] = useState(null);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(topology => {
        const countries = feature(topology, topology.objects.countries);
        setWorldData(countries);
      });
  }, []);

  useEffect(() => {
    if (!worldData) return;

    const width = 1000;
    const height = 600;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0f172a');

    const g = svg.append('g');

    // Default or custom projection based on step
    const projection = d3.geoNaturalEarth1()
      .scale(step.mapFocus?.scale || 200)
      .translate([width / 2, height / 2]);

    if (step.mapFocus?.center) {
      projection.center(step.mapFocus.center);
    }

    const path = d3.geoPath().projection(projection);

    // Draw countries
    g.append('g')
      .selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        if (step.highlightRegions?.includes(d.properties.name)) {
          return step.showMalariaZone ? '#dc2626' : '#1e40af';
        }
        return '#1e293b';
      })
      .attr('stroke', '#475569')
      .attr('stroke-width', 0.5)
      .attr('opacity', d => {
        if (step.highlightRegions?.length === 0) return 0.7;
        return step.highlightRegions?.includes(d.properties.name) ? 1 : 0.3;
      })
      .transition()
      .duration(1000);

    // Show malaria zone overlay
    if (step.showMalariaZone) {
      const malariaRegions = [
        { country: 'Nigeria', lat: 9.082, lng: 8.6753 },
        { country: 'DRC', lat: -4.0383, lng: 21.7587 },
        { country: 'Cameroon', lat: 7.3697, lng: 12.3547 }
      ];

      malariaRegions.forEach(region => {
        const [x, y] = projection([region.lng, region.lat]);
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 0)
          .attr('fill', '#dc2626')
          .attr('opacity', 0.3)
          .transition()
          .duration(1500)
          .attr('r', 60);
      });
    }

    // Show sickle cell markers
    if (step.showSickleCell) {
      const sickleCellData = [
        { country: 'Nigeria', lat: 9.082, lng: 8.6753, prevalence: 24 },
        { country: 'DRC', lat: -4.0383, lng: 21.7587, prevalence: 20 },
        { country: 'Cameroon', lat: 7.3697, lng: 12.3547, prevalence: 18 },
        { country: 'Ghana', lat: 7.9465, lng: -1.0232, prevalence: 15 },
        { country: 'Tanzania', lat: -6.3690, lng: 34.8888, prevalence: 13 }
      ];

      sickleCellData.forEach(region => {
        const [x, y] = projection([region.lng, region.lat]);
        
        if (!x || !y) return;

        // Glow
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', step.showPrevalence ? region.prevalence * 2 : 20)
          .attr('fill', '#ef4444')
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .attr('opacity', 0.2);

        // Marker
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 0)
          .attr('fill', '#ef4444')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .transition()
          .duration(1000)
          .attr('r', 8);

        // Labels with prevalence
        if (step.showPrevalence) {
          g.append('text')
            .attr('x', x)
            .attr('y', y - 25)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', '700')
            .attr('fill', '#fff')
            .attr('opacity', 0)
            .text(`${region.country}: ${region.prevalence}%`)
            .transition()
            .delay(500)
            .duration(800)
            .attr('opacity', 1);
        }
      });
    }

    // Show protection symbol
    if (step.showProtection) {
      const [x, y] = projection([8.6753, 9.082]);
      
      // Shield symbol
      const shield = g.append('g')
        .attr('transform', `translate(${x + 100},${y - 50})`)
        .attr('opacity', 0);

      shield.append('path')
        .attr('d', 'M 0,-20 L 15,0 L 0,25 L -15,0 Z')
        .attr('fill', '#10b981')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      shield.append('text')
        .attr('x', 0)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', '700')
        .attr('fill', '#fff')
        .text('✓');

      shield.transition()
        .duration(1000)
        .attr('opacity', 1);
    }

  }, [worldData, step]);

  if (!worldData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full h-full" />;
};

// Main Scrollytelling Component
export default function ScrollytellingStory() {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollContainerRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollPosition = container.scrollTop;
      const windowHeight = container.clientHeight;
      
      // Calculate which step we're on based on scroll position
      const stepHeight = windowHeight;
      const newStep = Math.min(
        Math.floor(scrollPosition / stepHeight),
        storySteps.length - 1
      );
      
      setCurrentStep(Math.max(0, newStep));
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      {/* Fixed Map Background */}
      <div className="fixed inset-0 z-0">
        <ScrollytellingMap step={storySteps[currentStep]} />
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        className="relative z-10 h-screen overflow-y-scroll"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Intro section - no scroll needed */}
        <div className="h-screen flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-8">
            <h1 className="text-6xl font-bold text-white mb-6 text-center">
              Evolution's Deadly Trade-Off
            </h1>
            <p className="text-2xl text-gray-300 text-center mb-8">
              The Story of Sickle Cell Disease and Malaria
            </p>
            <div className="text-center">
              <div className="inline-block animate-bounce text-white text-4xl">
                ↓
              </div>
              <p className="text-gray-400 mt-2">Scroll to explore</p>
            </div>
          </div>
        </div>

        {/* Story Steps */}
        {storySteps.map((step, index) => (
          <div 
            key={step.id}
            className="min-h-screen flex items-center justify-end p-16"
          >
            <div 
              className={`max-w-xl bg-slate-800/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl transition-all duration-700 ${
                currentStep === index ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-8'
              }`}
            >
              <div className="text-sm font-semibold text-red-400 mb-2">
                Step {index + 1} of {storySteps.length}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {step.title}
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                {step.text}
              </p>
              
              {step.showStats && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-red-400">24%</div>
                    <div className="text-sm text-gray-400">Carrier rate in Nigeria</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-red-400">7,300</div>
                    <div className="text-sm text-gray-400">Years ago mutation arose</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Ending section */}
        <div className="min-h-screen flex items-center justify-center p-16 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="max-w-3xl text-center">
            <h2 className="text-5xl font-bold text-white mb-6">
              A Living Example of Evolution
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Sickle cell disease demonstrates how natural selection operates in real-time, 
              balancing costs and benefits in response to environmental pressures.
            </p>
            <a 
              href="/"
              className="inline-block px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Explore the Interactive Map
            </a>
          </div>
        </div>

        {/* Spacer for scroll */}
        <div className="h-screen"></div>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {storySteps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep ? 'bg-red-500 w-8' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}