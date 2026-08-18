import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/leads/config/form`, {
      headers: {
        authorization: request.headers.get("authorization") || "",
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching lead form config:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to fetch form configuration" },
      { status: error.response?.status || 500 }
    );
  }
}