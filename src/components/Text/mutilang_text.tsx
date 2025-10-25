import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import { MultilangTextProps } from "./index.props";

const MultilangText: React.FC<MultilangTextProps> = function MultilangText({
  multilangOptions,
  multilangKey,
  ...otherProps
}) {
  const { i18n } = useTranslation();

  return (
    <Text allowFontScaling={false} {...otherProps}>
      {i18n.t(multilangKey, multilangOptions)}
    </Text>
  );
};

export default MultilangText;
