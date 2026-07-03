const express = require("express");
const { line, lineConfig } = require("./config/line");
const { handleEvent } = require("./controllers/lineController");
const { startSchedulers } = require("./scheduler");

const app = express();

app.get("/", (req, res) => {
  res.send("Life Assistant LINE Bot is running.");
});

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events || [];
    await Promise.all(events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    res.status(200).end();
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  startSchedulers();
});
