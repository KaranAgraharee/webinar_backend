import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { startReminderCron } from "./cron/reminderCron.js";

const bootstrap = async () => {
  try {
    await connectDB();
    startReminderCron();
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Server bootstrap failed:", error);
    process.exit(1);
  }
};

bootstrap();
