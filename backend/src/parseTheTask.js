import nlp from "compromise";

const parseCommand = async (text) => {
    text = String(text).toLowerCase().trim(); 

    const doc = nlp(text);
    let task = null, website = null, query = null, username = null, password = null;

    // Extracting verbs
    const verbs = doc.verbs().out("array");

    if (/open\b/.test(text)) task = "open";
    if (/search\b|find\b|look up\b/.test(text)) task = "search";
    if (/log in\b|sign in\b/.test(text)) task = "login";
    if (/download\b|save\b/.test(text)) task = "download";

    const knownWebsites = ["google", "youtube", "facebook", "twitter", "wikipedia", "bing"];
    knownWebsites.forEach(site => {
        if (text.includes(site)) website = site;
    });

    const searchMatch = text.match(/(?:search|find|look up) (for )?(.*)/);
    if (searchMatch) query = searchMatch[2]?.trim() || null;

    const loginMatch = text.match(/log in to (\w+) with username (\w+) and password (\w+)/);
    if (loginMatch) {
        website = loginMatch[1];
        username = loginMatch[2];
        password = loginMatch[3];
        task = "login";
    }

    return { task, query, website, username, password };
};

export default parseCommand;
