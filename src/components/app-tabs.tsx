// components/app-tabs.tsx
import { useState } from "react";
import { useColorScheme, View } from "react-native";

import BottomNavbar, { Screen } from "@/app/BottomNavbar";
import { Login } from "@/app/login";
import { Colors } from "@/constants/theme";
import { Authenticated, Unauthenticated } from "convex/react";
import LizardForm from "./obeservations/components/LizardsForm";
import ObservationsPage from "./obeservations/page/ObservationsPage";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const [screen, setScreen] = useState<Screen>("observations");
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <Authenticated>
        <View className="flex-1">
          {screen === "observations" && <ObservationsPage />}
          {/* {screen === "runs" && <RunsPage />} */}

          <BottomNavbar
            active={screen}
            onChange={setScreen}
            onAddPress={() => setFormOpen(true)}
          />

          <LizardForm open={formOpen} onOpenChange={setFormOpen} />
        </View>
      </Authenticated>
      <Unauthenticated>
        <Login />
      </Unauthenticated>
    </>
  );
}
