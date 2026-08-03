import { google } from "googleapis";
import { Readable } from "stream";

function getDriveService() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google Drive OAuth credentials in environment variables.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function uploadFileToDrive({
  fileBuffer,
  fileName,
  mimeType,
  isSource,
}: {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  isSource: boolean;
}) {
  const drive = getDriveService();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Tạo luồng đọc từ buffer
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const fileMetadata: any = {
    name: fileName,
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  // Nếu là file preview, TẮT quyền download/copy/print cho người xem (viewersCanCopyContent)
  // Trong Drive API v3, trường này là copyRequiresWriterPermission = true
  if (!isSource) {
    fileMetadata.copyRequiresWriterPermission = true;
  }

  const media = {
    mimeType,
    body: stream,
  };

  console.log("DEBUG Google Drive Upload:");
  console.log("folderId from env:", folderId);
  console.log("fileMetadata:", JSON.stringify(fileMetadata));

  try {
    // 1. Upload file
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    const fileId = file.data.id;
    if (!fileId) throw new Error("File upload failed, no ID returned.");

    // 2. Phân quyền: Ai có link cũng xem được (viewer)
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Đọc lại file để lấy webViewLink chuẩn
    const fileData = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });

    return {
      id: fileId,
      webViewLink: fileData.data.webViewLink,
      webContentLink: fileData.data.webContentLink,
    };
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw error;
  }
}
