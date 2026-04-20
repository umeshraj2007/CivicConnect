import { useState, useMemo, useEffect } from 'react';
import { useAllData } from '../utils/useData';
import { getPartyColor, getFlagUrl } from '../utils/helpers';
import { CardSkeleton } from '../components/Skeletons';
import { History, Trophy, Users, Info, Map as MapIcon, Table, ChevronRight, X } from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import L from 'leaflet';

export default function ElectionResults({ darkMode }) {
  const { 
    electionHistory, 
    partyColors, 
    mapData, // This is cleaned_tn_map.geojson (metadata)
    partyColoursNew, // User provided party_colours.json
    results2021,
    acNames, // Official AC to Name mapping
    loading, 
    error 
  } = useAllData();

  // New state to toggle between History Timeline and 2021 Map
  const [viewMode, setViewMode] = useState('map2021'); // Default to 2021 Map as requested
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);

  // Fetch the geometry file we extracted
  useEffect(() => {
    if (viewMode === 'map2021' && mapData && results2021 && acNames) {
      fetch('/data/tn_constituencies_map.geojson')
        .then(r => r.json())
        .then(data => {
            // Master results map from tn_election_results_2021.json
            const resultsMap = {};
            if (results2021 && results2021.tamil_nadu_election_results) {
                results2021.tamil_nadu_election_results.forEach(res => {
                    resultsMap[res.ac_no] = res;
                });
            }

            // Secondary metadata from cleaned_tn_map.geojson
            const metadataMap = {};
            if (mapData && mapData.features) {
                mapData.features.forEach(f => {
                    metadataMap[f.properties.acNo] = f.properties;
                });
            }

            // Official AC Names map from constituency_name_wrt_ac_no.json
            const nameLookup = {};
            if (acNames) {
                acNames.forEach(n => {
                    nameLookup[n.ac_no] = n.constituency_name;
                });
            }

            // Merge everything into the geometry features
            data.features.forEach(f => {
                const acNo = Math.round(f.properties.AC_NO);
                const res = resultsMap[acNo];
                const meta = metadataMap[acNo];
                const officialName = nameLookup[acNo];
                
                // Prioritize the user's specific 2021 results file for winners/colors
                f.properties = { 
                    ...f.properties, 
                    ...meta,
                    winner: res ? res.candidate_name : (meta ? meta.winner : 'N/A'),
                    winnerParty: res ? res.party : (meta ? meta.winnerParty : 'OTHERS'),
                    votes: res ? res.total_votes : 0,
                    percent: res ? res.votes_polled_percentage : 0,
                    electors: res ? res.total_electors : (meta ? meta.electors : 0),
                    ac_name: officialName || (res ? res.ac_name : (f.properties.AC_NAME || (meta ? meta.ac_name : 'Unknown')))
                };
            });
            setGeoJsonData(data);
        })
        .catch(err => console.error("Error loading map geometry:", err));
    }
  }, [viewMode, mapData, results2021, acNames]);

  const historyData = useMemo(() => electionHistory?.tamil_nadu_all_elections || [], [electionHistory]);

  const uniqueLegend = useMemo(() => {
    if (!partyColoursNew) return [];
    const seenColors = new Set();
    const result = [];
    const priorityParties = ['DMK', 'AIADMK', 'BJP', 'INC', 'PMK', 'NTK', 'MNM', 'TVK', 'DMDK'];
    
    // Process priority parties first
    priorityParties.forEach(name => {
      const color = partyColoursNew[name];
      if (color && !seenColors.has(color.toLowerCase())) {
        seenColors.add(color.toLowerCase());
        result.push({ name, color });
      }
    });

    // Add remaining distinct colors
    Object.entries(partyColoursNew).forEach(([name, color]) => {
      if (color && !seenColors.has(color.toLowerCase()) && name !== 'UNKNOWN' && name !== 'OTHERS') {
        seenColors.add(color.toLowerCase());
        result.push({ name, color });
      }
    });

    return result;
  }, [partyColoursNew]);

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: (e) => {
        setSelectedConstituency(feature.properties);
        L.DomEvent.stopPropagation(e);
      },
      mouseover: (e) => {
        // Just update state, the style prop will handle the rest
        setSelectedConstituency(feature.properties);
      },
      mouseout: (e) => {
        // Optional: clear selection on mouse out if you want it strictly "hover only"
        // setSelectedConstituency(null);
      }
    });
  };

  const geoStyle = (feature) => {
    const winnerParty = feature.properties.winnerParty || 'OTHERS';
    const color = partyColoursNew?.[winnerParty] || '#999999';
    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: 'rgba(255,255,255,0.2)',
      fillOpacity: 0.7,
    };
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-center items-center h-64">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-400">
      <p>Failed to load Election Results. {error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            <History className="w-3 h-3" />
            Electoral Records (1952 — 2021)
          </div>
          <h1 className="font-display text-4xl font-extrabold dark:text-white text-gray-900 mb-2 tracking-tight transition-colors">
            Tamil Nadu <span className="text-brand-400">Election Results</span>
          </h1>
          <p className="dark:text-gray-400 text-gray-600 text-lg max-w-3xl transition-colors">
            Explore legislative assembly results through interactive historical timelines and detailed constituency maps.
          </p>
        </div>

        {/* View Toggle / Result 2021 Button */}
        <div className="flex gap-2 dark:bg-gray-900 bg-gray-100 p-1 rounded-xl border dark:border-gray-800 border-gray-200 shrink-0 transition-colors">
          <button 
            onClick={() => setViewMode('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'history' ? 'bg-brand-600 text-white shadow-lg' : 'dark:text-gray-500 text-gray-600 dark:hover:text-white hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button 
            onClick={() => setViewMode('map2021')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'map2021' ? 'bg-brand-600 text-white shadow-lg' : 'dark:text-gray-500 text-gray-600 dark:hover:text-white hover:text-gray-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            Election Result 2021
          </button>
        </div>
      </div>

      {viewMode === 'history' ? (
        <>
          <h2 className="font-display text-2xl font-bold dark:text-white text-gray-900 mb-6 flex items-center gap-2 transition-colors">
            <Table className="w-5 h-5 text-brand-400" />
            History of Assembly Elections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {historyData.map((year, idx) => {
              const winner = year.party_results[0];
              const flagUrl = getFlagUrl(winner.abbreviation);

              return (
                <div key={idx} className="card p-6 flex flex-col group hover:border-brand-500/40 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl font-display font-black dark:text-gray-800 text-gray-200 group-hover:text-brand-500/20 transition-colors">
                        {year.election_year}
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] dark:text-gray-500 text-gray-600 uppercase font-bold tracking-widest mb-0.5">Total Seats</p>
                      <p className="text-lg font-bold dark:text-white text-gray-900 leading-none transition-colors">{year.total_constituencies}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs dark:text-gray-500 text-gray-600 font-medium mb-2 flex items-center gap-1.5 transition-colors">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      Winning Alliance
                    </p>
                    <p className="text-lg font-display font-bold dark:text-white text-gray-900 leading-tight transition-colors">
                      {year.winning_alliance}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {flagUrl && (
                        <div className="w-8 flag-container">
                          <img src={flagUrl} alt="Flag" />
                        </div>
                      )}
                      <p className="text-sm text-brand-400 font-semibold">{year.chief_minister_elected}</p>
                    </div>

                  </div>

                  <div className="space-y-3 mt-auto">
                    <p className="text-[10px] dark:text-gray-500 text-gray-600 uppercase font-bold tracking-widest border-b dark:border-gray-800 border-gray-200 pb-1 mb-2 transition-colors">Major Results</p>
                    {year.party_results.slice(0, 4).map((p, i) => (
                      <div key={i} className="flex items-center justify-between group/row">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getPartyColor(p.abbreviation, partyColors) }} />
                          <span className="text-xs dark:text-gray-400 text-gray-500 font-medium transition-colors">{p.abbreviation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1 dark:bg-gray-800 bg-gray-200 rounded-full w-20 overflow-hidden transition-colors">
                            <div className="h-full rounded-full" style={{ 
                                width: `${(p.seats_won/year.total_constituencies)*100}%`, 
                                backgroundColor: getPartyColor(p.abbreviation, partyColors) 
                            }} />
                          </div>
                          <span className="text-xs font-bold dark:text-white text-gray-900 w-6 text-right transition-colors">{p.seats_won}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-2 card p-0 overflow-hidden h-[700px] relative">
            <div className="absolute top-4 right-4 z-[1000] dark:bg-gray-900/90 bg-white/95 backdrop-blur-md p-3 rounded-xl border dark:border-gray-700 border-gray-200 shadow-2xl transition-colors">
                <p className="text-[10px] uppercase font-bold dark:text-gray-500 text-gray-600 mb-2 tracking-widest transition-colors">Map Legend</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 min-w-[180px]">
                   {uniqueLegend.slice(0, 14).map(({ name, color }) => (
                       <div key={name} className="flex items-center gap-2 group transition-all">
                          <div className="w-2.5 h-2.5 rounded-full ring-1 ring-black/5 dark:ring-white/10" style={{ backgroundColor: color }} />
                          <span className="text-[10px] font-bold dark:text-gray-400 text-gray-600 dark:group-hover:text-white group-hover:text-gray-950 transition-colors uppercase tracking-tighter">{name}</span>
                       </div>
                   ))}
                </div>
            </div>

            <MapContainer 
              center={[10.8, 78.5]} 
              zoom={7} 
              style={{ height: '100%', width: '100%', background: darkMode ? '#020617' : '#ffffff' }}
              zoomControl={true}
              scrollWheelZoom={true}
              doubleClickZoom={true}
              touchZoom={true}
              dragging={true}
              preferCanvas={true}
              attributionControl={false}
            >

              {geoJsonData && (
                <GeoJSON 
                  data={geoJsonData} 
                  style={(feature) => {
                    const isSelected = selectedConstituency && Math.round(feature.properties.AC_NO) === Math.round(selectedConstituency.AC_NO);
                    const winnerParty = feature.properties.winnerParty || 'OTHERS';
                    const color = partyColoursNew?.[winnerParty] || '#999999';
                    return {
                      fillColor: color,
                      weight: isSelected ? 2.5 : 0.4,
                      opacity: isSelected ? 1 : 0.4,
                      color: '#fff',
                      fillOpacity: isSelected ? 1 : 0.85,
                    };
                  }}
                  onEachFeature={onEachFeature}
                />
              )}
            </MapContainer>
          </div>          {/* Details Column */}
          <div className="card p-6 flex flex-col h-[700px] dark:bg-gray-950 bg-white shadow-xl transition-colors">
             {selectedConstituency ? (
                <div className="animate-fade-in flex flex-col h-full">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 min-w-0">
                         <p className="text-brand-500 text-xs font-black uppercase tracking-widest">Detail View</p>
                         <h2 className="text-2xl font-display font-black dark:text-white text-gray-900 truncate transition-colors">{selectedConstituency.ac_name}</h2>
                         <p className="dark:text-gray-500 text-gray-400 font-bold transition-colors">AC No. {selectedConstituency.AC_NO}</p>
                      </div>
                      <button onClick={() => setSelectedConstituency(null)} className="p-2 dark:hover:bg-gray-800 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                         <X className="w-5 h-5 dark:text-gray-500 text-gray-400" />
                      </button>
                   </div>
 
                   <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="p-4 rounded-xl dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 bg-gray-50 border dark:border-gray-700 border-gray-100 shadow-xl transition-colors">
                         <p className="text-[10px] dark:text-gray-500 text-gray-400 font-black uppercase mb-3 transition-colors">2021 Result</p>
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg dark:bg-gray-950 bg-white flex items-center justify-center text-xl font-bold border-2 transition-colors" style={{ borderColor: partyColoursNew?.[selectedConstituency.winnerParty] }}>
                               {selectedConstituency.winnerParty?.[0]}
                            </div>
                            <div>
                               <p className="text-xl font-display font-black dark:text-white text-gray-900 leading-tight transition-colors">{selectedConstituency.winner}</p>
                               <p className="font-bold text-sm" style={{ color: partyColoursNew?.[selectedConstituency.winnerParty] }}>{selectedConstituency.winnerParty}</p>
                            </div>
                         </div>
                         <div className="mt-4 pt-4 border-t dark:border-gray-700/50 border-gray-200 flex justify-between gap-4 transition-colors">
                            <div>
                               <p className="text-[10px] dark:text-gray-500 text-gray-400 uppercase font-bold transition-colors">Votes</p>
                               <p className="text-lg font-black dark:text-white text-gray-900 transition-colors">{selectedConstituency.votes?.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] dark:text-gray-500 text-gray-400 uppercase font-bold transition-colors">Vote Share</p>
                               <p className="text-lg font-black text-brand-600 dark:text-brand-400 transition-colors">{selectedConstituency.percent}%</p>
                            </div>
                         </div>
                      </div>

                      <div>
                         <p className="text-[10px] dark:text-gray-500 text-gray-400 font-black uppercase mb-3 border-b dark:border-gray-800 border-gray-100 pb-1 transition-colors">Major Competitors</p>
                         <div className="space-y-2">
                             {(selectedConstituency.competitors || []).slice(0, 5).map((comp, idx) => (
                                 <div key={idx} className="p-3 dark:bg-gray-900/40 bg-gray-50 rounded-lg border dark:border-gray-800/30 border-gray-100 flex items-center justify-between group dark:hover:bg-gray-800/50 hover:bg-gray-100 transition-colors">
                                    <span className="text-sm dark:text-gray-300 text-gray-700 font-bold truncate flex-1 transition-colors">{comp}</span>
                                 </div>
                             ))}
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pb-4">
                         <div className="p-3 dark:bg-gray-900/60 bg-gray-50 rounded-xl border dark:border-gray-800 border-gray-100 transition-colors">
                             <p className="text-[10px] dark:text-gray-500 text-gray-400 uppercase font-bold transition-colors">Total Electors</p>
                             <p className="text-base font-black dark:text-white text-gray-900 transition-colors">{selectedConstituency.electors?.toLocaleString()}</p>
                         </div>
                         <div className="p-3 dark:bg-gray-900/60 bg-gray-50 rounded-xl border dark:border-gray-800 border-gray-100 transition-colors">
                             <p className="text-[10px] dark:text-gray-500 text-gray-400 uppercase font-bold transition-colors">Field Size</p>
                             <p className="text-base font-black dark:text-white text-gray-900 transition-colors">{selectedConstituency.totalCandidates || 15}+</p>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                   <div className="w-20 h-20 rounded-full dark:bg-gray-900 bg-gray-100 flex items-center justify-center mb-6 transition-colors">
                      <MapIcon className="w-8 h-8 dark:text-gray-600 text-gray-400" />
                   </div>
                   <h3 className="text-xl font-display font-black dark:text-white text-gray-900 mb-2 transition-colors">Election Results Map</h3>
                   <p className="dark:text-gray-500 text-gray-600 text-sm transition-colors">Select a constituency on the map to view detailed 2021 election data, winners, and competitors.</p>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
