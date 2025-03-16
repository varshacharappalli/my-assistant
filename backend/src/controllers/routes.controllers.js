import { convertToText } from "../convertToText.js"
import parseCommand from "../parseTheTask.js";

export const audio=(audio)=>{
    const text=convertToText(audio);
    const parsing=parseCommand(text);
    console.log(parsing);
}