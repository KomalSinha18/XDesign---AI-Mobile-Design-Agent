import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateProject = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (prompt: string) =>
      await axios
        .post("/api/project", {
          prompt,
        })
        .then((res) => res.data),
    onSuccess: (data) => {
      router.push(`/project/${data.data.id}`);
    },
    onError: (error: any) => {
      console.error("Project creation failed:", error);
      
      // Extract error message from API response
      const errorMessage = 
        error?.response?.data?.error || 
        error?.message || 
        "Failed to create project";
      
      toast.error(errorMessage);
    },
  });
};

export const useGetProjects = (userId?: string) => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await axios.get("/api/project");
      return res.data.data;
    },
    enabled: !!userId,
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await axios.delete(`/api/project/${projectId}`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
    },
    onError: (error: any) => {
      console.error("Project deletion failed:", error);
      
      const errorMessage = 
        error?.response?.data?.error || 
        error?.message || 
        "Failed to delete project";
      
      toast.error(errorMessage);
    },
  });
};