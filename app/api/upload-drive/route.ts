import { NextResponse } from "next/server";
import { uploadFileToDrive } from "@/lib/google-drive";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;
    const fileType = formData.get("fileType") as string | null;

    if (!file || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields: file or fileType" },
        { status: 400 }
      );
    }

    if (fileType !== "preview" && fileType !== "source") {
      return NextResponse.json(
        { error: "Invalid fileType. Must be 'preview' or 'source'" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive
    const driveResult = await uploadFileToDrive({
      fileBuffer: buffer,
      fileName: file.name,
      mimeType: file.type,
      isSource: fileType === "source",
    });

    if (!driveResult.webViewLink || !driveResult.webContentLink) {
      throw new Error("Failed to get Google Drive links.");
    }

    // Determine which column to update based on fileType
    const updateData: any = {};
    if (fileType === "preview") {
      updateData.preview_url = driveResult.webViewLink;
    } else {
      updateData.drive_file_id = driveResult.id;
    }

    let updatedProduct = null;

    if (productId) {
      const { data, error: supabaseError } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId)
        .select()
        .single();

      if (supabaseError) {
        console.error("Supabase update error:", supabaseError);
        return NextResponse.json(
          { error: "Failed to update product in database" },
          { status: 500 }
        );
      }
      updatedProduct = data;
    }

    return NextResponse.json({
      message: "File uploaded successfully",
      driveLinks: driveResult,
      product: updatedProduct,
    });

  } catch (error: any) {
    console.error("API Error in /api/upload-drive:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
