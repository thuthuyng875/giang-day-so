import { NextResponse } from "next/server";
import { google } from "googleapis";

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google Drive OAuth credentials.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export async function POST(request: Request) {
  try {
    const { fileName, mimeType, isSource } = await request.json();

    if (!fileName || !mimeType) {
      return NextResponse.json({ error: "Missing fileName or mimeType" }, { status: 400 });
    }

    const oauth2Client = getOAuth2Client();
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error("Failed to retrieve access token");
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    const fileMetadata: any = {
      name: fileName,
    };
    if (folderId) {
      fileMetadata.parents = [folderId];
    }
    
    // Nếu là file preview, TẮT quyền download/copy/print cho người xem (viewersCanCopyContent)
    if (isSource !== undefined && !isSource) {
      fileMetadata.copyRequiresWriterPermission = true;
    }

    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Upload-Content-Type": mimeType,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(fileMetadata),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Google Drive Resumable Upload Error:", errorText);
      throw new Error("Failed to initiate resumable upload session");
    }

    const uploadUrl = res.headers.get("Location");

    if (!uploadUrl) {
      throw new Error("No Location header returned from Google Drive");
    }

    return NextResponse.json({ uploadUrl });
  } catch (error: any) {
    console.error("API Error in /api/drive-upload-url:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
