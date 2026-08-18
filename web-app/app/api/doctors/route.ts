import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = searchParams.toString();
    
    const response = await axios.get(`${API_BASE_URL}/api/v1/doctors?${queryParams}`, {
      headers: {
        authorization: request.headers.get("authorization") || "",
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to fetch doctors" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await axios.post(`${API_BASE_URL}/api/v1/doctors`, body, {
      headers: {
        authorization: request.headers.get("authorization") || "",
        "content-type": "application/json",
      },
    });
    
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to create doctor" },
      { status: error.response?.status || 500 }
    );
  }
}