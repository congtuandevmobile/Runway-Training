import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import InfoToTrainingSheet, {
  FormValues,
  Mode,
} from 'src/sheet-modals/InfoToTrainingSheet';
import { CustomBackdropSheet } from 'src/components/CustomBackDropSheet';
import { StyleSheet } from 'react-native-unistyles';
import { InteractionManager, Keyboard } from 'react-native';

export interface ITextInputSheetRef {
  present: (mode: Mode) => void;
}
type Props = {
  onSubmit?: (payload: {
    mode: Mode;
    data: FormValues;
    result?: string;
  }) => void;
};

export const TextInputSheet = forwardRef<ITextInputSheetRef, Props>(
  function TextInputSheet(props, ref) {
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const [mode, setMode] = useState<Mode>('forecast');

    const onClose = () => {
      Keyboard.dismiss();

      requestAnimationFrame(() => {
        InteractionManager.runAfterInteractions(() => {
          bottomSheetRef.current?.dismiss();
        });
      });
    };

    useImperativeHandle(ref, () => ({
      present(nextMode: Mode) {
        setMode(nextMode);
        bottomSheetRef.current?.present();
      },
    }));

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        enablePanDownToClose
        stackBehavior="switch"
        keyboardBlurBehavior="restore"
        keyboardBehavior="interactive"
        // eslint-disable-next-line react/no-unstable-nested-components, @typescript-eslint/no-shadow
        backdropComponent={props => (
          <CustomBackdropSheet {...props} targetRef={bottomSheetRef} />
        )}
      >
        <BottomSheetView style={styles.rootView}>
          <InfoToTrainingSheet
            mode={mode}
            onClose={onClose}
            onSubmit={(payload) => {
              props.onSubmit?.(payload);
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
});
