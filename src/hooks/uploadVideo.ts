import { useAction, useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { Id } from "../../convex/_generated/dataModel";

export async function uploadVideoToRun(
  asset: ImagePicker.ImagePickerAsset,
  runId: Id<"runs">,
  generateUploadUrl: ReturnType<typeof useAction>,
  attachVideoToRun: ReturnType<typeof useMutation>,
) {
  const filename = asset.fileName ?? `video-${Date.now()}.mp4`;
  const contentType = asset.mimeType ?? "video/mp4";

  const { uploadUrl, key } = await generateUploadUrl({ filename, contentType });

  const fileResponse = await fetch(asset.uri);
  const blob = await fileResponse.blob();

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": contentType },
  });

  if (!uploadResponse.ok) throw new Error("Falha no upload pro R2");

  await attachVideoToRun({ id: runId, videoKey: key });
}
