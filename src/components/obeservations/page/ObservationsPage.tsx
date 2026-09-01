import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Search, Settings } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import LizardsCard from "../components/lizardsCard";
import LizardsDetails from "./LizardsDetails";

export default function ObservationsPage() {
  const { signOut } = useAuthActions();
  const calangos = useQuery(api.observations.list) || [];
  const [busca, setBusca] = useState("");
  const [selectedLizard, setSelectedLizard] =
    useState<Doc<"observations"> | null>(null);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return calangos;
    const termo = busca.toLowerCase();
    return calangos.filter((c) => c.nome.toLowerCase().includes(termo));
  }, [calangos, busca]);

  if (selectedLizard) {
    return (
      <LizardsDetails
        lizardId={selectedLizard}
        onBack={() => setSelectedLizard(null)}
      />
    );
  }

  return (
    <View className="flex-1 bg-[#f2efe6]">
      <View className="flex flex-row justify-between items-start pt-20 pl-4 pr-2">
        <View>
          <Text className="text-xs font-semibold text-[#8a9a6e] tracking-wide uppercase">
            Arquivo vivo
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-2xl font-bold text-foreground tracking-tight">
              Meus calangos
            </Text>
            <View className="bg-[#e8e4d8] rounded-full px-2.5 py-0.5">
              <Text className="text-xs font-medium text-muted-foreground">
                {calangos.length} registros
              </Text>
            </View>
          </View>
        </View>
        <Button variant={"ghost"} onPress={() => signOut()}>
          <Settings />
        </Button>
      </View>

      <View className="px-4 mt-4">
        <View className="flex-row items-center bg-white rounded-xl px-3 py-2 gap-2">
          <Search size={18} color="#9ca3af" />
          <TextInput
            placeholder="Buscar por nome"
            placeholderTextColor="#9ca3af"
            value={busca}
            onChangeText={setBusca}
            className="flex-1 text-sm text-foreground"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 mt-4"
        contentContainerClassName="px-4 pb-32 gap-3"
        showsVerticalScrollIndicator={false}
      >
        <LizardsCard
          lizards={filtrados}
          onItemPress={(lizard) => setSelectedLizard(lizard)}
        />
      </ScrollView>
    </View>
  );
}
