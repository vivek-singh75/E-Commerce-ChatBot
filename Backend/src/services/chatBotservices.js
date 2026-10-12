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

    return response?.embeddings[0]?.values
    //console.log(response.embeddings);
}

const system_prompt = `
                You are an e-commerce customer support chatbot.

                Your job is to answer the user's question using ONLY the information
                provided in the context.

                Rules:
                1. Use the context to answer the user's question.
                2. Do not make up or assume information that is not present in the context.
                3. If the answer is not available in the context, clearly say:
                "I don't have enough information to answer that."
                4. Give a clear and concise answer.
                5. Be polite and helpful.
                6. Do not mention Pinecone, embeddings, vectors, or the RAG system to the user.
                `;

async function chatBot(mainResult, userQuery) {
    try {
        const context = mainResult
            .map((item, index) => `Context ${index + 1}:\n${item}`)
            .join("\n\n");

        const input = `
            User Question:
            ${userQuery}

            Context:
            ${context}
            `;

        const interaction = await ai.interactions.create({
            model: "gemini-3.1-flash-lite",

            system_instruction: system_prompt,

            input: input
        });

        return interaction?.output_text;

    } catch (error) {

        console.error("Gemini error:", error);

        throw error;
    }
}

module.exports = 
{
    createEmbedding,
    chatBot
}