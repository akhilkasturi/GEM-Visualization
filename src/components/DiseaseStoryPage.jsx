import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

// Story data for each disease
const storyData = {
  'sickle-cell': {
    title: "Evolution's Deadly Trade-Off",
    subtitle: "The Story of Sickle Cell Disease and Malaria",
    steps: [
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
        showThreat: true
      },
      {
        id: 'sickle-cell-emerges',
        title: 'A Mutation Emerges',
        text: 'Around 7,300 years ago in West Africa, a mutation occurred in the HBB gene. This single change (Glu6Val) causes red blood cells to become sickle-shaped, leading to painful episodes and shorter lifespan.',
        mapFocus: { center: [10, 8], scale: 800 },
        highlightRegions: ['Nigeria', 'Cameroon', 'Ghana'],
        showMarkers: true,
        markerColor: '#ef4444'
      },
      {
        id: 'the-advantage',
        title: 'The Hidden Advantage',
        text: 'People with ONE copy of the sickle cell gene (carriers) have a remarkable resistance to malaria. The parasite cannot thrive in their modified red blood cells. This protection was a game-changer in malaria zones.',
        mapFocus: { center: [10, 8], scale: 600 },
        highlightRegions: ['Nigeria', 'DRC', 'Cameroon', 'Ghana', 'Tanzania'],
        showMarkers: true,
        showProtection: true,
        markerColor: '#ef4444'
      },
      {
        id: 'natural-selection',
        title: 'Natural Selection at Work',
        text: 'In areas with high malaria rates, carriers of the sickle cell trait survived and reproduced more successfully. Despite the cost to those with two copies, the gene spread throughout malaria-endemic regions.',
        mapFocus: { center: [15, 15], scale: 350 },
        highlightRegions: ['Nigeria', 'DRC', 'Cameroon', 'Ghana', 'Tanzania'],
        showMarkers: true,
        showPrevalence: true,
        markerColor: '#ef4444'
      },
      {
        id: 'global-distribution',
        title: 'Today\'s Distribution',
        text: 'Today, sickle cell trait is most common where malaria has historically been deadliest. Up to 25% of people in some African regions carry the gene—a living example of evolution in action.',
        mapFocus: { center: [10, 10], scale: 300 },
        highlightRegions: ['Nigeria', 'DRC', 'Cameroon', 'Ghana', 'Tanzania'],
        showMarkers: true,
        showPrevalence: true,
        showStats: true,
        markerColor: '#ef4444',
        stats: [
          { label: 'Carrier rate in Nigeria', value: '24%' },
          { label: 'Years ago mutation arose', value: '7,300' }
        ]
      }
    ]
  },
  'lactose-intolerance': {
    title: "The Dairy Revolution",
    subtitle: "How Humans Evolved to Drink Milk",
    steps: [
      {
        id: 'intro',
        title: 'An Unusual Ability',
        text: 'Most mammals lose the ability to digest milk after weaning. Yet some human populations can drink milk throughout their lives. This is a recent evolutionary adaptation—and it tells a fascinating story.',
        mapFocus: null,
        highlightRegions: []
      },
      {
        id: 'ancient-world',
        title: 'The Ancient Default',
        text: 'For most of human history, and still today for most of the world, adults couldn\'t digest lactose. After childhood, the lactase enzyme that breaks down milk sugar shuts off.',
        mapFocus: { center: [100, 30], scale: 300 },
        highlightRegions: ['China', 'Japan', 'South Korea', 'Thailand', 'Vietnam'],
        showMarkers: true,
        markerColor: '#3b82f6'
      },
      {
        id: 'farming-begins',
        title: 'The Dairy Farming Revolution',
        text: 'Around 10,000 years ago in Northern Europe, humans began domesticating cattle. Having a source of nutritious milk as adults would be a huge survival advantage—if only they could digest it.',
        mapFocus: { center: [-10, 55], scale: 600 },
        highlightRegions: [],
        showFarmingZone: true
      },
      {
        id: 'mutation-spreads',
        title: 'A Powerful Mutation',
        text: 'A genetic mutation in the MCM6 gene kept the lactase enzyme active into adulthood. In populations relying on dairy, this mutation provided crucial nutrition and spread rapidly through natural selection.',
        mapFocus: { center: [0, 50], scale: 400 },
        highlightRegions: [],
        showProtection: true
      },
      {
        id: 'today',
        title: 'Modern Distribution',
        text: 'Today, lactase persistence is common in Northern European populations (90%+) and some African pastoralist groups, while remaining rare in East Asia (10-15%). Your genes reflect your ancestors\' diet.',
        mapFocus: { center: [50, 30], scale: 200 },
        highlightRegions: ['China', 'Japan', 'South Korea', 'Thailand', 'Vietnam', 'Nigeria'],
        showMarkers: true,
        showPrevalence: true,
        markerColor: '#3b82f6',
        stats: [
          { label: 'Lactose intolerant in China', value: '90%' },
          { label: 'Years since mutation', value: '~10,000' }
        ]
      }
    ]
  },
  'thalassemia': {
    title: "The Mediterranean Shield",
    subtitle: "Thalassemia and Ancient Malaria",
    steps: [
      {
        id: 'intro',
        title: 'A Mediterranean Mystery',
        text: 'Why is a serious blood disorder so common around the Mediterranean Sea? The answer lies beneath the surface—in the mosquitoes that once plagued these shores.',
        mapFocus: null,
        highlightRegions: []
      },
      {
        id: 'ancient-mediterranean',
        title: 'The Malaria Zone',
        text: 'For thousands of years, malaria was endemic throughout the Mediterranean basin. From Greece to Cyprus to Italy, the disease shaped human populations and their genetics.',
        mapFocus: { center: [25, 38], scale: 600 },
        highlightRegions: ['Cyprus', 'Italy', 'Greece'],
        showThreat: true
      },
      {
        id: 'mutation',
        title: 'A Protective Mutation',
        text: 'Mutations in the hemoglobin genes (HBB and HBA) cause thalassemia. Like sickle cell, carriers have altered red blood cells that resist malaria infection, providing a survival advantage.',
        mapFocus: { center: [30, 35], scale: 500 },
        highlightRegions: ['Cyprus', 'Italy', 'Greece', 'Iran'],
        showMarkers: true,
        markerColor: '#f59e0b'
      },
      {
        id: 'spread',
        title: 'East Meets West',
        text: 'The mutation spread throughout the Mediterranean, Middle East, and into Southeast Asia—everywhere malaria was endemic. The highest carrier rates remain where malaria was historically deadliest.',
        mapFocus: { center: [60, 25], scale: 250 },
        highlightRegions: ['Cyprus', 'Italy', 'Greece', 'Thailand', 'India', 'Pakistan', 'Iran'],
        showMarkers: true,
        showPrevalence: true,
        markerColor: '#f59e0b'
      },
      {
        id: 'today',
        title: 'A Living Legacy',
        text: 'Today, thalassemia carrier rates reach 16% in Cyprus and remain high across former malaria zones. Modern medicine has largely eliminated Mediterranean malaria, but the genetic legacy persists.',
        mapFocus: { center: [50, 30], scale: 220 },
        highlightRegions: ['Cyprus', 'Italy', 'Greece', 'Thailand', 'India', 'Pakistan', 'Iran'],
        showMarkers: true,
        showPrevalence: true,
        markerColor: '#f59e0b',
        stats: [
          { label: 'Carrier rate in Cyprus', value: '16%' },
          { label: 'Global carriers', value: '~80M' }
        ]
      }
    ]
  },
  'g6pd-deficiency': {
    title: "The Third Shield",
    subtitle: "G6PD Deficiency and Malaria Resistance",
    steps: [
      {
        id: 'intro',
        title: 'Another Defense',
        text: 'G6PD deficiency is the most common human enzyme defect, affecting 400 million people worldwide. Like sickle cell and thalassemia, it tells a story of evolution versus malaria.',
        mapFocus: null,
        highlightRegions: []
      },
      {
        id: 'enzyme',
        title: 'A Critical Enzyme',
        text: 'G6PD (glucose-6-phosphate dehydrogenase) protects red blood cells from oxidative damage. Without it, certain foods and drugs can trigger cell breakdown—but there\'s an upside.',
        mapFocus: { center: [30, 20], scale: 300 },
        highlightRegions: ['Nigeria', 'Greece', 'Saudi Arabia', 'India', 'Iraq'],
        showMarkers: true,
        markerColor: '#8b5cf6'
      },
      {
        id: 'malaria-resistance',
        title: 'The Malaria Connection',
        text: 'G6PD-deficient cells don\'t provide a good home for malaria parasites. The same instability that can be harmful also prevents the parasite from thriving, offering protection.',
        mapFocus: { center: [25, 15], scale: 400 },
        highlightRegions: ['Nigeria', 'Greece', 'Saudi Arabia', 'India', 'Iraq'],
        showMarkers: true,
        showProtection: true,
        markerColor: '#8b5cf6'
      },
      {
        id: 'x-linked',
        title: 'An X-Linked Pattern',
        text: 'G6PD is on the X chromosome, so it primarily affects males (who have only one X). In malaria zones, up to 25% of males carry the deficiency—a clear sign of selection pressure.',
        mapFocus: { center: [20, 10], scale: 350 },
        highlightRegions: ['Nigeria', 'Greece', 'Saudi Arabia', 'India', 'Iraq'],
        showMarkers: true,
        showPrevalence: true,
        markerColor: '#8b5cf6',
        stats: [
          { label: 'Affected males in Nigeria', value: '20%' },
          { label: 'People affected globally', value: '400M' }
        ]
      }
    ]
  }
};

// Generic Scrollytelling Map Component
const StoryMap = ({ step, diseaseId }) => {
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
          return step.showThreat ? '#dc2626' : '#1e40af';
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

    // Show threat zones
    if (step.showThreat && step.highlightRegions) {
      step.highlightRegions.forEach((_, idx) => {
        const randomLng = Math.random() * 60 - 10;
        const randomLat = Math.random() * 40 - 10;
        const [x, y] = projection([randomLng, randomLat]);
        
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 0)
          .attr('fill', '#dc2626')
          .attr('opacity', 0.3)
          .transition()
          .delay(idx * 200)
          .duration(1500)
          .attr('r', 50);
      });
    }

    // Show farming zone
    if (step.showFarmingZone) {
      const farmingArea = [
        [projection([0, 50]), projection([20, 60])],
      ];
      
      g.append('ellipse')
        .attr('cx', width / 2 - 50)
        .attr('cy', height / 3)
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('fill', '#10b981')
        .attr('opacity', 0.2)
        .transition()
        .duration(1500)
        .attr('rx', 150)
        .attr('ry', 80);
    }

    // Get disease-specific data
    const diseaseRegions = {
      'sickle-cell': [
        { country: 'Nigeria', lat: 9.082, lng: 8.6753, prevalence: 24 },
        { country: 'DRC', lat: -4.0383, lng: 21.7587, prevalence: 20 },
        { country: 'Cameroon', lat: 7.3697, lng: 12.3547, prevalence: 18 },
        { country: 'Ghana', lat: 7.9465, lng: -1.0232, prevalence: 15 },
        { country: 'Tanzania', lat: -6.3690, lng: 34.8888, prevalence: 13 }
      ],
      'lactose-intolerance': [
        { country: 'China', lat: 35.8617, lng: 104.1954, prevalence: 90 },
        { country: 'Japan', lat: 36.2048, lng: 138.2529, prevalence: 85 },
        { country: 'South Korea', lat: 35.9078, lng: 127.7669, prevalence: 75 },
        { country: 'Thailand', lat: 15.8700, lng: 100.9925, prevalence: 90 },
        { country: 'Vietnam', lat: 14.0583, lng: 108.2772, prevalence: 87 },
        { country: 'Nigeria', lat: 9.082, lng: 8.6753, prevalence: 89 }
      ],
      'thalassemia': [
        { country: 'Cyprus', lat: 35.1264, lng: 33.4299, prevalence: 16 },
        { country: 'Italy', lat: 41.8719, lng: 12.5674, prevalence: 7 },
        { country: 'Greece', lat: 39.0742, lng: 21.8243, prevalence: 8 },
        { country: 'Thailand', lat: 15.8700, lng: 100.9925, prevalence: 5 },
        { country: 'India', lat: 20.5937, lng: 78.9629, prevalence: 3 },
        { country: 'Pakistan', lat: 30.3753, lng: 69.3451, prevalence: 5 },
        { country: 'Iran', lat: 32.4279, lng: 53.6880, prevalence: 6 }
      ],
      'g6pd-deficiency': [
        { country: 'Greece', lat: 39.0742, lng: 21.8243, prevalence: 15 },
        { country: 'Saudi Arabia', lat: 23.8859, lng: 45.0792, prevalence: 12 },
        { country: 'India', lat: 20.5937, lng: 78.9629, prevalence: 10 },
        { country: 'Iraq', lat: 33.2232, lng: 43.6793, prevalence: 13 },
        { country: 'Nigeria', lat: 9.082, lng: 8.6753, prevalence: 20 }
      ]
    };

    // Show markers
    if (step.showMarkers && diseaseRegions[diseaseId]) {
      diseaseRegions[diseaseId].forEach(region => {
        const [x, y] = projection([region.lng, region.lat]);
        
        if (!x || !y) return;

        // Glow
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', step.showPrevalence ? region.prevalence * 2 : 20)
          .attr('fill', step.markerColor || '#ef4444')
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .attr('opacity', 0.2);

        // Marker
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 0)
          .attr('fill', step.markerColor || '#ef4444')
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
      const [x, y] = projection([step.mapFocus?.center[0] || 0, step.mapFocus?.center[1] || 0]);
      
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

  }, [worldData, step, diseaseId]);

  if (!worldData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full h-full" />;
};

// Generic Disease Story Component
export default function DiseaseStoryPage({ diseaseId, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollContainerRef = useRef();

  const story = storyData[diseaseId];

  if (!story) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Story not available for this disease</div>
      </div>
    );
  }

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollPosition = container.scrollTop;
      const windowHeight = container.clientHeight;
      
      const stepHeight = windowHeight;
      const newStep = Math.min(
        Math.floor(scrollPosition / stepHeight),
        story.steps.length - 1
      );
      
      setCurrentStep(Math.max(0, newStep));
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [story.steps.length]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 px-6 py-3 bg-white/90 hover:bg-white text-gray-900 font-semibold rounded-lg shadow-lg transition-colors"
      >
        ← Back to Details
      </button>

      {/* Fixed Map Background */}
      <div className="fixed inset-0 z-0">
        <StoryMap step={story.steps[currentStep]} diseaseId={diseaseId} />
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        className="relative z-10 h-screen overflow-y-scroll"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Intro section */}
        <div className="h-screen flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-8">
            <h1 className="text-6xl font-bold text-white mb-6 text-center">
              {story.title}
            </h1>
            <p className="text-2xl text-gray-300 text-center mb-8">
              {story.subtitle}
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
        {story.steps.map((step, index) => (
          <div 
            key={step.id}
            className="min-h-screen flex items-center justify-end p-16"
          >
            <div 
              className={`max-w-xl bg-slate-800/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl transition-all duration-700 ${
                currentStep === index ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-8'
              }`}
            >
              <div className="text-sm font-semibold text-indigo-400 mb-2">
                Step {index + 1} of {story.steps.length}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {step.title}
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                {step.text}
              </p>
              
              {step.stats && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {step.stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-indigo-400">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Ending section */}
        <div className="min-h-screen flex items-center justify-center p-16 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="max-w-3xl text-center">
            <h2 className="text-5xl font-bold text-white mb-6">
              Evolution in Action
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              This disease demonstrates how natural selection operates in real-time, 
              balancing costs and benefits in response to environmental pressures.
            </p>
            <button 
              onClick={onBack}
              className="inline-block px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Disease Details
            </button>
          </div>
        </div>

        {/* Spacer for scroll */}
        <div className="h-screen"></div>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {story.steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep ? 'bg-indigo-500 w-8' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}