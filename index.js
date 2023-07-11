const express = require("express");
const redis = require("redis");

const app = express();
const client = redis.createClient({
  url: "redis://redis:6379",
});

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

app.get("/", async (req, res) => {
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
});

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await client.connect();
    const cachedPost = await client.get(`post-${id}`);
    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );
    const data = await response.json();

    await client.setEx(`post-${id}`, 10, JSON.stringify(data));

    return res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.quit();
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Hey, now listening on port ${port}!`);
});
