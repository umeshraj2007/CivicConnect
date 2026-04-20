const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');

async function testNews() {
  const feeds = [
    { url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss", name: "The Hindu TN" },
    { url: "https://news.google.com/rss/search?q=Tamil+Nadu+Politics+Elections&hl=en-IN&gl=IN&ceid=IN:en", name: "Political Desk" }
  ];

  for (const feed of feeds) {
    try {
      console.log(`Fetching: ${feed.name}`);
      const freshUrl = feed.url + '?t=' + Date.now();
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(freshUrl)}`);
      const data = await response.json();
      const xmlText = data.contents;
      
      const dom = new JSDOM(xmlText, { contentType: "text/xml" });
      const doc = dom.window.document;
      const entries = doc.querySelectorAll("item, entry");
      
      console.log(`Found ${entries.length} entries`);
      if (entries.length > 0) {
        const node = entries[0];
        const title = node.querySelector("title")?.textContent;
        const linkElem = node.querySelector("link");
        const link = linkElem?.getAttribute("href") || linkElem?.textContent;
        console.log(`- Title: ${title}`);
        console.log(`- Link: ${link}`);
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

testNews();
