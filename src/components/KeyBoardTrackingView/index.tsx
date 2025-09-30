import { memo, useEffect, useMemo, useState } from "react";
import { Keyboard, StyleProp, TextInput, ViewStyle } from "react-native";
import Animated, {
  BaseAnimationBuilder,
  LayoutAnimationFunction,
  measure,
  useAnimatedRef,
  useAnimatedStyle,
} from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";
import { useGlobalAnimatedKeyboard } from "src/hooks/useAnimatedKeyBoard";

interface Props {
  children: React.ReactNode | ((isKeyboardOpened: boolean) => React.ReactNode);

  /**For view wrapper tracking view */
  style?: StyleProp<ViewStyle>;

  layoutAnimated?:
    | BaseAnimationBuilder
    | LayoutAnimationFunction
    | typeof BaseAnimationBuilder;

  /**Ignore inset bottom when keyboard shown
   * @platform ios
   */
  excludeBottomInset?: number;

  /**This method to handler input with multiline
   * @cause multiline not auto push up input inside scrollable component
   * @platform ios only
   * @resolve use this offset calculated to manual scroll with reference of scrollable component
   */
  onAvoidInputOffset?: (offset: number) => void;

  /**Fire when keyboard end of animation to opened */
  onKeyboardOpened?: () => void;
}

// bug: still has issue on case auto focus entire screen -> when previous screen have KeyboardAccessoryView is focusing
/**
 * Auto avoid keyboard by marginBottom animation
 */
const KeyboardTrackingView: React.FC<Props> = memo(
  function KeyboardTrackingView({ excludeBottomInset = 0, ...props }) {
    const [keyboardOpened, setKeyboardOpened] = useState(false);

    const animatedRef = useAnimatedRef<Animated.View>();

    const { height: keyboardHeight } = useGlobalAnimatedKeyboard();

    const onAvoidInputOffsetRN = (offset: number) => {
      props.onAvoidInputOffset?.(offset);
    };

    const handleAvoidOffsetUI = (endY: number, inputHeight: number) => {
      "worklet";
      const layout = measure(animatedRef);
      if (!layout) return;

      const trackingViewPageY = layout.pageY;
      const translateInput = endY - trackingViewPageY;

      if (translateInput < inputHeight * 0.3) return;

      scheduleOnRN(onAvoidInputOffsetRN, translateInput);
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        paddingBottom: keyboardHeight.value - excludeBottomInset,
      };
    }, [excludeBottomInset]);

    useEffect(() => {
      const keyboardShowListen = Keyboard.addListener("keyboardDidShow", () => {
        props.onKeyboardOpened?.();
        setKeyboardOpened(true);

        // Handle auto scroll when keyboard show with input multiline
        const inputFocus = TextInput.State.currentlyFocusedInput();

        // process avoid offset
        if (!props.onAvoidInputOffset || !inputFocus) return;

        inputFocus.measureInWindow((_, y, __, height) => {
          const endCoorsOfInput = y + height;
          scheduleOnUI(handleAvoidOffsetUI, endCoorsOfInput, height);
        });
      });

      const keyboardHideListen = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardOpened(false);
      });

      return () => {
        keyboardShowListen.remove();
        keyboardHideListen.remove();
      };
    }, [props.onKeyboardOpened, props.onAvoidInputOffset]);

    const children = useMemo(() => {
      if (typeof props.children === "function") {
        return props.children(keyboardOpened);
      }

      return props.children;
    }, [props.children, keyboardOpened]);

    return (
      <Animated.View
        ref={animatedRef}
        layout={props.layoutAnimated}
        style={[props.style, animatedStyle]}
      >
        {children}
      </Animated.View>
    );
  },
);

export default KeyboardTrackingView;
