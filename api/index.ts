import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase configuration is missing. Database operations will fail.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Cloudinary Setup
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.warn("Cloudinary configuration is missing. Uploads will fail.");
}

cloudinary.config(cloudinaryConfig);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "portfolio",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  } as any,
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for images
});

// API Routes
const apiRouter = express.Router();

apiRouter.use((req, res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || "default_development_secret_key";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

apiRouter.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    (req as any).user = user;
    next();
  });
};

apiRouter.get("/verify", authenticateToken, (req, res) => {
  res.json({ valid: true });
});

apiRouter.get("/projects", async (req, res) => {
  console.log("GET /api/projects");
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Supabase Error (GET /projects):", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err: any) {
    console.error("Unexpected Error (GET /projects):", err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/projects/:id", async (req, res) => {
  console.log(`GET /api/projects/${req.params.id}`);
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      console.error("Supabase Error (GET /projects/:id):", error);
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(data);
  } catch (err: any) {
    console.error("Unexpected Error (GET /projects/:id):", err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/projects", authenticateToken, async (req, res) => {
  console.log("POST /api/projects", req.body);
  try {
    const { title, description, content, image, tag, year, size } = req.body;
    const { data, error } = await supabase
      .from("projects")
      .insert([{ title, description, content, image, tag, year, size: size || 'small' }])
      .select();

    if (error) {
      console.error("Supabase Error (POST /projects):", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data[0]);
  } catch (err: any) {
    console.error("Unexpected Error (POST /projects):", err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put("/projects/:id", authenticateToken, async (req, res) => {
  console.log(`PUT /api/projects/${req.params.id}`, req.body);
  try {
    const { title, description, content, image, tag, year, size } = req.body;
    const { error } = await supabase
      .from("projects")
      .update({ title, description, content, image, tag, year, size: size || 'small' })
      .eq("id", req.params.id);

    if (error) {
      console.error("Supabase Error (PUT /projects/:id):", error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected Error (PUT /projects/:id):", err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete("/projects/:id", authenticateToken, async (req, res) => {
  console.log(`DELETE /api/projects/${req.params.id}`);
  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      console.error("Supabase Error (DELETE /projects/:id):", error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected Error (DELETE /projects/:id):", err);
    res.status(500).json({ error: err.message });
  }
});

// Upload Route
apiRouter.post("/upload", authenticateToken, (req, res, next) => {
  console.log("POST /api/upload");
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(500).json({ error: err.message });
    }
    if (!req.file) {
      console.error("Upload Error: No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("Upload Success:", (req.file as any).path);
    res.json({ url: (req.file as any).path });
  });
});

app.use("/api", apiRouter);

// Catch-all for undefined API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Error Handler for API
app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("API Error Handler:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: err.details || undefined
  });
});

export default app;
