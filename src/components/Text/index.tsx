/* eslint-disable react-native/no-raw-text */
import { memo, useMemo } from "react";
import equals from "react-fast-compare";
import { StyleSheet, Text as RNText } from "react-native";
import { exists } from "i18next";
import { BaseTextProps } from "./index.props";
import { variantStyle } from "./styles";
import { useStatusColor, useFontStyle } from "./hook";
import MultilangText from "./mutilang_text";

const Text: React.FC<BaseTextProps> = memo(function BaseText({
  style,
  variant = "body2",
  status = "normal",
  fontStyle = "regular",
  multilangKey,
  multilangOptions,
  ...otherProps
}) {
  const statusColor = useStatusColor(status);
  const baseFontStyle = useFontStyle(fontStyle);

  const baseStyle = useMemo(
    () =>
      StyleSheet.flatten([
        { color: statusColor },
        variantStyle[variant],
        baseFontStyle,
        style,
      ]),
    [variant, statusColor, style, fontStyle],
  );

  if (multilangKey) {
    if (!exists(multilangKey, multilangOptions)) {
      return (
        <RNText allowFontScaling={false} style={baseStyle} {...otherProps}>
          {`${multilangOptions?.defaultValue ?? multilangKey}`}
        </RNText>
      );
    }

    return (
      <MultilangText
        multilangKey={multilangKey}
        multilangOptions={multilangOptions}
        style={baseStyle}
      />
    );
  }

  return <RNText allowFontScaling={false} style={baseStyle} {...otherProps} />;
}, equals);

export default Text;
