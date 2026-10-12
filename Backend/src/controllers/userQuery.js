const { Pinecone } = require("@pinecone-database/pinecone");
const { createEmbedding , chatBot} = require("../services/chatBotservices");

const pc = new Pinecone({
    apiKey: process.env.PINECONE_KEY
});

const namespace = pc
    .index(process.env.PINECONE_INDEX_NAME)
    .namespace("policies");


async function userQuery(req , res) {
    try {
        const {userQuery} = req.body
    
        if(!userQuery){
            return res.status(400).json({
                message : "use Query is not defined "
            });
        }

        const queryVector = await createEmbedding(userQuery);

        const result = await namespace.query({
            vector: queryVector,
            topK: 2,
            includeMetadata: true
        })

        //console.log(result.matches)

       

        const mainResult = result.matches.map(match => match.metadata.text);

       // console.log(mainResult)

        const response = await chatBot(mainResult , userQuery)


        res.status(200).json({
            message : "resuls are",
            matches : response
        })

        

    } catch (error) {
        console.log(error)
        res.status(400).json({
            message : "error in userQuery ",
            error : error.message
        })
    }
    
}

module.exports = {
    userQuery
}