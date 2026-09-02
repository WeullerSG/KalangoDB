// components/app-tabs.tsx
import { useState } from "react";
import { useColorScheme, View } from "react-native";

import BottomNavbar, { Screen } from "@/app/BottomNavbar";
import { Login } from "@/app/login";
import { Colors } from "@/constants/theme";
import { Authenticated, Unauthenticated } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import LizardForm from "./obeservations/components/LizardsForm";
import ObservationsPage from "./obeservations/page/ObservationsPage";
import RunsPage from "./runs/page/RunsPage";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const [screen, setScreen] = useState<Screen>("observations");
  const [formOpen, setFormOpen] = useState(false);

  const [runsFilter, setRunsFilter] = useState<
    Id<"observations"> | undefined
  >();

  const handleChangeScreen = (next: Screen) => {
    setRunsFilter(undefined);
    setScreen(next);
  };

  return (
    <>
      <Authenticated>
        <View className="flex-1">
          {screen === "observations" && (
            <ObservationsPage
              onViewRuns={(id) => {
                setRunsFilter(id);
                setScreen("runs");
              }}
            />
          )}
          {screen === "runs" && <RunsPage observationClientId={runsFilter} />}

          <BottomNavbar
            active={screen}
            onChange={handleChangeScreen}
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
