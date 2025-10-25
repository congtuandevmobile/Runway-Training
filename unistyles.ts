import { StyleSheet } from "react-native-unistyles";
import LightTheme from "src/themes/colors/new-light";


// if you defined breakpoints
// type AppBreakpoints = typeof breakpoints;

// if you defined themes
type AppThemes = {
  light: typeof LightTheme;
  dark: typeof LightTheme;
};

// override library types
declare module "react-native-unistyles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  // interface UnistylesBreakpoints extends AppBreakpoints {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: {
    light: LightTheme,
    dark: LightTheme,
  },
//   breakpoints: breakpoints,
  settings: {
    adaptiveThemes: true,
  },
});
