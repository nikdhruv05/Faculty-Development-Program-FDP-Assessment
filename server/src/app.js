import express from "express";
import cors from "cors";
import helmet from "helmet";
import studentRoutes from "./routes/studentRoutes.js";

const app = express();

function clientOrigin() {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

app.use(
  cors({
    origin(origin, callback) {
      const allowed = clientOrigin();
      if (!origin || origin === allowed) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(express.json());
app.use("/api/students", studentRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "MERN FDP API is running",
  });
});

export default app;
