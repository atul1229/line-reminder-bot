require("dotenv").config();

const express = require("express");
const { line, lineConfig, lineClient } = require("./config/line");
const { handleEvent } = require("./controllers/lineController");
const reminderService = require("./services/reminderService");

const app = express();

app.get("/", (req, res) => {
  res.send("Life Assistant LINE Bot is running.");
});

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events || [];
    await Promise.all(events.map(handleEvent));
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(200).end();
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
