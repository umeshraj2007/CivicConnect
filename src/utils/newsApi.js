const NEWS_FEEDS = [
  { url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss", name: "The Hindu TN" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/2950623.cms", name: "TOI Chennai" },
  { url: "https://news.google.com/rss/search?q=Tamil+Nadu+Politics+Elections&hl=en-IN&gl=IN&ceid=IN:en", name: "Political Desk" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", name: "The Hindu National" }
];



/**
 * Robust fetch news using a CORS proxy.
 * Support search query for candidates.
 */
const KEYWORDS = {
  "Election Prep": ["election", "polls", "voting", "campaign", "constituency", "preparations", "voter"],
  "Alliance News": ["alliance", "seat sharing", "dmk+", "nda+", "spa", "pact", "coalition"],
  "Party Strategy": ["dmk", "aiadmk", "bjp", "ntk", "tvk", "inc", "strategy", "manifesto"],
  "Policy & Reform": ["scheme", "welfare", "policy", "project", "infrastructure", "announcement", "government"],
  "Field Report": ["protest", "rally", "meeting", "gathering", "speech", "incident", "ground"]
};

function deriveCategory(title = "", description = "") {
  const text = (title + " " + description).toLowerCase();
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => text.includes(w))) return cat;
  }
  return "Political Update";
}

/**
 * Robust fetch news using a CORS proxy.
 * Support search query for candidates.
 */
export async function fetchNews(query = '') {
  // Use strictly targeted search feeds if a candidate query is provided
  const feeds = query 
    ? [{ 
        url: `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' Tamil Nadu Politics')}&hl=en-IN&gl=IN&ceid=IN:en`, 
        name: "Pulse Search" 
      }]
    : [...NEWS_FEEDS];

  try {
    const timestamp = Date.now();
    const promises = feeds.map(async (feed) => {
      try {
        const freshUrl = feed.url + (feed.url.includes('?') ? '&' : '?') + 't=' + timestamp;
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(freshUrl)}`);

        if (!response.ok) return [];
        
        const data = await response.json();
        const xmlText = data.contents;
        if (!xmlText) return [];

        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");
        const entries = xml.querySelectorAll("item, entry");
        
        return Array.from(entries).slice(0, 12).map(node => {
          const title = (node.querySelector("title")?.textContent || "No Title").trim();
          
          // Improved Link Resolution
          let link = "#";
          const linkNode = node.querySelector("link");
          if (linkNode) {
            link = linkNode.getAttribute("href") || linkNode.textContent || "#";
          }
          // Fallback to GUID if link is invalid or #
          if (link === "#" || !link.startsWith("http")) {
            const guid = node.querySelector("guid")?.textContent;
            if (guid && guid.startsWith("http")) link = guid;
          }

          const pubDate = node.querySelector("pubDate, published, updated")?.textContent || new Date().toISOString();
          
          let description = "";
          const descNode = node.querySelector("description") || 
                          node.querySelector("content\\:encoded") || 
                          node.querySelector("summary") || 
                          node.querySelector("content");
          if (descNode) {
            description = (descNode.textContent || descNode.innerHTML || "").replace(/<[^>]*>?/gm, '').trim();
          }

          return {
            title,
            link: link.trim(),
            description,
            pubDate,
            feedName: feed.name,
            category: deriveCategory(title, description),
            isBreaking: (Date.now() - new Date(pubDate).getTime()) < 3 * 3600000 // 3 hours
          };
        });
      } catch (err) {
        console.warn(`Feed ${feed.name} failed:`, err);
        return [];
      }
    });

    const results = await Promise.all(promises);
    const allItems = results.flat();

    if (allItems.length === 0) return getFallbackNews();

    return allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  } catch (error) {
    console.error("News fetch error:", error);
    return getFallbackNews();
  }
}

function getFallbackNews() {
  const now = new Date().toISOString();
  return [
    {
      title: "Tamil Nadu Political Archive: Latest updates on 2026 ground strategy",
      link: "https://www.thehindu.com/news/national/tamil-nadu/",
      pubDate: now,
      feedName: "The Hindu Archive",
      category: "Archive",
      isBreaking: false
    },
    {
      title: "Regional Election Pulse: Strategic developments in major alliances",
      link: "https://timesofindia.indiatimes.com/city/chennai",
      pubDate: now,
      feedName: "TOI Archive",
      category: "Archive",
      isBreaking: false
    },
    {
       title: "Election Intelligence: Search live updates for TN Election 2026",
       link: "https://news.google.com/search?q=Tamil+Nadu+Politics",
       pubDate: now,
       feedName: "Google News",
       category: "Search",
       isBreaking: false
    }
  ];
}

