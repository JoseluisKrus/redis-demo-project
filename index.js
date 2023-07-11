const express = require("express");
const redis = require("redis");

const app = express();
const client = redis.createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

app.use(express.json());

app.post("/", async (req, res) => {
  const { key, value } = req.body;
  try {
    await client.connect();
    await client.set(key, value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.quit();
  }
});

app.get("/", async(req, res) => {
    const { key } = req.body;
    try {
        await client.connect();
        const value = await client.get(key);
        res.json(value);
      } catch (error) {
        res.status(500).json({ error: error.message });
      } finally {
        client.quit();
      }
})

const port = 8080;
app.listen(port, () => {
  console.log(`Hey, now listening on port ${port}!`);
});
