import { Platform } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const extra = 10;

export const stylesGlobal = StyleSheet.create((theme, rt) => ({
  paddingBottomWithInset: {
    paddingBottom:
      Platform.select({
        ios: Math.min(rt.insets.bottom, 20) + extra,
        android: Math.max(rt.insets.bottom, extra) + extra,
      }) ?? 0,
  },
}));
