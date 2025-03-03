import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Improved CORS configuration with more permissive settings
app.use(
  cors({
    origin: "*", // Allow all origins temporarily for testing
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// MongoDB connection
let db;
let connectionError = null;

async function connectToMongoDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      connectionError = "MONGODB_URI environment variable is not defined";
      console.error(connectionError);
      return false;
    }

    console.log("Attempting to connect to MongoDB...");
    console.log(`Using connection string: ${uri}`);

    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });

    // Connect with timeout
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Connection timeout after 10 seconds")),
        10000
      )
    );

    await Promise.race([connectPromise, timeoutPromise]);
    console.log("Connected to MongoDB successfully");

    // Test the connection with a simple command
    await client.db().admin().ping();
    console.log("MongoDB ping successful");

    db = client.db("applyarchive");

    // Check if jobApplications collection exists, create it if it doesn't
    const collections = await db
      .listCollections({ name: "jobApplications" })
      .toArray();
    if (collections.length === 0) {
      console.log("Creating jobApplications collection...");
      await db.createCollection("jobApplications");
      console.log("jobApplications collection created successfully");
    } else {
      console.log("jobApplications collection already exists");
    }

    // Add connection error handler
    client.on("error", (err) => {
      console.error("MongoDB connection error event:", err);
      connectionError = "MongoDB connection error: " + err.message;
    });

    connectionError = null;
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    connectionError = error.message;

    // Log more detailed error information
    if (error.name === "MongoServerSelectionError") {
      console.error("Could not connect to any MongoDB server");
      console.error("Please check:");
      console.error("1. Your connection string is correct");
      console.error(
        "2. IP address whitelist in MongoDB Atlas - add your current IP address"
      );
      console.error("3. Username and password are correct");
      console.error("4. Network connectivity to MongoDB server");
      console.error(
        "5. MongoDB Atlas status: https://status.cloud.mongodb.com/"
      );
    } else if (error.message.includes("authentication failed")) {
      console.error(
        "MongoDB authentication failed - username or password is incorrect"
      );
    } else if (error.message.includes("timed out")) {
      console.error(
        "MongoDB connection timed out - check network connectivity and IP whitelist"
      );
    }

    return false;
  }
}

// Routes
app.get("/api/applications", async (req, res) => {
  try {
    if (!db) {
      return res
        .status(500)
        .json({ error: "Database not connected", details: connectionError });
    }

    const applications = await db
      .collection("jobApplications")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/applications", async (req, res) => {
  try {
    if (!db) {
      return res
        .status(500)
        .json({ error: "Database not connected", details: connectionError });
    }

    const application = {
      ...req.body,
      createdAt: new Date(req.body.createdAt),
    };

    const result = await db
      .collection("jobApplications")
      .insertOne(application);
    res.status(201).json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/applications/:id", async (req, res) => {
  try {
    if (!db) {
      return res
        .status(500)
        .json({ error: "Database not connected", details: connectionError });
    }

    const { id } = req.params;
    const application = {
      ...req.body,
      createdAt: new Date(req.body.createdAt),
    };

    delete application._id; // Remove _id if it exists

    const result = await db
      .collection("jobApplications")
      .updateOne({ id }, { $set: application });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Application updated successfully" });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/applications/:id", async (req, res) => {
  try {
    if (!db) {
      return res
        .status(500)
        .json({ error: "Database not connected", details: connectionError });
    }

    const { id } = req.params;
    const result = await db.collection("jobApplications").deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add a health check endpoint with detailed diagnostics
app.get("/api/health", (req, res) => {
  const mongoStatus = db
    ? "Connected"
    : `Disconnected: ${connectionError || "Unknown error"}`;

  // Include MONGODB_URI in diagnostics (but hide credentials)
  const uri = process.env.MONGODB_URI || "Not set";

  res.json({
    status: "UP",
    mongodb: db ? "Connected" : "Disconnected",
    mongodbDetails: mongoStatus,
    env: {
      PORT: process.env.PORT || "5000 (default)",
      MONGODB_URI: uri ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV || "Not set",
    },
    timestamp: new Date().toISOString(),
  });
});

// Only start the server if this file is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Start server
  async function startServer() {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.log("MONGODB_URI not found in environment variables.");
      console.log("Backend server not started - app will use localStorage.");
      return; // Don't start the server
    }

    const connected = await connectToMongoDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api/applications`);
      console.log(`Health check at http://localhost:${PORT}/api/health`);
      console.log(
        `MongoDB connection status: ${connected ? "Connected" : "Disconnected"}`
      );

      if (!connected) {
        console.log(
          "WARNING: Running in disconnected mode. Data will not persist to MongoDB."
        );
        console.log(
          "Check your MONGODB_URI in the .env file to enable MongoDB mode."
        );
        console.log("Try accessing the health endpoint for more information.");
        if (connectionError) {
          console.log(`Connection error: ${connectionError}`);
        }
      }
    });
  }

  startServer();
}

// Export for importing in other files
export default app;
