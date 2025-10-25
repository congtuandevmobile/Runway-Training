import { TextStyle } from "react-native";

import { TextFontStyle, TextStatus } from "./index.props";
import { Colors } from "src/themes";
import { FontFamily } from "src/themes/typography";


export const useStatusColor = (status: TextStatus) => {
  switch (status) {
    case "error":
      return Colors.red_01;
    case "success":
      return Colors.green_02;
    case "info":
      return Colors.grey_05;
    case "warning":
      return Colors.orange_06;
    default:
      return Colors.black_03;
  }
};

export const useFontStyle = (fontStyle: TextFontStyle): TextStyle => {
  switch (fontStyle) {
    case "bold":
      return { fontFamily: FontFamily.bold, fontWeight: "700" };
    case "semi-bold":
      return { fontFamily: FontFamily.semiBold, fontWeight: "600" };
    case "medium":
      return { fontFamily: FontFamily.medium, fontWeight: "500" };
    default:
      return { fontFamily: FontFamily.regular };
  }
};
