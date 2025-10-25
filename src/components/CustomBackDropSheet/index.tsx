import { useMemo } from "react";
import { Pressable } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

type IProps = BottomSheetBackdropProps & {
  targetRef?: React.RefObject<BottomSheetModal | null>;
  onPressBackdrop?: () => void;
};

const PressableAnimated = Animated.createAnimatedComponent(Pressable);

export const CustomBackdropSheet: React.FC<IProps> = function BackdropSheet({
  style,
  animatedIndex,
  targetRef,
  onPressBackdrop,
}) {
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0, 1],
      [0, 1, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: "#3f333333",
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle],
  );

  const handlePress = () => {
    onPressBackdrop?.();
    if (targetRef?.current) {
      targetRef.current.dismiss();
    }
  };

  return (
    <PressableAnimated
      pointerEvents={"box-only"}
      style={containerStyle}
      onPress={handlePress}
    />
  );
};
