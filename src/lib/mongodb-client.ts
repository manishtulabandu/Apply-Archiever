// This file provides a simple MongoDB client interface that can be used
// directly from the frontend when the backend server isn't running

import { JobApplication } from "@/types";
import { toast } from "@/components/ui/use-toast";

type MongoDBConfig = {
  uri: string;
  enabled: boolean;
}

// Get MongoDB configuration
const getConfig = (): MongoDBConfig => {
  return {
    uri: import.meta.env.VITE_MONGODB_URI || "",
    enabled: !!import.meta.env.VITE_MONGODB_URI
  };
};

// Basic MongoDB client for frontend use
// Note: In production, you should use a proper backend for security
class MongoDBClient {
  private config: MongoDBConfig;
  private apiBaseUrl: string;
  private connectionChecked: boolean = false;
  private isConnected: boolean = false;
  
  constructor() {
    this.config = getConfig();
    this.apiBaseUrl = import.meta.env.VITE_API_URL || '';
    
    // Log connection status to help with debugging
    if (this.isEnabled()) {
      console.log("MongoDB client initialized in enabled state");
      console.log(`API base URL: ${this.apiBaseUrl}`);
      
      // Check connection on initialization after a short delay
      // to allow server to start if needed
      setTimeout(() => {
        this.checkConnection();
      }, 1000);
    } else {
      console.log("MongoDB client initialized in disabled state");
    }
  }
  
  isEnabled(): boolean {
    return this.config.enabled;
  }
  
  async checkConnection(): Promise<boolean> {
    if (!this.isEnabled() || !this.apiBaseUrl) {
      return false;
    }
    
    // If we've already checked and the connection is good, return cached result
    if (this.connectionChecked && this.isConnected) {
      return true;
    }
    
    try {
      // Add cache-busting parameter and appropriate headers for CORS
      const response = await fetch(`${this.apiBaseUrl}/health?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log("MongoDB connection status:", data);
      
      if (data.mongodb !== 'Connected') {
        console.error("MongoDB is not connected. Check your server logs.");
        if (!this.connectionChecked) {
          toast({
            title: "Database Connection Warning",
            description: "MongoDB connection issues detected. Using local storage instead.",
            variant: "destructive"
          });
        }
        this.connectionChecked = true;
        this.isConnected = false;
        return false;
      }
      
      this.connectionChecked = true;
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Cannot reach the API server:", error);
      
      // Only show toast on first check
      if (!this.connectionChecked) {
        toast({
          title: "Database Connection Error",
          description: "Cannot connect to the database server. Using local storage instead.",
          variant: "destructive"
        });
      }
      
      this.connectionChecked = true;
      this.isConnected = false;
      return false;
    }
  }
  
  async getAllApplications(): Promise<JobApplication[]> {
    try {
      if (!this.apiBaseUrl) {
        console.error("API URL not configured. Please set VITE_API_URL environment variable.");
        return [];
      }

      const response = await fetch(`${this.apiBaseUrl}/applications`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        resumeFile: null,
        coverLetterFile: null
      }));
    } catch (error) {
      console.error("Failed to fetch applications from MongoDB:", error);
      toast({
        title: "Error Loading Data",
        description: "Could not load applications from database. Check console for details.",
        variant: "destructive"
      });
      return [];
    }
  }
  
  async createApplication(application: JobApplication): Promise<JobApplication | null> {
    try {
      if (!this.apiBaseUrl) {
        console.error("API URL not configured");
        return null;
      }
      
      // Prepare data for API
      const preparedData = {
        ...application,
        resumeFileName: application.resumeFile?.name || null,
        coverLetterFileName: application.coverLetterFile?.name || null,
        // Don't send File objects
        resumeFile: undefined,
        coverLetterFile: undefined
      };
      
      const response = await fetch(`${this.apiBaseUrl}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        resumeFile: application.resumeFile,
        coverLetterFile: application.coverLetterFile
      };
    } catch (error) {
      console.error("Failed to create application in MongoDB:", error);
      toast({
        title: "Error Saving Data",
        description: "Could not save application to database. Check console for details.",
        variant: "destructive"
      });
      return null;
    }
  }
  
  async updateApplication(application: JobApplication): Promise<boolean> {
    try {
      if (!this.apiBaseUrl) {
        console.error("API URL not configured");
        return false;
      }
      
      // Prepare data for API
      const preparedData = {
        ...application,
        resumeFileName: application.resumeFile?.name || null,
        coverLetterFileName: application.coverLetterFile?.name || null,
        // Don't send File objects
        resumeFile: undefined,
        coverLetterFile: undefined
      };
      
      const response = await fetch(`${this.apiBaseUrl}/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return true;
    } catch (error) {
      console.error("Failed to update application in MongoDB:", error);
      toast({
        title: "Error Updating Data",
        description: "Could not update application in database. Check console for details.",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async deleteApplication(id: string): Promise<boolean> {
    try {
      if (!this.apiBaseUrl) {
        console.error("API URL not configured");
        return false;
      }
      
      const response = await fetch(`${this.apiBaseUrl}/applications/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return true;
    } catch (error) {
      console.error("Failed to delete application from MongoDB:", error);
      toast({
        title: "Error Deleting Data",
        description: "Could not delete application from database. Check console for details.",
        variant: "destructive"
      });
      return false;
    }
  }
}

// Singleton instance
export const mongoClient = new MongoDBClient();
