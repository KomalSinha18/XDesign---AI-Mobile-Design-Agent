"use client";

import { useGetProjectById } from "@/features/use-project-id";
import { useParams } from "next/navigation";
import React from "react";
import Header from "./_common/header";
import { CanvasProvider } from "@/context/canvas-context";
import Canvas from "@/components/canvas";
import { AxiosError } from "axios";

const page = () => {
  const params = useParams();
  const id = params.id as string;
  const { data: project, isPending, isError, error } = useGetProjectById(id);
  const frames = project?.frames || [];
  const themeId = project?.theme || "";

  const hasInitialData = frames.length > 0;

  // Show loading state while fetching
  if (isPending) {
    return (
      <div
        className="relative h-screen w-full
     flex flex-col
    "
      >
        <Header projectName={undefined} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground">Loading project...</div>
        </div>
      </div>
    );
  }

  // Show error state only after query has completed and failed
  if (isError || (!isPending && !project)) {
    // Type guard to check if error is an AxiosError
    const isAxiosError = (err: unknown): err is AxiosError => {
      return (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as AxiosError).response === "object"
      );
    };

    const errorStatus = isAxiosError(error) ? error.response?.status : undefined;
    const isNotFound = errorStatus === 404 || !project;

    return (
      <div
        className="relative h-screen w-full
     flex flex-col
    "
      >
        <Header projectName={undefined} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-destructive">
            {isNotFound ? "Project not found" : "Failed to load project"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen w-full
   flex flex-col
  "
    >
      <Header projectName={project?.name} />

      <CanvasProvider
        initialFrames={frames}
        initialThemeId={themeId}
        hasInitialData={hasInitialData}
        projectId={project?.id}
      >
        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1">
            <Canvas
              projectId={project?.id}
              projectName={project?.name}
              isPending={isPending}
            />
          </div>
        </div>
      </CanvasProvider>
    </div>
  );
};

export default page;
