import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Plus, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import RunsCard from "../components/RunsCard";
import RunsForm from "../components/RunsForm";

export default function RunsPage() {
  // se a página foi aberta a partir do detalhe de um calango
  // (ex: router.push({ pathname: "/runs", params: { observationClientId } }))
  const { observationClientId } = useLocalSearchParams<{
    observationClientId?: string;
  }>();

  const runs = useQuery(api.runs.list, {
    observationClientId: observationClientId
      ? (observationClientId as Id<"observations">)
      : undefined,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<Doc<"runs"> | null>(null);
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    if (!runs) return [];
    if (!busca.trim()) return runs;
    return runs.filter((run) => String(run.ordem).includes(busca.trim()));
  }, [runs, busca]);

  const handleItemPress = (run: Doc<"runs">) => {
    setSelectedRun(run);
    setFormOpen(true);
  };

  const handleFormOpenChange = (value: boolean) => {
    setFormOpen(value);
    if (!value) setSelectedRun(null);
  };

  return (
    <>
      <View className="flex-1 bg-[#8a9a6e]">
        <View className="flex-row justify-between items-center pt-20 pl-4 pr-2">
          <View>
            <Text className="text-xs font-semibold text-black tracking-wide uppercase">
              Dados de desempenho
            </Text>

            <Text className="text-2xl font-bold text-black tracking-tight">
              Corridas
            </Text>
          </View>

          <Pressable
            className="p-2 rounded-full active:bg-[#e8e4d8]"
            onPress={() => {
              setSelectedRun(null);
              setFormOpen(true);
            }}
          >
            <Plus size={24} color="#000" />
          </Pressable>
        </View>

        <View className="px-4 mt-4">
          <View className="flex-row items-center bg-white rounded-xl px-3 py-2 gap-2">
            <Search size={18} color="#9ca3af" />
            <TextInput
              placeholder="Buscar por ordem"
              placeholderTextColor="#9ca3af"
              value={busca}
              onChangeText={setBusca}
              className="flex-1 text-sm text-foreground"
              keyboardType="numeric"
            />
          </View>
        </View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerClassName="px-4 pb-32 gap-3"
          showsVerticalScrollIndicator={false}
        >
          <RunsCard runs={filtrados} onItemPress={handleItemPress} />
        </ScrollView>
      </View>
      <RunsForm
        run={selectedRun ?? undefined}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
      />
    </>
  );
}
