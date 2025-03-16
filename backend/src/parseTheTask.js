import nlp from "compromise";

const parseCommand = async (text) => {
    text = String(text).toLowerCase();
    text = text.toLowerCase();
    const doc = nlp(text);

    let task = null;
    let website = null;
    let query = null;

    const verbs = doc.verbs().out("array");

    if (verbs.includes("open")) task = "open";
    if (verbs.includes("search") || verbs.includes("find") || verbs.includes("look up")) task = "search";
    if (verbs.includes("log in") || verbs.includes("sign in")) task = "login";
    if (verbs.includes("download") || verbs.includes("save")) task = "download";

    const knownWebsites = ["google", "youtube", "facebook", "twitter", "wikipedia", "bing"];
    knownWebsites.forEach(site => {
        if (text.includes(site)) website = site;
    });

    const match = text.match(/(search|find|look up) (for )?(.*)/);
    if (match) query = match[3];

    let username = null, password = null;
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
