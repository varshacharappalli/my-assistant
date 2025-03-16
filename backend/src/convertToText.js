const API_KEY=process.env.ASSEMBLY_API_KEY;

const uploadFile=async(filePath)=>{
    console.log("Uploading file!");

    const response=await axios.post(
        "https://api.assemblyai.com/v2/upload",
        fs.createReadStream(filePath),
        {
            headers: {
                "authorization": API_KEY,
                "Content-Type": "application/octet-stream"
            },
            timeout: 60000
        }

    )
    console.log("File uploaded:", response.data);
    return response.data.upload_url;
}

const transcribeAudio = async (audioUrl) => {
    const selectedLanguage = state.lang || "German";
    const languageCode = languageMap[selectedLanguage] || "de";
    console.log("Started transcription");
    const response = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        { 
            audio_url: audioUrl,
            language_code: languageCode
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

export const convertToText=async(filePath)=>{

    try {
        const audioUrl = await uploadFile(filePath);
        const transcriptId = await transcribeAudio(audioUrl);
        const text = await getTranscript(transcriptId);

        console.log("Final Transcription:", text);
        return text;
    } catch (error) {
        console.error("Error:", error);
    }
}