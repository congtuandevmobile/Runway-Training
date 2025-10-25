
import { FontSize, FontFamily } from "src/themes/typography";
import { TextVariant, VariantStyle } from "./index.props";

export const variantStyle: Record<TextVariant, VariantStyle> = {
  h1: {
    fontSize: FontSize.XXXL,
    lineHeight: 40,
    fontFamily: FontFamily.regular,
  },
  h2: {
    fontSize: FontSize.XXL,
    lineHeight: 36,
    fontFamily: FontFamily.regular,
  },
  h3: { fontSize: FontSize.XL, lineHeight: 26, fontFamily: FontFamily.regular },
  h4: { fontSize: FontSize.LS, lineHeight: 24, fontFamily: FontFamily.regular },

  subtitle1: {
    fontSize: FontSize.L,
    lineHeight: 22,
    fontFamily: FontFamily.regular,
  },
  subtitle2: {
    fontSize: FontSize.MS,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
  },

  body1: {
    fontSize: FontSize.MS,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
  },
  body2: {
    fontSize: FontSize.M,
    lineHeight: 16,
    fontFamily: FontFamily.regular,
  },
} as const;

export const headingStyle = {
  h1: {
    fontSize: 32,
    lineHeight: 48,
    fontFamily: FontFamily.bold,
  },
  h2: {
    fontSize: 28,
    lineHeight: 42,
    fontFamily: FontFamily.bold,
  },
  h3: { fontSize: 22, lineHeight: 33, fontFamily: FontFamily.medium },
  h4: { fontSize: 18, lineHeight: 27, fontFamily: FontFamily.medium },
  h5: { fontSize: 16, lineHeight: 24, fontFamily: FontFamily.medium },
  h6: { fontSize: 14, lineHeight: 21, fontFamily: FontFamily.medium },
} as const;
