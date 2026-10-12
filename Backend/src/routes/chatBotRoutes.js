const express = require("express")
const router  = express.Router()

const fileController = require("../controllers/chatBotController");

const userQueryController = require("../controllers/userQuery")


router.post("/readFiles" , fileController.readAllFiles)


router.get("/userInput" , userQueryController.userQuery)


module.exports = router