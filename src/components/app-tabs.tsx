import { useColorScheme } from "react-native";

import { Login } from "@/app/login";
import { Colors } from "@/constants/theme";
import { Authenticated, Unauthenticated } from "convex/react";
import ObservationsPage from "./obeservations/page/ObservationsPage";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <>
      <Authenticated>
        <ObservationsPage />
      </Authenticated>
      <Unauthenticated>
        <Login />
      </Unauthenticated>
    </>
  );
}
