
import { JobApplication } from "@/types";
import { mongoClient } from "./mongodb-client";
import { toast } from "@/components/ui/use-toast";

const STORAGE_KEY = 'job-applications';

// Check if MongoDB is enabled
const useMongoDB = mongoClient.isEnabled();

// Log which storage mode is being used to help with debugging
console.log(`Storage mode: ${useMongoDB ? 'MongoDB (if server available)' : 'LocalStorage'}`);

export async function saveApplications(applications: JobApplication[]): Promise<void> {
  // With MongoDB enabled, this function is only used with localStorage
  if (!useMongoDB) {
    try {
      const serializedData = applications.map(app => ({
        ...app,
        resumeFile: null, // We can't serialize File objects
        coverLetterFile: null,
        createdAt: app.createdAt.toISOString()
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedData));
    } catch (error) {
      console.error("Error saving applications to localStorage:", error);
      toast({
        title: "Error Saving Data",
        description: "Could not save applications to local storage.",
        variant: "destructive"
      });
    }
  }
  
  return Promise.resolve();
}

export async function getApplications(): Promise<JobApplication[]> {
  if (useMongoDB) {
    // Check MongoDB connection first
    const isConnected = await mongoClient.checkConnection();
    if (!isConnected) {
      console.warn("MongoDB is not connected. Falling back to localStorage");
      return getApplicationsFromLocalStorage();
    }
    
    try {
      const applications = await mongoClient.getAllApplications();
      if (applications && applications.length > 0) {
        // Also save to localStorage as a backup
        saveLocalBackup(applications);
        return applications;
      } else {
        // If no data in MongoDB, check if we have local data
        const localData = getApplicationsFromLocalStorage();
        if (localData && localData.length > 0) {
          console.log("No MongoDB data found, using localStorage data");
          return localData;
        }
        return [];
      }
    } catch (error) {
      console.error("Error fetching from MongoDB:", error);
      return getApplicationsFromLocalStorage();
    }
  } else {
    return getApplicationsFromLocalStorage();
  }
}

// Helper function to save MongoDB data to localStorage as backup
function saveLocalBackup(applications: JobApplication[]): void {
  try {
    const serializedData = applications.map(app => ({
      ...app,
      resumeFile: null,
      coverLetterFile: null,
      createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : app.createdAt
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedData));
  } catch (error) {
    console.error("Error creating local backup:", error);
  }
}

function getApplicationsFromLocalStorage(): JobApplication[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  } catch (error) {
    console.error("Error parsing job applications from localStorage:", error);
    toast({
      title: "Error Loading Data",
      description: "Could not load applications from local storage.",
      variant: "destructive"
    });
    return [];
  }
}

export async function addApplication(application: JobApplication): Promise<JobApplication | null> {
  if (useMongoDB) {
    // Check MongoDB connection first
    const isConnected = await mongoClient.checkConnection();
    if (!isConnected) {
      console.warn("MongoDB is not connected. Falling back to localStorage");
      // In case of MongoDB error, we still want to return the application
      // so the UI can update, but we'll save it to localStorage instead
      const applications = getApplicationsFromLocalStorage();
      applications.push(application);
      await saveApplications(applications);
      toast({
        title: "Saved Locally",
        description: "Application saved to local storage due to database connection issues.",
      });
      return application;
    }
    
    const result = await mongoClient.createApplication(application);
    if (result) {
      // Also save to localStorage as backup
      const applications = getApplicationsFromLocalStorage();
      applications.push(result);
      saveLocalBackup(applications);
    }
    return result;
  } 
  
  // LocalStorage mode
  const applications = getApplicationsFromLocalStorage();
  applications.push(application);
  await saveApplications(applications);
  return Promise.resolve(application);
}

export async function updateApplication(application: JobApplication): Promise<JobApplication | null> {
  if (useMongoDB) {
    // Check MongoDB connection first
    const isConnected = await mongoClient.checkConnection();
    if (!isConnected) {
      console.warn("MongoDB is not connected. Falling back to localStorage");
      // Update in localStorage instead
      const applications = getApplicationsFromLocalStorage();
      const index = applications.findIndex(app => app.id === application.id);
      if (index !== -1) {
        applications[index] = application;
        await saveApplications(applications);
        toast({
          title: "Updated Locally",
          description: "Application updated in local storage due to database connection issues.",
        });
      }
      return application;
    }
    
    const success = await mongoClient.updateApplication(application);
    if (success) {
      // Also update in localStorage
      const applications = getApplicationsFromLocalStorage();
      const index = applications.findIndex(app => app.id === application.id);
      if (index !== -1) {
        applications[index] = application;
        saveLocalBackup(applications);
      }
    }
    return success ? application : null;
  }
  
  // LocalStorage mode
  const applications = getApplicationsFromLocalStorage();
  const index = applications.findIndex(app => app.id === application.id);
  if (index !== -1) {
    applications[index] = application;
    await saveApplications(applications);
  }
  return Promise.resolve(application);
}

export async function deleteApplication(id: string): Promise<boolean> {
  if (useMongoDB) {
    // Check MongoDB connection first
    const isConnected = await mongoClient.checkConnection();
    if (!isConnected) {
      console.warn("MongoDB is not connected. Falling back to localStorage");
      // Delete from localStorage instead
      const applications = getApplicationsFromLocalStorage();
      const filtered = applications.filter(app => app.id !== id);
      await saveApplications(filtered);
      toast({
        title: "Deleted Locally",
        description: "Application deleted from local storage due to database connection issues.",
      });
      return true;
    }
    
    const success = await mongoClient.deleteApplication(id);
    if (success) {
      // Also delete from localStorage
      const applications = getApplicationsFromLocalStorage();
      const filtered = applications.filter(app => app.id !== id);
      saveLocalBackup(filtered);
    }
    return success;
  }
  
  // LocalStorage mode
  const applications = getApplicationsFromLocalStorage();
  const filtered = applications.filter(app => app.id !== id);
  await saveApplications(filtered);
  return Promise.resolve(true);
}
