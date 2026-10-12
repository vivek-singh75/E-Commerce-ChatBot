const { readdir, readFile } = require("node:fs/promises");
const path = require("node:path");
const { PDFParse } = require("pdf-parse");
const { createChunks } = require("../services/chunking");
const { createEmbedding } = require("../services/chatBotservices");
const {Pinecone}= require("@pinecone-database/pinecone")

const KNOWLEDGE_DIR = path.resolve(__dirname, "../knowledge");

const pc = new Pinecone({ apiKey: process.env.PINECONE_KEY })

const namespace = pc.index(process.env.PINECONE_INDEX_NAME).namespace("policies");


async function readAllFiles(req, res) {

    try {

        const files = await readdir(KNOWLEDGE_DIR);

        const pdfFiles = files.filter(file =>
            file.toLowerCase().endsWith(".pdf")
        );

        const allFilesData = [];

        for (const file of pdfFiles) {

            try {

                console.log("Reading PDF:", file);

                const filePath = path.join(KNOWLEDGE_DIR, file);
                const buffer = await readFile(filePath);

                const parser = new PDFParse({
                    data: buffer
                });

                const result = await parser.getText();

                const chunks = createChunks(result.text);

                console.log("File:", file);
                console.log("Total chunks:", chunks.length);


                allFilesData.push({
                    fileName: file,
                    text: result.text,
                    chunks: chunks
                });


                await parser.destroy();

                console.log("Successfully parsed:", file);

            } catch (error) {

                console.error("FAILED PDF:", file);
                console.error("ERROR:", error.message);

                allFilesData.push({
                    fileName: file,
                    error: error.message
                });
            }
        }


        // Create embeddings
        await createvectors(allFilesData);

        // Send response AFTER processing
        res.status(200).json({
            message: "All PDF data",
            files: allFilesData
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error while reading PDF files",
            error: error.message
        });
    }
}

async function createvectors(allFilesData) {

    for (const file of allFilesData) {

        if (!Array.isArray(file.chunks)) {
            continue;
        }

        console.log("Processing:", file.fileName);

        for (const [index, chunk] of file.chunks.entries()) {

            console.log(`Creating embedding for chunk ${index}`);

            const vector = await createEmbedding(chunk);

            console.log("Vector dimensions:", vector.length);

            await namespace.upsert({
                records: [
                    {
                        id: `${file.fileName}-${index}`,
                        values: vector,
                        metadata: {
                            fileName: file.fileName,
                            chunkIndex: index,
                            text: chunk
                        }
                    }
                ]
            });

            console.log("Stored in Pinecone successfully");
        }
    }
}



module.exports = {
    readAllFiles
};