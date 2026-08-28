// components/lizardsCard.tsx (item individual)
import { relativeTime } from "@/lib/relativeTime";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { Doc } from "../../../../convex/_generated/dataModel";

const avatarColors = ["#e8a33d", "#7a8f6e", "#c47a5a", "#5a7a8f", "#8f5a7a"];

function getAvatarColor(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function getInitials(nome: string) {
  return nome.slice(0, 2).toUpperCase();
}

interface ItemProps {
  lizard: Doc<"observations">;
  onPress?: () => void;
}

function LizardListItem({ lizard, onPress }: ItemProps) {
  const subtitle = [lizard.sexo, lizard.exposicaoSol]
    .filter(Boolean)
    .join(" · ");

  const infoLine = [
    lizard.tAr !== undefined ? `${lizard.tAr}°C ar` : null,
    relativeTime(lizard.notedAt),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 gap-3"
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: getAvatarColor(lizard._id) }}
      >
        <Text className="text-white font-bold text-sm">
          {getInitials(lizard.nome)}
        </Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-bold text-foreground">
            {lizard.nome}
          </Text>
        </View>
        {subtitle ? (
          <Text className="text-sm text-[#8a9a6e]">{subtitle}</Text>
        ) : null}
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
  lizards: Doc<"observations">[];
  onItemPress?: (lizard: Doc<"observations">) => void;
}

export default function LizardsCard({ lizards, onItemPress }: CardProps) {
  return (
    <View className="gap-3">
      {lizards.map((lizard) => (
        <LizardListItem
          key={lizard._id}
          lizard={lizard}
          onPress={() => onItemPress?.(lizard)}
        />
      ))}
    </View>
  );
}
