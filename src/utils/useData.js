import { useState, useEffect } from 'react';

export function useJson(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fetchUrl = import.meta.env.DEV ? `${url}?t=${Date.now()}` : url;
    fetch(fetchUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
        return r.json();
      })
      .then((json) => { if (!cancelled) { setData(json); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

export function useAllData() {
  const constituencies = useJson('/data/constituencies.json');
  const history = useJson('/data/constituency_history.json');
  const parties = useJson('/data/parties.json');
  const partyColors = useJson('/data/colors.json');
  const manifesto = useJson('/data/manifesto.json');
  const partyLookup = useJson('/data/party_lookup.json');
  const partyDetails = useJson('/data/political_parties_details.json');
  const cmData = useJson('/data/tami_nadu_CM_data.json');
  const politicalLeaders = useJson('/data/tamil_nadu_political_leaders_bio_data.json');

  const electionHistory = useJson('/data/tamil_nadu_all_election_results.json');
  const upcomingElections = useJson('/data/tamil_nadu_upcoming_election.json');

  const mapData = useJson('/data/cleaned_tn_map.geojson');
  const partyColoursNew = useJson('/data/party_colours.json');
  const results2021 = useJson('/data/tn_election_results_2021.json');
  const acNames = useJson('/data/constituency_name_wrt_ac_no.json');
  const candidatesNew = useJson('/data/candidates_bundle.json');
  const competitors2021 = useJson('/data/tamilnadu_constituencies_with_competitors.geojson');

  const loading = [
    constituencies, history, parties, partyColors, manifesto, partyLookup,
    partyDetails, cmData, politicalLeaders, electionHistory, upcomingElections,
    mapData, partyColoursNew, results2021, acNames, candidatesNew, competitors2021
  ].some((d) => d.loading);

  const error = [
    constituencies, history, parties, partyColors, manifesto, partyLookup,
    partyDetails, cmData, politicalLeaders, electionHistory, upcomingElections,
    mapData, partyColoursNew, results2021, acNames, candidatesNew, competitors2021
  ].find((d) => d.error)?.error || null;

  // 1. Initialize variables for consistent return
  let processedParties = parties.data || [];
  let individualParties = [];
  let partyWins = {};

  if (parties.data && results2021.data) {
    const SPA_PARTIES = ['DMK', 'INC', 'VCK', 'CPI', 'CPI(M)', 'CPM', 'MDMK', 'IUML', 'MMK', 'KNMDK', 'MVK'];
    const NDA_PARTIES = ['ADMK', 'AIADMK', 'BJP', 'PMK', 'TMC(M)'];

    const wins = results2021.data.tamil_nadu_election_results || [];
    const counts = { spa: 0, nda: 0, ntk: 0, tvk: 0, ind: 0, others: 0 };

    wins.forEach(w => {
      const p = w.party?.toUpperCase();
      if (SPA_PARTIES.includes(p)) counts.spa++;
      else if (NDA_PARTIES.includes(p)) counts.nda++;
      else if (p === 'NTK') counts.ntk++;
      else if (p === 'TVK') counts.tvk++;
      else if (p === 'IND') counts.ind++;
      else counts.others++;
    });

    // 2. Aggregate current candidate stats (2026 data)
    const candidates = candidatesNew.data || [];
    const allianceStats = {};
    const partyStats = {};

    // Create AC No -> Name Map
    const acToNameMap = {};
    if (Array.isArray(acNames.data)) {
      acNames.data.forEach(item => {
        acToNameMap[item.ac_no] = item.constituency_name;
      });
    }

    candidates.forEach(c => {
      // Enrich candidate with constituency name
      c.constituencyName = acToNameMap[c.acNo] || `AC ${c.acNo}`;

      const alliance = c.alliance?.toLowerCase();
      const party = c.party?.toUpperCase();

      // Aggregate by Alliance
      if (alliance) {
        if (!allianceStats[alliance]) allianceStats[alliance] = { total: 0, women: 0 };
        allianceStats[alliance].total++;
        if (c.gender?.toLowerCase() === 'female') allianceStats[alliance].women++;
      }

      // Aggregate by Individual Party
      if (party) {
        if (!partyStats[party]) partyStats[party] = { total: 0, women: 0 };
        partyStats[party].total++;
        if (c.gender?.toLowerCase() === 'female') partyStats[party].women++;
      }
    });

    // 3. New Individual Parties Mapping
    const details = partyDetails.data?.political_parties_details || [];
    partyWins = (results2021.data?.tamil_nadu_election_results || []).reduce((acc, w) => {
      const p = w.party?.toUpperCase();
      if (p) acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});

    individualParties = details.map(d => {
      const abbr = d.abbreviation?.toUpperCase();
      const stats = partyStats[abbr] || { total: 0, women: 0 };

      // Map to alliance ID for grouping
      let allianceId = 'OTHER';
      if (SPA_PARTIES.includes(abbr)) allianceId = 'spa';
      else if (NDA_PARTIES.includes(abbr)) allianceId = 'nda';
      else if (abbr === 'NTK') allianceId = 'ntk';
      else if (abbr === 'TVK') allianceId = 'tvk';

      return {
        ...d,
        id: abbr,
        short: abbr,
        name: d.party_name,
        allianceId,
        candidates: stats.total,
        womenCandidates: stats.women,
        existingSeats: partyWins[abbr] || 0,
        color: partyColors.data?.[abbr] || '#607D8B'
      };
    });

    processedParties = parties.data.map(p => {
      const idStr = p.id?.toLowerCase();
      const short = p.short?.toUpperCase();
      const stats = partyStats[short] || allianceStats[idStr] || { total: 0, women: 0 };

      return {
        ...p,
        existingSeats: counts[idStr] || 0,
        candidates: stats.total,
        womenCandidates: stats.women,
        projectedSeats: 0
      };
    });
  }

  return {
    constituencies: constituencies.data,
    history: history.data,
    parties: processedParties,
    individualParties: individualParties,
    partyWiseResults: Object.entries(partyWins).map(([name, seats]) => ({ name, seats })).sort((a, b) => b.seats - a.seats),
    partyColors: partyColors.data,
    partyColoursNew: partyColoursNew.data,
    manifesto: manifesto.data,
    partyLookup: partyLookup.data,
    partyDetails: partyDetails.data,
    cmData: cmData.data,
    politicalLeaders: politicalLeaders.data,
    electionHistory: electionHistory.data,
    upcomingElections: upcomingElections.data,
    mapData: mapData.data,
    results2021: results2021.data,
    acNames: acNames.data,
    candidates: candidatesNew.data,
    competitors: competitors2021.data,
    loading,
    error,
  };
}




