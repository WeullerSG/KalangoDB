import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCsv } from "@/hooks/useCsvExport";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Download, LogOut, Search, Settings } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import LizardsCard from "../components/lizardsCard";
import LizardsDetails from "./LizardsDetails";

interface ObservationsPageProps {
  onViewRuns?: (observationClientId: Id<"observations">) => void;
}

export default function ObservationsPage({
  onViewRuns,
}: ObservationsPageProps) {
  const { signOut } = useAuthActions();
  const calangos = useQuery(api.observations.list) || [];
  const [busca, setBusca] = useState("");
  const data = useQuery(api.exports.getUserDataForExport);
  const handleExport = async () => {
    if (!data) return;
    await exportToCsv(data, "kalango-dados");
  };
  const [selectedLizard, setSelectedLizard] =
    useState<Doc<"observations"> | null>(null);

  useEffect(() => {
    setSelectedLizard((atual) => {
      if (!atual) return null;

      const atualizado = calangos.find((calango) => calango._id === atual._id);

      return atualizado ?? atual;
    });
  }, [calangos]);

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
        onViewRuns={onViewRuns}
      />
    );
  }

  return (
    <View className="flex-1 bg-[#f2efe6]">
      <View className="flex flex-row justify-between items-start pt-[2.5rem] pl-4 pr-2">
        <View>
          <Text className="text-xs font-semibold text-[#3d6d11] tracking-wide uppercase">
            Arquivo vivo
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-2xl font-bold text-[#3d6d11] tracking-tight">
              Meus calangos
            </Text>
          </View>
          <View className="rounded-full py-0.5">
            <Text className="text-[15px] font-medium text-[#3d6d11]">
              {calangos.length} registros
            </Text>
          </View>
        </View>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"}>
              <Settings />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={2} className="w-52" align="start">
            <DropdownMenuItem>
              <Button variant={"ghost"} onPress={handleExport}>
                <Download size={28} />
                <Text>Exportar CSV</Text>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Button variant={"ghost"} onPress={() => signOut}>
                <LogOut size={28} />
                <Text>Sair</Text>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
