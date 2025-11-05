import {
  ActivityIndicator,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from 'src/components/Text';
import { TemplateHeaderSheet } from 'src/components/TemplateHeaderSheet';
import { StyleSheet } from 'react-native-unistyles';
import { stylesGlobal } from 'src/themes/styles';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { RouteName, setRoute } from 'src/screens/HomeScreen/contant';
import {
  inferExitLocationAndRot,
  routeByExitLocation,
} from 'src/data/rot-data';
import { PredictPayload, PredictResponse } from 'src/screens/HomeScreen/type';
import { postJSON } from 'src/utils/api';
import { formatPredictResponse, Formatted } from 'src/api/helper';

type Result = { routeName: RouteName; rot: number };

export type Mode = 'forecast' | 'estimated';
interface IProps {
  mode: Mode;
  onClose: () => void;
  onSubmit: (payload: {
    mode: Mode;
    data: FormValues;
    result?: RouteName;
  }) => void;
}

export type FormValues = {
  aircraftType: string;
  finalApproach: string;
  temperature: string;
  time: string;
  windspeed: string;
  visibility: string;
};
const delay = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const InfoToTrainingSheet: React.FC<IProps> = function InfoToTrainningSheet(
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

  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'processing' | 'result' | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [formatted, setFormatted] = useState<Formatted | null>();
  const [showMore, setShowMore] = useState<boolean>(false);

  const onSubmitForm = async (_data: FormValues) => {
    if (props.mode === 'estimated') {
      const inferred = inferExitLocationAndRot({
        aircraftType: _data.aircraftType,
        finalApproach: _data.finalApproach,
        temperature: _data.temperature,
        time: _data.time,
        windspeed: _data.windspeed,
        visibility: _data.visibility,
      });

      if (!inferred) {
        console.log('Không Tìm Thấy ROT và Exit Location phù hợp');
        setVisible(true);
        setPhase('result');
        setResult(null);
        return;
      }

      const routeName = routeByExitLocation(inferred.exit_location);

      if (!routeName) {
        setVisible(true);
        setPhase('result');
        setResult(null);
        return;
      }

      props.onSubmit?.({ mode: props.mode, data: _data, result: routeName });
      setVisible(true);
      setPhase('result');
      setResult({ routeName, rot: inferred.rotSeconds });
      return;
    }

    setVisible(true);
    setPhase('processing');
    setResult(null);

    const minSpinMs = randomBetween(5000, 10000);

    const payload: PredictPayload = {
      final_approach: Number(_data.finalApproach),
      aircraft_type: _data.aircraftType as 'Heavy' | 'Medium' | 'Light',
      temperature: Number(_data.temperature),
      time: _data.time as 'Day' | 'Night',
      windspeed: Number(_data.windspeed),
      visibility: Number(_data.visibility),
    };

    const [res] = await Promise.all([
      postJSON<PredictResponse>('/predict', payload, 15000),
      delay(minSpinMs),
    ]);

    //const res = await postJSON<PredictResponse>('/predict', payload, 15000);

    if (res.status !== 'success' || !res.data) {
      throw new Error(res.message || 'Gọi API thất bại!');
    }

    const data = formatPredictResponse(res.data);

    setFormatted(data);
    setResult({ routeName: data.best_run_way, rot: data.best_rot });
    setPhase('result');
  };

  const onConfirm = () => {
    if (result) {
      setRoute(result.routeName, result.rot);
      setTimeout(() => {
        DeviceEventEmitter.emit('clock:start');
      }, 250 + 3000);

      if (typeof result.rot === 'number') {
        setTimeout(() => {
          DeviceEventEmitter.emit('clock:stop');
        }, 3250 + Math.round(result.rot * 1000));
      }
    }

    setVisible(false);
    setPhase(null);
    setResult(null);
    props.onClose();
  };

  const runwayLabel = formatted
    ? formatted.best_run_way === 'P4'
      ? '1750m'
      : formatted.best_run_way === 'P5'
      ? '2086.35m'
      : '1850m'
    : undefined;

  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <View style={styles.root}>
      <TemplateHeaderSheet
        isShowBackIcon
        isShowBorderBottom
        onBack={props.onClose}
        title={props.mode === 'forecast' ? 'Dữ liệu dự đoán' : 'Dữ liệu thực'}
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
                  placeholder="VD: Heavy, Medium,..."
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
                  placeholder="VD: 140, 153,..."
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
            <Text style={styles.titleText}>{'Nhiệt độ (°C)'}</Text>
            <Controller
              name="temperature"
              control={control}
              rules={{ required: 'Hãy nhập nhiệt độ' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  placeholder="VD: 40, 28,..."
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
                  placeholder="VD: Night, Day"
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
            <Text style={styles.titleText}>{'Tốc độ gió (kts hoặc m/s)'}</Text>
            <Controller
              name="windspeed"
              control={control}
              rules={{ required: 'Hãy nhập tốc độ gió' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  placeholder="VD: 2, 3, -1,..."
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
              rules={{ required: 'Hãy nhập tầm nhìn (m/km)' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  placeholder="VD: 8, 9, 10,..."
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
            {props.mode === 'forecast'
              ? 'Xác nhận training với dữ liệu trên'
              : 'Xác nhận chạy với dữ liệu thực trên'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            {phase === 'processing' ? (
              <View style={styles.modalItem}>
                <ActivityIndicator size="large" />
                <Text variant='subtitle1' style={styles.title}>{'Đang training…'}</Text>
                <Text variant='subtitle2' style={styles.sub}>
                  {'Vui lòng đợi cho đến khi có kết quả!'}
                </Text>
              </View> 
            ) : (
              <View style={styles.modalItem}>
                <Text fontStyle='semi-bold' variant="h2" style={styles.title}>
                  {props.mode === 'forecast'
                    ? 'Kết quả training'
                    : 'Kết quả ROT thực'}
                </Text>
                {formatted ? (
                  <>
                    <Text style={styles.result}>
                      {'Xác suất sử dụng lối thoát đường lăn '}
                      <Text fontStyle="bold" style={styles.result}>
                        {runwayLabel}
                      </Text>
                      {' là cao nhất với giá trị: '}
                      <Text fontStyle="bold" style={styles.result}>
                        {formatted.best_probability.toFixed(4)}
                      </Text>
                      {' và ROT trung bình là: '}
                      <Text fontStyle="bold" style={styles.result}>
                        {`${formatted.best_rot.toFixed(2)}s`}
                      </Text>
                    </Text>

                    {showMore && (
                      <View style={styles.detailsBox}>
                        {formatted.P4 && (
                          <Text variant='subtitle2' style={styles.detailLine}>
                            {"Đường lăn 1750m: \n"} 
                            <Text variant='body1'>✈︎ p = {formatted.P4.probability.toFixed(4,)}{"\n"}</Text>
                            <Text variant='body1'>✈︎ ROT = {formatted.P4.rot.toFixed(2)}s</Text>
                          </Text>
                        )}
                        {formatted.SPECIAL && (
                          <Text variant='subtitle2' style={styles.detailLine}>
                            {"Đường lăn 1850m: \n"} 
                            <Text variant='body1'>✈︎ p = {formatted.SPECIAL.probability.toFixed(4,)}{"\n"}</Text>
                            <Text variant='body1'>✈︎ ROT = {formatted.SPECIAL.rot.toFixed(2)}s</Text>
                          </Text>
                        )}
                        {formatted.P5 && (
                          <Text variant='subtitle2' style={styles.detailLine}>
                            {"Đường lăn 2086.35m: \n"} 
                            <Text variant='body1'>✈︎ p = {formatted.P5.probability.toFixed(4,)}{"\n"}</Text>
                            <Text variant='body1'>✈︎ ROT = {formatted.P5.rot.toFixed(2)}s</Text>
                          </Text>
                        )}
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.seeMoreBtn}
                      onPress={() => setShowMore(v => !v)}
                    >
                      <Text fontStyle='semi-bold' style={styles.seeMoreText}>
                        {showMore ? 'Ẩn bớt' : 'Xem chi tiết'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.result}>
                      Đường: {result?.routeName}
                    </Text>
                    <Text style={styles.result}>ROT: {result?.rot} giây</Text>
                  </>
                )}

                {/* <Text style={styles.result}>Đường: {result?.routeName}</Text>
                <Text style={styles.result}>ROT: {result?.rot} giây</Text> */}
                <TouchableOpacity
                  style={styles.buttonModal}
                  onPress={onConfirm}
                >
                  <Text variant="subtitle2" style={styles.textButton}>
                    {'Xác nhận'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  root: {
    gap: theme.typography.spacings.L,
    paddingBottom: stylesGlobal.paddingBottomWithInset.paddingBottom,
  },
  container: {
    marginHorizontal: theme.typography.spacings.L,
  },
  textInputContainer: {
    flex: 1,
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

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '80%',
    borderRadius: theme.typography.radius.M,
    paddingHorizontal: theme.typography.spacings.L,
    paddingVertical: theme.typography.spacings.XL,
    backgroundColor: theme.character_white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.typography.spacings.S,
  },
  title: {
    // fontWeight: '700',
    color: theme.primary,
    // fontSize: theme.typography.fontSizes.L,
  },
  sub: {
    color: theme.primary,
    // fontSize: theme.typography.fontSizes.MS,
  },
  result: {
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.L,
    color: theme.primary,
  },
  buttonModal: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: theme.typography.radius.M,
    paddingVertical: theme.typography.spacings.S,
    paddingHorizontal: theme.typography.spacings.L,
  },
  modalItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.typography.spacings.S,
  },

  seeMoreBtn: {
    // paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: theme.primary,
    borderRadius: theme.typography.radius.S,
    paddingHorizontal: theme.typography.spacings.S,
  },
  seeMoreText: {
    color: theme.primary,
  },
  detailsBox: {
    width: '100%',
    gap: theme.typography.spacings.S,
    padding: theme.typography.spacings.S,
    borderRadius: theme.typography.radius.S,
  },
  detailLine: {
    color: theme.primary,
  },
}));

export default InfoToTrainingSheet;

// "final_approach": 150,

// "aircraft_type": "Medium",

// "temperature": 30,

// "time": "Night",

// "windspeed": 2,

// "visibility": 9
