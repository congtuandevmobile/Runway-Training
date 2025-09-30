import { StyleProp, TextProps, TextStyle } from "react-native";
import { TOptions } from "i18next";

export type TextVariant =
  | "h1"
  /**
   * fontSize: 30
   * lineHeight: 30
   */
  | "h2"
  /**
   * fontSize: 24
   * lineHeight: 28
   */
  | "h3"
  /**
   * fontSize: 20
   * lineHeight: 26
   */
  | "h4"
  /**
   * fontSize: 18
   * lineHeight: 24
   */
  | "subtitle1"
  /**
   * fontSize: 16
   * lineHeight: 22
   */
  | "subtitle2"
  /**
   * fontSize: 14
   * lineHeight: 20
   */
  | "body1"
  /**
   * fontSize: 14
   * lineHeight: 20
   */
  | "body2";
/**
 * fontSize: 12
 * lineHeight: 16
 */
export type VariantStyle = Pick<
  TextStyle,
  "fontSize" | "lineHeight" | "fontFamily"
>;
/**
 * @value normal: black_03 - #333333
 * @value success: green_02 - #46C25A"
 * @value error: red_01 - #EC2323"
 * @value info: grey_05 - #888888"
 * @value warning: orange_06 - #FFB320"
 */
export type TextStatus = "success" | "error" | "normal" | "info" | "warning";
export type TextFontStyle = "regular" | "medium" | "semi-bold" | "bold";
export interface BaseTextProps
  extends Omit<TextProps, "allowFontScaling" | "style"> {
  /**
   * @default body2
   *
   * @variant h1: fontSize: 30 - lineHeight: 30
   * @variant h2: fontSize: 24 - lineHeight: 28
   * @variant h3: fontSize: 20 - lineHeight: 26
   * @variant h4: fontSize: 18 - lineHeight: 24
   * @variant subtitle1: fontSize: 16 - lineHeight: 22
   * @variant subtitle2: fontSize: 14 - lineHeight: 20
   * @variant body1: fontSize: 14 - lineHeight: 20
   * @variant body2: fontSize: 12 - lineHeight: 16
   *
   */
  variant?: TextVariant;
  multilangKey?: MultiLangKey;
  multilangOptions?: TOptions;
  /**
   * The text color will change base on this status
   *
   * @default normal
   *
   */
  status?: TextStatus;
  /**
   * @default regular
   */
  fontStyle?: TextFontStyle;
  style?: StyleProp<Omit<TextStyle, "fontFamily">>;
}

export interface MultilangTextProps extends BaseTextProps {
  style?: StyleProp<TextStyle>;
}
