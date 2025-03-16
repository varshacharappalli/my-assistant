import { convertToText } from "../convertToText.js";
import { automateFilling, openRequiredWebsite, searchInRequiredWebsite } from "../open_files.js";
import parseCommand from "../parseTheTask.js";

export const audio = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            console.error("No audio file provided");
            return res.status(400).json({ error: "No audio file provided." });
        }
        
        console.log("Converting audio to text...");
        const text = await convertToText(req.file.buffer);
        console.log("Converted Text:", text);
        
        console.log("Parsing command from text...");
        const parsing =parseCommand(text);
        console.log("Parsed Command:", parsing);
        
        let commandResult = null;
        
        if (parsing.task === "open") {
            if (!parsing.website) {
                console.error("No website specified in the 'open' command");
                return res.status(400).json({ error: "No website specified in the 'open' command" });
            }
            
            console.log(`Executing 'open' command for website: ${parsing.website}`);
            try {
                commandResult = await openRequiredWebsite(parsing.website);
                console.log("Open command executed successfully:", commandResult);
            } catch (err) {
                console.error(`Failed to open website ${parsing.website}:`, err);
                return res.status(500).json({ 
                    error: `Failed to open website: ${err.message}`,
                    parsedCommand: parsing
                });
            }
        } else if (parsing.task === "search") {
            if (!parsing.website || !parsing.query) {
                console.error("Missing website or query in the 'search' command");
                return res.status(400).json({ 
                    error: "Missing website or query in the 'search' command",
                    parsedCommand: parsing
                });
            }
            
            console.log(`Executing 'search' command for website: ${parsing.website}, query: ${parsing.query}`);
            try {
                commandResult = await searchInRequiredWebsite(parsing.website, parsing.query);
                console.log("Search command executed successfully:", commandResult);
            } catch (err) {
                console.error(`Failed to search on website ${parsing.website}:`, err);
                return res.status(500).json({ 
                    error: `Failed to search on website: ${err.message}`,
                    parsedCommand: parsing
                });
            }
        } else if (parsing.task === "login") {
            if (!parsing.website || !parsing.username || !parsing.password) {
                console.error("Missing credentials in the 'login' command");
                return res.status(400).json({ 
                    error: "Missing credentials in the 'login' command",
                    parsedCommand: parsing
                });
            }
            
            console.log(`Executing 'login' command for website: ${parsing.website}`);
            try {
                commandResult = await automateFilling(parsing.website, parsing.username, parsing.password);
                console.log("Login command executed successfully:", commandResult);
            } catch (err) {
                console.error(`Failed to login to website ${parsing.website}:`, err);
                return res.status(500).json({ 
                    error: `Failed to login to website: ${err.message}`,
                    parsedCommand: parsing
                });
            }
        } else {
            console.warn(`Unknown task type: ${parsing.task}`);
        }
        
        return res.json({ 
            success: true, 
            parsedCommand: parsing,
            result: commandResult
        });
    } catch (error) {
        console.error("Error processing audio:", error);
        return res.status(500).json({ error: error.message });
    }
};