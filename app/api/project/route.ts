import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateProjectName } from "@/app/action/action";
import { inngest } from "@/inngest/client";

export async function GET(request: Request) {
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) throw new Error("Unauthorized");

    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Please log in to create a project",
        },
        { status: 401 }
      );
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Missing or invalid prompt - Please provide a project description",
        },
        { status: 400 }
      );
    }

    const userId = user.id;

    // Generate project name
    let projectName: string;
    try {
      projectName = await generateProjectName(prompt);
    } catch (error) {
      console.error("Error generating project name:", error);
      // Fallback to a default name if generation fails
      projectName = "Untitled Project";
    }

    // Create project in database
    let project;
    try {
      project = await prisma.project.create({
        data: {
          userId,
          name: projectName,
        },
      });
    } catch (error: any) {
      console.error("Database error creating project:", error);
      
      // Check for specific Prisma errors
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "A project with this name already exists",
          },
          { status: 409 }
        );
      }
      
      if (error.message?.includes("connect") || error.message?.includes("connection")) {
        return NextResponse.json(
          {
            error: "Database connection error - Please check your DATABASE_URL environment variable",
          },
          { status: 500 }
        );
      }

      throw error; // Re-throw to be caught by outer catch
    }

    //Trigger the Inngest
    try {
      const eventResult = await inngest.send({
        name: "ui/generate.screens",
        data: {
          userId,
          projectId: project.id,
          prompt,
        },
      });
      console.log("Inngest event sent successfully:", eventResult);
    } catch (error: any) {
      console.error("Error triggering Inngest:", {
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause,
      });
      // Don't fail the request if Inngest fails - project is already created
      // But log it for debugging
      if (process.env.NODE_ENV === "production") {
        console.error("Inngest configuration check:", {
          hasInngestEventKey: !!process.env.INNGEST_EVENT_KEY,
          hasInngestSigningKey: !!process.env.INNGEST_SIGNING_KEY,
          inngestBaseUrl: process.env.INNGEST_BASE_URL,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Error creating project:", error);
    
    // Handle specific error types
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        {
          error: "Unauthorized - Please log in to create a project",
        },
        { status: 401 }
      );
    }

    if (error.message === "Missing Prompt") {
      return NextResponse.json(
        {
          error: "Missing prompt - Please provide a project description",
        },
        { status: 400 }
      );
    }

    // Generic error response with more details in development
    return NextResponse.json(
      {
        error: "Failed to create project",
        ...(process.env.NODE_ENV === "development" && {
          details: error.message || String(error),
        }),
      },
      { status: 500 }
    );
  }
}
