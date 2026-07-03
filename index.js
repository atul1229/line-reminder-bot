require("dotenv").config();

const express = require("express");
const { line, lineConfig } = require("./config/line");
const { handleEvent } = require("./controllers/lineController");
const { startSchedulers } = require("./scheduler");

const app = express();

/**
 * ✅ VERY IMPORTANT
 * 確保 body 正確解析
 */
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Life Assistant LINE Bot is running.");
});

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    console.log("WEBHOOK BODY:", JSON.stringify(req.body));

    const events = req.body?.events;

    if (!Array.isArray(events)) {
      console.log("No events array");
      return res.status(200).end();
    }

    await Promise.all(events.map(handleEvent));

    res.status(200).end();
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    res.status(200).end();
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  startSchedulers();
});
