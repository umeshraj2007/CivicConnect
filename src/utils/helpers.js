export const formatNumber = (n) => {
  if (n == null) return '—';
  if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return (n / 100000).toFixed(2) + ' L';
  return n.toLocaleString('en-IN');
};

export const formatPct = (str) => {
  if (!str || str === 'nan') return '—';
  return str.endsWith('%') ? str : str + '%';
};

export const getPartyColor = (party, colors = {}) => {
  if (!party) return '#607D8B';
  return colors[party] || colors[party?.toUpperCase()] || '#607D8B';
};

export const getPartyFullName = (abbr, lookup = {}) => {
  return lookup[abbr] || abbr;
};

export const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const val = typeof key === 'function' ? key(item) : item[key];
    if (!acc[val]) acc[val] = [];
    acc[val].push(item);
    return acc;
  }, {});
};

export const uniqueValues = (arr, key) =>
  [...new Set(arr.map((i) => i[key]).filter(Boolean))].sort();

export const slugify = (str) =>
  str?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

export const getFlagUrl = (abbr) => {
  if (!abbr) return null;
  // Handle some common deviations or normalization
  const original = abbr.trim();
  let processedAbbr = original;
  let extension = 'jpg';
  
  // Specific mappings based on file availability in /data/Parties_Flag/
  if (processedAbbr === "CPI(M)" || processedAbbr === "CPM" || processedAbbr.toLowerCase().includes("marxist")) {
    processedAbbr = "CPI(Marxixt)";
  } else if (processedAbbr.includes("INC") && processedAbbr !== "TNCC") {
    processedAbbr = "INC";
  } else if (processedAbbr === "TMC(M)" || processedAbbr === "Moopanar" || processedAbbr === "TMC") {
    processedAbbr = "TMC(M)";
  } else if (processedAbbr === "PT" || processedAbbr === "Puthiya Tamilagam") {
    processedAbbr = "PT";
    extension = 'webp';
  } else if (processedAbbr === "ADMK") {
    processedAbbr = "AIADMK";
  }

  // Files are in /flags/ relative to public root
  return `/flags/${processedAbbr}.${extension}`;
};

