import { convertToText } from "../convertToText.js";
import parseCommand from "../parseTheTask.js";

export const audio = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: "No audio file provided." });
        }

        const text = await convertToText(req.file.buffer);
        console.log("Converted Text:", text);

        const parsing = parseCommand(text);
        console.log("Parsed Command:", parsing);

        return res.json({ success: true, parsedCommand: parsing });

    } catch (error) {
        console.error("Error processing audio:", error);
        return res.status(500).json({ error: error.message });
    }
};
