const express = require("express")
const app =express.Router()


app.use("/",require("./pages"))
app.use("/api/auth",require("./auth"))
app.use("/subscriptions",require("./purchse"))
module.exports = app 