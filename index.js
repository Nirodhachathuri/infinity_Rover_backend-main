import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import ora from "ora";
import db from "./config/Database.js";
import reloadApp from "./controllers/ReloadApp.js";
import router from "./routes/index.js";
import cron from "node-cron";
import { UpdateAllUsersOnceNight } from "./controllers/Users.js";

dotenv.config();

const load = ora({
  color: "green",
  hideCursor: true,
}).start();

const app = express();

try {
  await db.authenticate();
  load.succeed("Database Connected...");
  await db.sync({ force: false });

  reloadApp();
} catch (error) {
  console.error("Error connecting to the database:", error);
  process.exit(1); // Exit the process if there is a critical error
}

app.use(cors({ credentials: true, origin: ["http://localhost:3000","https://ar-app-515b9.web.app","https://black-font.onrender.com","https://www.infinityrover.net","http://165.227.106.195" ]}));
app.use(cookieParser());
app.use(express.json());
app.use(router);

cron.schedule('0 0 * * 1-5', () => {
  try {
    UpdateAllUsersOnceNight();
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

app.listen(5001, () => {
  load.succeed('Server running at port 5001');
}).on('error', (error) => {
  console.error("Error starting the server:", error);
});
