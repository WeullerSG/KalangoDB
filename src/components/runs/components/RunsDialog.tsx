import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Doc } from "../../../../convex/_generated/dataModel";

interface RunDetailsDialogProps {
  run: Doc<"runs"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center bg-[#f2efe6] rounded-xl px-3 py-2.5">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}

export default function RunDetailsDialog({
  run,
  open,
  onOpenChange,
  onEdit,
}: RunDetailsDialogProps) {
  if (!run) return null;

  const [showVideo, setShowVideo] = useState(false);
  const videoSource = run.videoUrl ? { uri: run.videoUrl } : null;
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-none h-[95%]">
        <DialogHeader>
          <DialogTitle>Corrida #{run.ordem}</DialogTitle>
        </DialogHeader>

        <ScrollView
          className="max-h-[400px]"
          contentContainerClassName="py-4 gap-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2 py-2">
            <DetailRow label="Ordem" value={String(run.ordem)} />

            <DetailRow label="Temperatura" value={`${run.temperatura}°C`} />

            <DetailRow
              label="Desempenho"
              value={
                run.desempenho !== undefined
                  ? String(run.desempenho)
                  : "Não informado"
              }
            />
            {!showVideo ? (
              <Button variant="outline" onPress={() => setShowVideo(true)}>
                <Text>Ver Vídeo</Text>
              </Button>
            ) : (
              <View>
                <VideoView
                  className="w-[350px] h-[275px]"
                  player={player}
                  fullscreenOptions={{ enable: true }}
                  allowsPictureInPicture
                />
                {/* <View>
                  <Button
                    onPress={() => {
                      if (isPlaying) {
                        player.pause();
                      } else {
                        player.play();
                      }
                    }}
                  >
                    <Text>{isPlaying ? "Pause" : "Play"}</Text>
                  </Button>
                </View> */}
              </View>
            )}
          </View>
        </ScrollView>

        <DialogFooter>
          <Button variant="outline" onPress={() => onOpenChange(false)}>
            <Text>Fechar</Text>
          </Button>

          <Button className="bg-[#9acd32]" variant="outline" onPress={onEdit}>
            <Text>Editar</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
