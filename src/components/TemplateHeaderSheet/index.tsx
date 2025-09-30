import React from "react";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { BaseTextProps } from "../Text/index.props";
import Text from "../Text";
import { CaretLeft, CloseOutlinedIcon } from "src/assets/svgs";

interface IProps {
  title?: string;
  textProps?: BaseTextProps;

  isShowBorderBottom?: boolean;
  isShowBackIcon?: boolean;
  isShowCloseIcon?: boolean;

  /**
   * Will alignment title to left and hide back icon
   */
  isLeftAlignTitle?: boolean;

  handleChangedValue?: boolean;
  isRightTitleReset?: boolean;
  onPressReset?: () => void;

  onBack?: () => void;
  onClose?: () => void;
}

const hitSlotAction: TouchableOpacityProps["hitSlop"] = {
  left: 10,
  right: 10,
  top: 8,
  bottom: 9,
};

export const TemplateHeaderSheet: React.FC<IProps> =
  function TemplateHeaderSheet(props) {
    return (
      <View
        style={[styles.root, props.isShowBorderBottom && styles.borderBottom]}
      >
        {!props.isLeftAlignTitle && (
          <TouchableOpacity
            disabled={!props.isShowBackIcon}
            hitSlop={hitSlotAction}
            style={!props.isShowBackIcon && styles.inVisible}
            onPress={props.onBack}
          >
            <CaretLeft />
          </TouchableOpacity>
        )}

        <Text
          fontStyle="semi-bold"
          variant="h4"
          {...props.textProps}
          style={[
            styles.title,
            props.isLeftAlignTitle && styles.leftAlignTitle,
            props.textProps?.style,
          ]}
        >
          {props.title}
        </Text>

        <TouchableOpacity
          disabled={!props.isShowCloseIcon}
          hitSlop={hitSlotAction}
          style={!props.isShowCloseIcon && styles.inVisible}
          onPress={props.onClose}
        >
          <CloseOutlinedIcon width={20} />
        </TouchableOpacity>

        {props.isRightTitleReset && (
          <TouchableOpacity
            hitSlop={hitSlotAction}
            style={styles.buttonReset}
            onPress={props.onPressReset}
          >
            <Text
              fontStyle="medium"
              multilangKey="general.reset"
              style={styles.txtReset}
              variant="body1"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

const styles = StyleSheet.create((theme) => ({
  borderBottom: {
    borderBottomColor: theme.conditional_button_divider,
    borderBottomWidth: 0.5,
  },
  buttonReset: {
    // paddingVertical: theme.typography.spacings.XXS
    position: "absolute",
    right: theme.typography.spacings.L,
  },
  inVisible: {
    opacity: 0,
  },
  leftAlignTitle: {
    textAlign: "left",
  },
  root: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.typography.spacings.L,
    paddingHorizontal: theme.typography.spacings.L,
    paddingVertical: theme.typography.spacings.XS,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  txtReset: {
    color: theme.character_secondary_2,
  },
}));
