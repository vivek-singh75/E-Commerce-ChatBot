const cors = require("cors");
const express = require("express");

const app = express();

const router = require("./routes/chatBotRoutes");

app.use(express.json());

const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://vivek-singh75.github.io"
];

app.use(cors({
    origin: function (origin, callback) {

        // Allow requests without Origin
        // e.g. Postman / server-to-server
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },

    credentials: true
}));

app.use("/api/ai", router);

module.exports = app;