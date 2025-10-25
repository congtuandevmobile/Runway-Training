import {
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from 'src/components/Text';
import { TemplateHeaderSheet } from 'src/components/TemplateHeaderSheet';
import { StyleSheet } from 'react-native-unistyles';
import { stylesGlobal } from 'src/themes/styles';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

interface IProps {
  onClose: () => void;
  onSubmit: () => void;
}

type FormValues = {
  aircraftType: string;
  finalApproach: string;
  temperature: string;
  time: string;
  windspeed: string;
  visibility: string;
};

const InfoToTrainningSheet: React.FC<IProps> = function InfoToTrainningSheet(
  props,
) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      aircraftType: '',
      finalApproach: '',
      temperature: '',
      time: '',
      windspeed: '',
      visibility: '',
    },
  });

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const onSubmitForm = (data: FormValues) => {
    console.log('Training form data:', data); 
    props.onSubmit();
  };

  return (
    <View style={styles.root}>
      <TemplateHeaderSheet
        title="Nhập dữ liệu"
        isShowBackIcon
        isShowBorderBottom
        onBack={props.onClose}
      />

      <View style={styles.container}>
        <View style={styles.row}>
          <View style={[styles.textInputContainer]}>
            <Text style={styles.titleText}>{'Loại máy bay'}</Text>
            <Controller
              name="aircraftType"
              control={control}
              rules={{ required: 'Hãy nhập loại máy bay' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  placeholder="Loại máy bay (VD: A320/ B738/ A333...)"
                  style={[
                    styles.textInput,
                    errors.aircraftType && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.aircraftType ? (
              <Text style={styles.errorText}>
                {errors.aircraftType.message}
              </Text>
            ) : (
              <Text style={styles.errorText}>{''}</Text>
            )}
          </View>

          <View style={[styles.textInputContainer]}>
            <Text style={styles.titleText}>{'Tiếp cận cuối'}</Text>
            <Controller
              name="finalApproach"
              control={control}
              rules={{ required: 'Hãy nhập tốc độ/giá trị tiếp cận cuối' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  placeholder="Tiếp cận cuối (VD: 140)"
                  style={[
                    styles.textInput,
                    errors.finalApproach && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              )}
            />
            {errors.finalApproach ? (
              <Text style={styles.errorText}>
                {errors.finalApproach.message}
              </Text>
            ) : (
              <Text style={styles.errorText}>{''}</Text>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.textInputContainer}>
            <Text style={styles.titleText}>{'Nhiệt độ'}</Text>
            <Controller
              name="temperature"
              control={control}
              rules={{ required: 'Hãy nhập nhiệt độ' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  placeholder="Nhiệt độ (°C)"
                  style={[
                    styles.textInput,
                    errors.temperature && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              )}
            />
            {errors.temperature ? (
              <Text style={styles.errorText}>{errors.temperature.message}</Text>
            ) : (
              <Text style={styles.errorText}>{''}</Text>
            )}
          </View>

          <View style={styles.textInputContainer}>
            <Text style={styles.titleText}>{'Thời gian'}</Text>
            <Controller
              name="time"
              control={control}
              rules={{ required: 'Hãy nhập thời gian' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  placeholder="Thời gian (VD: 12:30 hoặc ROT 55s)"
                  style={[styles.textInput, errors.time && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.time ? (
              <Text style={styles.errorText}>{errors.time.message}</Text>
            ) : (
              <Text style={styles.errorText}>{''}</Text>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.textInputContainer}>
            <Text style={styles.titleText}>{'Tốc độ gió'}</Text>
            <Controller
              name="windspeed"
              control={control}
              rules={{ required: 'Hãy nhập tốc độ gió' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  placeholder="Tốc độ gió (kts hoặc m/s)"
                  style={[
                    styles.textInput,
                    errors.windspeed && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              )}
            />

            {errors.windspeed ? (
              <Text style={styles.errorText}>{errors.windspeed.message}</Text>
            ) : (
              <Text style={styles.errorText}>{''}</Text>
            )}
          </View>

          <View style={styles.textInputContainer}>
            <Text style={styles.titleText}>{'Tầm nhìn'}</Text>
            <Controller
              name="visibility"
              control={control}
              rules={{ required: 'Hãy nhập tầm nhìn' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  placeholder="Tầm nhìn (m/km)"
                  style={[
                    styles.textInput,
                    errors.visibility && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              )}
            />
            {errors.visibility ? (
              <Text style={styles.errorText}>{errors.visibility.message}</Text>
            ) : (
              <Text style={styles.errorText}>{''}</Text>
            )}
          </View>
        </View>
      </View>

      <KeyboardAvoidingView>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmitForm)}
        >
          <Text variant={'subtitle2'} style={styles.textButton}>
            {'Xác nhận training với dữ liệu trên'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  root: {
    gap: theme.typography.spacings.L,
    paddingBottom: stylesGlobal.paddingBottomWithInset.paddingBottom,
  },
  container: {
    // flex: 1,
    marginHorizontal: theme.typography.spacings.L,
  },
  textInputContainer: {
    flex: 1,
    // gap: theme.typography.spacings.XS,
    marginBottom: theme.typography.spacings.XS,
  },
  titleText: {
    marginBottom: theme.typography.spacings.XS,
  },
  textInput: {
    borderWidth: 0.7,
    borderColor: theme.neutral_7,
    padding: theme.typography.spacings.S,
    borderRadius: theme.typography.radius.S,
  },
  row: {
    flexDirection: 'row',
    gap: theme.typography.spacings.XS,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: theme.typography.radius.M,
    paddingVertical: theme.typography.spacings.S,
    marginHorizontal: theme.typography.spacings.L,
  },
  textButton: {
    color: theme.character_white,
  },
  inputError: {
    borderColor: theme.character_danger,
  },
  errorText: {
    marginTop: 2,
    color: theme.character_danger,
    fontSize: theme.typography.fontSizes.M,
  },
}));

export default InfoToTrainningSheet;
