import {
  createContext,
  createElement,
  PropsWithChildren,
  useContext,
} from "react";
import {
  AnimatedKeyboardInfo,
  useAnimatedKeyboard,
} from "react-native-reanimated";

const context = createContext<AnimatedKeyboardInfo | undefined>(undefined);

export function useGlobalAnimatedKeyboard() {
  const info = useContext(context);

  if (!info) {
    throw new Error(
      "Please wrap `KeyboardAnimatedProvider` in your root view!!!",
    );
  }

  return info;
}

export function KeyboardAnimatedProvider(props: PropsWithChildren) {
  const info = useAnimatedKeyboard({
    // BUG not render height when keyboard opened
    isStatusBarTranslucentAndroid: true,

    // disable in 2.6 to false -> will fix in 2.7
    //BUG: current not many places with bottom insets
    isNavigationBarTranslucentAndroid: true,
  });

  return createElement(
    context.Provider,
    {
      value: info as unknown as AnimatedKeyboardInfo,
    },
    props.children,
  );
}
