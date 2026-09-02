import { useQuery } from "convex/react";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";

const avatarColors = ["#e8a33d", "#7a8f6e", "#c47a5a", "#5a7a8f", "#8f5a7a"];

function getAvatarColor(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

interface ItemProps {
  run: Doc<"runs">;
  onPress?: () => void;
}

function RunListItem({ run, onPress }: ItemProps) {
  const subtitle = `${run.temperatura}°C`;
  const calangos = useQuery(api.observations.list) || [];
  const calango = calangos.find((c) => c._id === run.observationClientId);

  const infoLine =
    run.desempenho !== undefined ? `Desempenho: ${run.desempenho}` : null;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 gap-3"
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: getAvatarColor(run._id) }}
      >
        <Text className="text-white font-bold text-sm">#{run.ordem}</Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-bold text-foreground">
            {calango?.nome || "Calango não encontrado"} - Corrida #{run.ordem}
          </Text>
        </View>
        <Text className="text-sm text-[#8a9a6e]">{subtitle}</Text>
        {infoLine ? (
          <Text className="text-xs text-muted-foreground mt-0.5">
            {infoLine}
          </Text>
        ) : null}
      </View>

      <ChevronRight size={20} color="#9ca3af" />
    </Pressable>
  );
}

interface CardProps {
  runs: Doc<"runs">[];
  onItemPress?: (run: Doc<"runs">) => void;
}

export default function RunsCard({ runs, onItemPress }: CardProps) {
  return (
    <View className="gap-3">
      {runs.map((run) => (
        <RunListItem
          key={run._id}
          run={run}
          onPress={() => {
            onItemPress?.(run);
          }}
        />
      ))}
    </View>
  );
}
