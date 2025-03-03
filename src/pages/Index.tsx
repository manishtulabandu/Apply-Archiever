import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Toaster, toast as sonnerToast } from "sonner";
import { JobApplication } from "@/types";
import ApplicationCard from "@/components/application-card";
import ApplicationForm from "@/components/application-form";
import EmptyState from "@/components/empty-state";
import {
  saveApplications,
  getApplications,
  addApplication,
  updateApplication,
  deleteApplication,
} from "@/lib/storage";
import { mongoClient } from "@/lib/mongodb-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Check if MongoDB is enabled
const useMongoDB = mongoClient.isEnabled();

const Index = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    JobApplication[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<
    JobApplication | undefined
  >(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load applications from storage
    const loadApplications = async () => {
      setIsLoading(true);
      try {
        const savedApplications = await getApplications();
        setApplications(savedApplications);
      } catch (error) {
        console.error("Error loading applications:", error);
        sonnerToast.error("Failed to load applications");
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, []);

  useEffect(() => {
    // Filter applications based on search query
    if (searchQuery.trim() === "") {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(
        (app) =>
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.jobLink.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.notes &&
            app.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredApplications(filtered);
    }
  }, [applications, searchQuery]);

  const handleSaveApplication = async (application: JobApplication) => {
    const isEditing = applications.some((app) => app.id === application.id);

    try {
      if (isEditing) {
        if (useMongoDB) {
          // Update in MongoDB
          const updated = await updateApplication(application);
          if (!updated) {
            throw new Error("Failed to update application");
          }
        }

        // Update in local state
        const updatedApplications = applications.map((app) =>
          app.id === application.id ? application : app
        );
        setApplications(updatedApplications);

        // If not using MongoDB, save to localStorage
        if (!useMongoDB) {
          await saveApplications(updatedApplications);
        }

        sonnerToast.success("Application updated successfully");
      } else {
        if (useMongoDB) {
          // Add to MongoDB
          const newApp = await addApplication(application);
          if (!newApp) {
            throw new Error("Failed to add application");
          }
          // Update local state with the app returned from MongoDB
          setApplications([newApp, ...applications]);
        } else {
          // Add to local state and localStorage
          const updatedApplications = [application, ...applications];
          setApplications(updatedApplications);
          await saveApplications(updatedApplications);
        }

        sonnerToast.success("Application added successfully");
      }
    } catch (error) {
      console.error("Error saving application:", error);
      sonnerToast.error("Failed to save application");
    }

    setFormOpen(false);
    setEditingApplication(undefined);
  };

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setApplicationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (applicationToDelete) {
      try {
        if (useMongoDB) {
          // Delete from MongoDB
          const success = await deleteApplication(applicationToDelete);
          if (!success) {
            throw new Error("Failed to delete application from database");
          }
        }

        // Remove from local state
        const updatedApplications = applications.filter(
          (app) => app.id !== applicationToDelete
        );
        setApplications(updatedApplications);

        // If not using MongoDB, save to localStorage
        if (!useMongoDB) {
          await saveApplications(updatedApplications);
        }

        sonnerToast.success("Application deleted successfully");
      } catch (error) {
        console.error("Error deleting application:", error);
        sonnerToast.error("Failed to delete application");
      }

      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  };

  const handleAddNewClick = () => {
    setEditingApplication(undefined);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <Toaster />
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Apply Archive
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Track your job applications in one place
        </p>
      </header>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search applications"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={handleAddNewClick} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add New Application
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        searchQuery ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No applications found for "{searchQuery}"
            </p>
            <Button variant="link" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <EmptyState onAddNew={handleAddNewClick} />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onDelete={handleDeleteClick}
              onEdit={handleEditApplication}
            />
          ))}
        </div>
      )}

      <ApplicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveApplication}
        initialData={editingApplication}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              application from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
