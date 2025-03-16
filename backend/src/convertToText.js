import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import dotenv from 'dotenv';

dotenv.config({ path: 'src/.env' });

const API_KEY = process.env.ASSEMBLY_API_KEY;

const uploadFile = async (file) => {
    console.log("Uploading file!");

    const formData = new FormData();

    if (Buffer.isBuffer(file)) {
        formData.append("file", file, { filename: "audio.mp3" }); // Name the file properly
    } else {
        formData.append("file", fs.createReadStream(file));
    }

    const response = await axios.post(
        "https://api.assemblyai.com/v2/upload",
        formData,
        {
            headers: {
                ...formData.getHeaders(),
                "authorization": API_KEY,
            },
            timeout: 60000,
        }
    );

    console.log("File uploaded:", response.data);
    return response.data.upload_url;
};


const transcribeAudio = async (audioUrl) => {
    console.log("Started transcription");
    const response = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        { 
            audio_url: audioUrl,
            language_code: 'en'
        },
        {
            headers: { authorization: API_KEY },
            timeout: 60000
        }
    );
    console.log("Transcription started:", response.data);
    return response.data.id;
};


const getTranscript=async(transcriptId)=>{
    while(true){
        const response = await axios.get(
            `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
            { headers: { authorization: API_KEY } }
        );

        if (response.data.status === "completed") {
            console.log("Transcription completed!");
            console.log("Text:", response.data.text);
            return response.data.text;
        } else if (response.data.status === "failed") {
            console.error("Transcription failed!");
            return null;
        }
        console.log("Waiting for transcription...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}

export const convertToText = async (input) => {
    try {
        const audioUrl = await uploadFile(input);
        const transcriptId = await transcribeAudio(audioUrl);
        const text = await getTranscript(transcriptId);

        console.log("Final Transcription:", text);
        return text;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
};
