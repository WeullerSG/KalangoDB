import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v } from "convex/values";
import { action } from "../../_generated/server";

export function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export const generateUploadUrl = action({
  args: {
    filename: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const key = `races/${Date.now()}-${args.filename.replace(/\s+/g, "-")}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: args.contentType,
    });
    const uploadUrl = await getSignedUrl(getR2Client(), command, {
      expiresIn: 3600,
    });
    return { uploadUrl, key };
  },
});
