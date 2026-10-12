const { GoogleGenAI } =  require("@google/genai");


const ai = new GoogleGenAI({
    apiKey : process.env.GEMINI_EMBEDDING_KEY
});


async function createEmbedding(chunk) {
    const response = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: chunk,
    config: {
        outputDimensionality: process.env.EMBEDDING_DIMENSION
        },
    });

    return(response?.embeddings)
    //console.log(response.embeddings);
}


module.exports = 
{
    createEmbedding
}