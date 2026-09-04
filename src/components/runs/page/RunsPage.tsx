import { useQuery } from "convex/react";
import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import RunsCard from "../components/RunsCard";
import RunDetailsDialog from "../components/RunsDialog";
import RunsForm from "../components/RunsForm";

interface RunsPageProps {
  // filtro opcional: quando vindo do detalhe de um calango via callback
  observationClientId?: Id<"observations">;
}

export default function RunsPage({ observationClientId }: RunsPageProps) {
  const runs = useQuery(api.runs.list, { observationClientId });

  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<Doc<"runs"> | null>(null);
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    if (!runs) return [];
    if (!busca.trim()) return runs;
    return runs.filter((run) => String(run.ordem).includes(busca.trim()));
  }, [runs, busca]);

  const handleItemPress = (run: Doc<"runs">) => {
    setSelectedRun(run);
    setDetailsOpen(true);
  };

  const handleFormOpenChange = (value: boolean) => {
    setFormOpen(value);
    if (!value) setSelectedRun(null);
  };

  const handleEditFromDetails = () => {
    setDetailsOpen(false);
    setFormOpen(true);
  };

  return (
    <>
      <View className="flex-1 bg-[#8a9a6e]">
        <View className="flex flex-row justify-between items-start pt-20 pl-4 pr-2">
          <View>
            <Text className="text-xs font-semibold text-black tracking-wide uppercase">
              Dados de desempenho
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-2xl font-bold text-black tracking-tight">
                Corridas
              </Text>
            </View>
            <View className="bg-[#e8e4d8] rounded-full px-2.5 py-0.5 mt-1">
              <Pressable
                onPress={() => {
                  setSelectedRun(null);
                  setFormOpen(true);
                }}
              >
                <Text className="text-xs font-medium text-muted-foreground">
                  Adicionar nova corrida
                </Text>
              </Pressable>
            </View>
            <RunsForm
              run={selectedRun ?? undefined}
              open={formOpen}
              onOpenChange={handleFormOpenChange}
            />
            <RunDetailsDialog
              key={selectedRun?._id ?? "novo"}
              run={selectedRun}
              open={detailsOpen}
              onOpenChange={setDetailsOpen}
              onEdit={handleEditFromDetails}
            />
          </View>
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
    </>
  );
}
