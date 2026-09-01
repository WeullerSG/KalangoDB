import { relativeTime } from "@/lib/relativeTime";
import { ArrowLeft, MapPin, Plus, Thermometer } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Doc } from "../../../../convex/_generated/dataModel";

const avatarColors = ["#e8a33d", "#7a8f6e", "#c47a5a", "#5a7a8f", "#8f5a7a"];

function getAvatarColor(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function getInitials(nome: string) {
  return nome.slice(0, 2).toUpperCase();
}

function formatSexo(sexo?: string) {
  return sexo === "femea"
    ? "Fêmea"
    : sexo === "macho"
      ? "Macho"
      : "Não informado";
}

function formatExposicao(exposicao?: string) {
  return exposicao === "sol"
    ? "Sol direto"
    : exposicao === "sombra"
      ? "Sombra"
      : "Não informado";
}

interface PropsDetails {
  lizardId: Doc<"observations">;
  onBack: () => void;
}

export default function LizardsDetails({ lizardId, onBack }: PropsDetails) {
  return (
    <View className="flex-1 bg-[#f2efe6]">
      {/* Header */}
      <View className="flex-row justify-between items-center pt-20 px-4 gap-3">
        <Pressable
          onPress={onBack}
          className="p-2 rounded-2xl border-2 border-gray-300 active:bg-[#e8e4d8]"
        >
          <ArrowLeft size={24} color="#000" />
        </Pressable>

        <Text className="text-2xl font-bold text-[#718477] tracking-tight">
          Ficha de campo
        </Text>

        <Pressable className="p-2 rounded-full active:bg-[#e8e4d8]">
          <Plus size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 mt-6"
        contentContainerClassName="px-4 pb-20 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Card Principal */}
        <View className="bg-[#365946] rounded-3xl p-4 gap-4">
          {/* Avatar + Infos */}
          <View className="flex-row items-start gap-3">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center"
              style={{ backgroundColor: getAvatarColor(lizardId._id) }}
            >
              <Text className="text-white font-bold text-lg">
                {getInitials(lizardId.nome)}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
                {lizardId.nome}
              </Text>
              <Text className="text-[#b8d4a8] text-sm font-medium">
                {formatSexo(lizardId.sexo)}
              </Text>
              <Text className="text-[#a0c496] text-xs">
                {relativeTime(lizardId.notedAt)}
              </Text>
            </View>
          </View>

          {/* Condições + Sexo */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-[#a0c496] text-xs font-semibold uppercase tracking-wider mb-1">
                Exposição solar
              </Text>
              <Text className="text-white text-sm font-medium">
                {formatExposicao(lizardId.exposicaoSol)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[#a0c496] text-xs font-semibold uppercase tracking-wider mb-1">
                Sexo
              </Text>
              <Text className="text-white text-sm font-medium">
                {formatSexo(lizardId.sexo)}
              </Text>
            </View>
          </View>

          {/* Localização */}
          {lizardId.endereco && (
            <View className="flex-row items-start gap-2">
              <MapPin size={16} color="#a0c496" style={{ marginTop: 4 }} />
              <Text className="text-[#a0c496] text-sm flex-1">
                {lizardId.endereco}
                {lizardId.cep && ` - ${lizardId.cep}`}
              </Text>
            </View>
          )}
        </View>

        {/* Temperaturas Registradas */}
        <View className="gap-2">
          <Text className="text-[#718477] text-xs font-semibold uppercase tracking-wider px-1">
            Temperaturas do momento
          </Text>
          <View className="flex-row gap-3">
            {lizardId.tAr !== undefined && (
              <View className="flex-1 bg-white rounded-2xl p-4 gap-2">
                <View className="flex-row items-center gap-2">
                  <Thermometer size={18} color="#e8a33d" />
                  <Text className="text-[#8a9a6e] text-xs font-semibold">
                    Ar
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-foreground">
                  {lizardId.tAr}°C
                </Text>
              </View>
            )}

            {lizardId.tb !== undefined && (
              <View className="flex-1 bg-white rounded-2xl p-4 gap-2">
                <View className="flex-row items-center gap-2">
                  <Thermometer size={18} color="#c47a5a" />
                  <Text className="text-[#8a9a6e] text-xs font-semibold">
                    Basal
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-foreground">
                  {lizardId.tb}°C
                </Text>
              </View>
            )}

            {lizardId.tSubstrato !== undefined && (
              <View className="flex-1 bg-white rounded-2xl p-4 gap-2">
                <View className="flex-row items-center gap-2">
                  <Thermometer size={18} color="#7a8f6e" />
                  <Text className="text-[#8a9a6e] text-xs font-semibold">
                    Substrato
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-foreground">
                  {lizardId.tSubstrato}°C
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Limites Térmicos */}
        {(lizardId.ctMin !== undefined ||
          lizardId.ctMax !== undefined ||
          lizardId.tPref !== undefined) && (
          <View className="gap-2">
            <Text className="text-[#718477] text-xs font-semibold uppercase tracking-wider px-1">
              Limites térmicos
            </Text>
            <View className="flex-row gap-3">
              {lizardId.ctMin !== undefined && (
                <View className="flex-1 bg-white rounded-2xl p-3">
                  <Text className="text-[#8a9a6e] text-xs font-semibold mb-1">
                    CT Min
                  </Text>
                  <Text className="text-xl font-bold text-foreground">
                    {lizardId.ctMin}°C
                  </Text>
                </View>
              )}

              {lizardId.tPref !== undefined && (
                <View className="flex-1 bg-white rounded-2xl p-3">
                  <Text className="text-[#8a9a6e] text-xs font-semibold mb-1">
                    T Pref
                  </Text>
                  <Text className="text-xl font-bold text-foreground">
                    {lizardId.tPref}°C
                  </Text>
                </View>
              )}

              {lizardId.ctMax !== undefined && (
                <View className="flex-1 bg-white rounded-2xl p-3">
                  <Text className="text-[#8a9a6e] text-xs font-semibold mb-1">
                    CT Max
                  </Text>
                  <Text className="text-xl font-bold text-foreground">
                    {lizardId.ctMax}°C
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Morfometria */}
        {(lizardId.crc !== undefined ||
          lizardId.comprimentoCauda !== undefined) && (
          <View className="gap-2">
            <Text className="text-[#718477] text-xs font-semibold uppercase tracking-wider px-1">
              Morfometria
            </Text>
            <View className="gap-2">
              {lizardId.crc !== undefined && (
                <View className="flex-row justify-between bg-white rounded-2xl p-4">
                  <Text className="text-foreground font-semibold">
                    Comprimento rostro-cloacal
                  </Text>
                  <Text className="text-foreground font-bold">
                    {lizardId.crc} mm
                  </Text>
                </View>
              )}

              {lizardId.comprimentoCauda !== undefined && (
                <View className="flex-row justify-between bg-white rounded-2xl p-4">
                  <Text className="text-foreground font-semibold">
                    Comprimento cauda
                  </Text>
                  <Text className="text-foreground font-bold">
                    {lizardId.comprimentoCauda} mm
                  </Text>
                </View>
              )}

              {lizardId.larguraCorpo !== undefined && (
                <View className="flex-row justify-between bg-white rounded-2xl p-4">
                  <Text className="text-foreground font-semibold">
                    Largura do corpo
                  </Text>
                  <Text className="text-foreground font-bold">
                    {lizardId.larguraCorpo} mm
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
