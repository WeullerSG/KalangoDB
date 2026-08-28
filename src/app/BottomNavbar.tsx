// components/BottomNavbar.tsx
import { Activity, PawPrint, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export type Screen = "observations" | "runs";

interface Props {
  active: Screen;
  onChange: (screen: Screen) => void;
  onAddPress: () => void;
}

export default function BottomNavbar({ active, onChange, onAddPress }: Props) {
  return (
    <View className="absolute bottom-0 left-0 right-0 items-center">
      <View className="flex-row items-center justify-between w-full bg-[#f2efe6] px-8 pt-4 pb-8 rounded-t-3xl">
        <Pressable
          onPress={() => onChange("observations")}
          className="items-center gap-1 w-20"
        >
          <PawPrint
            size={22}
            color={active === "observations" ? "#365946" : "#9ca3af"}
          />
          <Text
            className={`text-xs text-center ${
              active === "observations"
                ? "text-[#365946] font-medium"
                : "text-gray-400"
            }`}
          >
            Observações
          </Text>
        </Pressable>

        <View className="w-20" />

        <Pressable
          onPress={() => onChange("runs")}
          className="items-center gap-1 w-20"
        >
          <Activity
            size={22}
            color={active === "runs" ? "#365946" : "#9ca3af"}
          />
          <Text
            className={`text-xs text-center ${
              active === "runs" ? "text-[#365946] font-medium" : "text-gray-400"
            }`}
          >
            Corridas
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onAddPress}
        className="absolute -top-5 bg-[#365946] w-16 h-16 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 6 }}
      >
        <Plus size={26} color="white" />
      </Pressable>
    </View>
  );
}
