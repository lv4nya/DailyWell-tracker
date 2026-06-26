import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`DailyWell API running on http://localhost:${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the old dev server or set PORT to another value.`);
    process.exit(1);
  }

  throw err;
});
