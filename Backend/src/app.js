const express = require("express");

const app = express()
const router = require("./routes/chatBotRoutes")

app.use(express.json());

app.use("/api/ai" , router )


module.exports = app