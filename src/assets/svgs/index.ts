import type { SvgProps } from "react-native-svg";

export const CaretLeft: React.FC<SvgProps> = function CaretLeft(props) {
  return require("./caret-left.svg").default(props);
}

export const CloseOutlinedIcon: React.FC<SvgProps> = function CloseOutlinedIcon(props) {
  return require("./close-outlined-icon.svg").default(props);
}
