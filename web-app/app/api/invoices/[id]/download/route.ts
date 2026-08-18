import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/invoices/${params.id}/download`, {
      headers: {
        authorization: request.headers.get("authorization") || "",
      },
      responseType: "arraybuffer",
    });
    
    // Get the content type from the backend response
    const contentType = response.headers["content-type"] || "application/pdf";
    
    // Return the PDF as a blob
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="invoice-${params.id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error downloading invoice:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to download invoice" },
      { status: error.response?.status || 500 }
    );
  }
}
