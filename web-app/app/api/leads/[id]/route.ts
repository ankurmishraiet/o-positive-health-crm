import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/leads/${params.id}`, {
      headers: {
        authorization: request.headers.get("authorization") || "",
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to fetch lead" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const response = await axios.put(`${API_BASE_URL}/api/v1/leads/${params.id}`, body, {
      headers: {
        authorization: request.headers.get("authorization") || "",
        "content-type": "application/json",
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to update lead" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await axios.delete(`${API_BASE_URL}/api/v1/leads/${params.id}`, {
      headers: {
        authorization: request.headers.get("authorization") || "",
      },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to delete lead" },
      { status: error.response?.status || 500 }
    );
  }
}