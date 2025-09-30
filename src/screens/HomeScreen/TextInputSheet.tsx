import { forwardRef, useImperativeHandle, useRef } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import InfoToTrainningSheet from 'src/sheet-modals/InfoToTrainingSheet';
import { CustomBackdropSheet } from 'src/components/CustomBackDropSheet';
import { StyleSheet } from 'react-native-unistyles';
import { InteractionManager, Keyboard } from 'react-native';

export interface ITextInputSheetRef {
  present: () => void;
}
type Props = {
  // This type is empty
};

export const TextInputSheet = forwardRef<ITextInputSheetRef, Props>(
  function TextInputSheet(_props, ref) {
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const onClose = () => {
      Keyboard.dismiss();

      requestAnimationFrame(() => {
        InteractionManager.runAfterInteractions(() => {
          bottomSheetRef.current?.dismiss();
        });
      });
    };

    const onSubmit = () => {
      /*Handle before close bottom sheet*/

      onClose();
    };

    useImperativeHandle(ref, () => ({
      present() {
        bottomSheetRef.current?.present();
      },
    }));

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        // snapPoints={['90%']}
        enableDynamicSizing
        enablePanDownToClose
        stackBehavior="switch"
        keyboardBlurBehavior="restore"
        keyboardBehavior="interactive"
        backdropComponent={props => (
          <CustomBackdropSheet {...props} targetRef={bottomSheetRef} />
        )}
      >
        <BottomSheetView style={styles.rootView}>
          <InfoToTrainningSheet onClose={onClose} onSubmit={onSubmit} />
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
