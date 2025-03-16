import nlp from "compromise";

const parseCommand = (text) => {
  text = String(text).toLowerCase().trim();
  const doc = nlp(text);
  
  const result = {
    task: null,
    website: null,
    query: null,
    username: null,
    password: null,
    options: {}
  };
  
  if (/\b(open|launch|visit|go to|navigate to|browse|show)\b/.test(text)) {
    result.task = "open";
  } else if (/\b(search|find|look up|query|seek|hunt for|research)\b/.test(text)) {
    result.task = "search";
  } else if (/\b(log in|sign in|login|signin|authenticate|access)\b/.test(text)) {
    result.task = "login";
  } else if (/\b(download|save|get|fetch|grab|store|export)\b/.test(text)) {
    result.task = "download";
  } else if (/\b(play|stream|watch|listen to)\b/.test(text)) {
    result.task = "media";
  } else if (/\b(buy|purchase|order|shop for)\b/.test(text)) {
    result.task = "shop";
  }
  
  const knownWebsites = {
    "google": ["google", "google.com", "gmail", "google docs", "google drive", "maps"],
    "youtube": ["youtube", "youtube.com", "yt"],
    "facebook": ["facebook", "facebook.com", "fb", "meta"],
    "twitter": ["twitter", "twitter.com", "x", "tweet"],
    "instagram": ["instagram", "instagram.com", "insta", "ig"],
    "amazon": ["amazon", "amazon.com", "prime"],
    "wikipedia": ["wikipedia", "wiki", "wikipedia.org"],
    "github": ["github", "github.com", "git"],
    "linkedin": ["linkedin", "linkedin.com"],
    "reddit": ["reddit", "reddit.com", "subreddit"],
    "bing": ["bing", "bing.com"],
    "netflix": ["netflix", "netflix.com"]
  };
  
  for (const [site, aliases] of Object.entries(knownWebsites)) {
    if (aliases.some(alias => text.includes(alias))) {
      result.website = site;
      break;
    }
  }
  
  const urlRegex = /\b(https?:\/\/[^\s]+)\b/;
  const urlMatch = text.match(urlRegex);
  if (urlMatch) {
    result.website = urlMatch[1];
  }
  
  if (result.task === "search") {
    const forPattern = /(?:search|find|look up|query|seek)(?:\s+for)?\s+(.+?)(?:\s+on|\s+in|\s+at|\s+using|\s+with|\s+via|$)/i;
    const forMatch = text.match(forPattern);
    
    if (forMatch) {
      result.query = forMatch[1].trim();
    } else {
      const searchIndex = text.search(/\b(search|find|look up|query|seek)\b/);
      if (searchIndex !== -1) {
        let queryText = text.substring(searchIndex).replace(/^\S+\s+/, '');
        
        for (const [site, aliases] of Object.entries(knownWebsites)) {
          aliases.forEach(alias => {
            const sitePattern = new RegExp(`(?:on|in|at|using|with|via)\\s+${alias}\\b`, 'i');
            queryText = queryText.replace(sitePattern, '');
          });
        }
        
        result.query = queryText.trim();
      }
    }
  }
  
  const loginPatterns = [
    /log\s*in\s*(?:to|on)?\s*(?:my)?\s*(\w+)(?:\s*account)?(?:\s*with|using)?\s*(?:username|login|email)?\s*(?:is|as|:)?\s*(\S+)(?:\s*(?:and|with)?\s*password\s*(?:is|as|:)?\s*(\S+))?/i,
    /sign\s*in\s*(?:to|on)?\s*(?:my)?\s*(\w+)(?:\s*account)?(?:\s*with|using)?\s*(?:username|login|email)?\s*(?:is|as|:)?\s*(\S+)(?:\s*(?:and|with)?\s*password\s*(?:is|as|:)?\s*(\S+))?/i,
    /(?:username|login|email)\s*(?:is|for)?\s*(\S+)(?:\s*(?:and|with)\s*password\s*(?:is|:)?\s*(\S+))?(?:\s*(?:on|for|at)\s*(\w+))?/i
  ];
  
  for (const pattern of loginPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[1] && match[2]) {
        if (!result.website && match[1]) {
          for (const [site, aliases] of Object.entries(knownWebsites)) {
            if (aliases.some(alias => match[1].includes(alias))) {
              result.website = site;
              break;
            }
          }
        }
        result.username = match[2];
        result.password = match[3] || null;
        result.task = "login";
        break;
      }
    }
  }
  
  if (/\bin (new tab|incognito|private|window)\b/.test(text)) {
    if (text.includes("new tab")) result.options.newTab = true;
    if (text.includes("incognito") || text.includes("private")) result.options.incognito = true;
    if (text.includes("window")) result.options.newWindow = true;
  }
  
  if (/\b(full screen|fullscreen|hd|high definition|quality|volume)\b/.test(text)) {
    if (/\b(full screen|fullscreen)\b/.test(text)) result.options.fullscreen = true;
    if (/\b(hd|high definition)\b/.test(text)) result.options.quality = "hd";
    
    const volumeMatch = text.match(/\bvolume\s+(up|down|to|at)\s+(\d+)%?\b/);
    if (volumeMatch) {
      if (volumeMatch[1] === "up" || volumeMatch[1] === "down") {
        result.options.volumeChange = volumeMatch[1];
      } else {
        result.options.volume = parseInt(volumeMatch[2]);
      }
    }
  }
  
  const entities = doc.topics().json();
  if (entities.length > 0 && !result.query && result.task === "search") {
    result.query = entities.map(e => e.text).join(" ");
  }
  
  return result;
};

export default parseCommand;