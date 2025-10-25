import { useMemo } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "src/themes/typography";

/** Inset custom support for padding or margin */
export default function useCustomInset() {
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    if (Platform.OS === "android") {
      const bottom = Math.max(insets.bottom, Spacing.S);

      return {
        top: insets.top + Spacing.S,
        bottom: bottom,
        /**Insets get from safe area view */
        safeAreaInsets: insets,

        /**Support for keyboard tracking view have use bottom inset */
        keyboardExcludeInset: Math.max(bottom - Spacing.L, 0),
      };
    }

    const bottom = Math.min(insets.bottom, 20) + Spacing.S;

    return {
      top: Math.max(insets.top, 24),
      bottom: bottom,

      /**Insets get from safe area view */
      safeAreaInsets: insets,

      /**Support for keyboard tracking view have use bottom inset */
      keyboardExcludeInset: Math.max(bottom - Spacing.L, 0),
    };
  }, [insets]);
}
