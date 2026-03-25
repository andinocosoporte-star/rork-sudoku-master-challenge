import { Tabs } from "expo-router";
import { Grid3X3, Trophy } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Sudoku",
          tabBarIcon: ({ color }) => <Grid3X3 color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <Trophy color={color} />,
        }}
      />
    </Tabs>
  );
}