
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import AddApplication from "./pages/AddApplication";
import ViewApplication from "./pages/ViewApplication";
import EditApplication from "./pages/EditApplication";
import NotFound from "./pages/NotFound";
import { getMongoDBConfig, setMongoDBStatus } from "./lib/storage";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => {
  const [storageMode, setStorageMode] = useState<string>('Loading...');
  
  // Check MongoDB integration on startup with better error handling
  useEffect(() => {
    const mongoConfig = getMongoDBConfig();
    
    if (mongoConfig.enabled) {
      const checkMongoDB = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(`${mongoConfig.apiUrl}/health`, {
            signal: controller.signal
          }).catch(error => {
            if (error.name === 'AbortError') {
              throw new Error('Connection timeout');
            }
            throw error;
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
              toast.success('Connected to MongoDB successfully');
              setStorageMode('MongoDB');
              setMongoDBStatus(true);
            } else if (data.status === 'limited') {
              toast.warning('API server running but MongoDB not connected. Using local storage instead.');
              setStorageMode('Local Storage');
              setMongoDBStatus(false);
            } else {
              throw new Error(data.message || 'MongoDB health check failed');
            }
          } else {
            throw new Error('API server not responding');
          }
        } catch (error) {
          console.error('MongoDB connection error:', error);
          toast.error('Failed to connect to MongoDB. Using local storage instead.');
          setStorageMode('Local Storage');
          setMongoDBStatus(false);
        }
      };
      
      checkMongoDB();
    } else {
      setStorageMode('Local Storage');
      toast.info('Using local storage mode');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index storageMode={storageMode} />} />
            <Route path="/add-application" element={<AddApplication />} />
            <Route path="/application/:id" element={<ViewApplication />} />
            <Route path="/edit-application/:id" element={<EditApplication />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
