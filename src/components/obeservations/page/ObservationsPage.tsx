import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { Settings } from "lucide-react-native";
import { Text, View } from "react-native";

export default function ObservationsPage() {
  const { signOut } = useAuthActions();
  return (
    <>
      <View className="flex items-end pt-20 pr-2 bg-[#d3d3d3]">
        <Button variant={"ghost"} onPress={() => signOut()}>
          <Settings />
        </Button>
      </View>
      <View className="flex min-h-screen items-center justify-center bg-[#d3d3d3] p-4">
        <View className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <View>
            <Text className="text-2xl font-bold text-foreground tracking-tight">
              KalangoDB
            </Text>
            <Text className="text-sm text-muted-foreground mt-0.5">
              Cadastre os seus calangos
            </Text>
          </View>
          {/* <AddAluno /> */}
        </View>
      </View>
    </>
  );
}
