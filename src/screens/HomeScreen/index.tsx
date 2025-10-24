import React, { useEffect, useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import MapView, {
  PROVIDER_DEFAULT,
  UrlTile,
  Marker,
  Polyline,
} from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { REGION, WAYPOINTS } from './contant';
import { ITextInputSheetRef, TextInputSheet } from './TextInputSheet';
import { calculateBearing, durationMsBySpeed, shortestTurn } from './helper';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { AirplanePosition, AnimateRouteOptions } from './type';
import { Clock } from 'src/components/Clock';

const AIRPLANE_LENGTH = 24;
const WING_THICKNESS = 4;
const TAIL_HEIGHT = 3;

const ROTATE_DURATION = 2000;
const START_MOVE_DELAY = 250;
const SPEED_KMH = 250;

const AnimatedMarker = Animated.createAnimatedComponent(Marker);

export const HomeScreen: React.FC = function HomeScreen() {
  const { theme } = useUnistyles();
  const textInputSheetRef = useRef<ITextInputSheetRef>(null);
  const mapRef = useRef<MapView>(null);
  const [selectModeVisible, setSelectModeVisible] = useState<boolean>(false);

  // const clockStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // const clockStopTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bump, setBump] = useState(0);
  const [showRoute, setShowRoute] = useState<boolean>(false);
  const [routePoints, setRoutePoints] = useState<AirplanePosition[] | null>(
    null,
  );

  const latitude = useSharedValue(WAYPOINTS[0].latitude);
  const longitude = useSharedValue(WAYPOINTS[0].longitude);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(
    calculateBearing(WAYPOINTS[0], WAYPOINTS[1] ?? WAYPOINTS[0]),
  );

  const animateSegment = (
    from: AirplanePosition,
    to: AirplanePosition,
    onDone?: () => void,
    //
    overrideMoveDurationMs?: number,
    isFirstLeg?: boolean
  ) => {
    'worklet';
    const targetBearing = calculateBearing(from, to);
    const delta = shortestTurn(rotation.value, targetBearing);
    // Xoay theo hướng ngắn nhất
    rotation.value = withTiming(rotation.value + delta, {
      duration: ROTATE_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    // Tính duration theo khoảng cách
    const moveDuration = overrideMoveDurationMs ?? durationMsBySpeed(from, to, SPEED_KMH);

    //const moveDuration = durationMsBySpeed(from, to, SPEED_KMH);

    latitude.value = withDelay(
      START_MOVE_DELAY,
      withTiming(to.latitude, {
        duration: moveDuration,
        easing: Easing.inOut(Easing.quad),
      }),
    );
    longitude.value = withDelay(
      START_MOVE_DELAY,
      withTiming(
        to.longitude,
        { duration: moveDuration, easing: Easing.inOut(Easing.quad) },
        finished => {
          'worklet';
          if (finished && onDone) {
            onDone();
          }
          if (finished && isFirstLeg && overrideMoveDurationMs == null) {
            scheduleOnRN(() => {
              DeviceEventEmitter.emit('clock:stop');
            });
          }
        },
      ),
    );
  };

  const animateRoute = (
    wp: ReadonlyArray<AirplanePosition>, 
    loop = true,
    //
    opts?: AnimateRouteOptions, 
  ) => {
    'worklet';
    if (!wp || wp.length < 2) return;
    let i = 0;
    const step = () => {
      const from = wp[i];
      const to = wp[i + 1];
      //
      //const override = i === 0 ? opts?.firstLegDurationMs : undefined; 
      const isFirst = i === 0;
      const override = isFirst ? opts?.firstLegDurationMs : undefined;

      animateSegment(from, to, () => {
        i += 1;
        if (i < wp.length - 1) {
          step();
        } else if (loop) {
          // Reset nhanh rồi chạy lại từ đầu
          opacity.value = withTiming(0, { duration: 160 }, () => {
            latitude.value = wp[0].latitude;
            longitude.value = wp[0].longitude;
            rotation.value = calculateBearing(wp[0], wp[1] ?? wp[0]);

            opacity.value = withTiming(1, { duration: 160 }, () => {
              stepIndex0();
            });
          });
        }
      }, override, isFirst);
    };

    const stepIndex0 = () => {
      i = 0;
      step();
    };
    stepIndex0();
  };

  const animatedMarkerProps = useAnimatedProps(() => {
    return {
      coordinate: {
        latitude: latitude.value,
        longitude: longitude.value,
      },
    };
  });

  const animatedMarkerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animatedAirplaneStyle = useAnimatedStyle(() => {
    return {
      transform: [
        // {
        //   translateY: AIRPLANE_LENGTH / 5,
        // },
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     scheduleOnUI(() => {
  //       'worklet';
  //       animateRoute([...WAYPOINTS], false);
  //     });
  //   }, 600);
  //   return () => clearTimeout(timer);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'route:updated',
      (payload?: { 
        name: 'P4' | 'P5'; 
        points: AirplanePosition[];
        //
        rotSeconds?: number
      }) => {
        if (!payload?.points?.length) return;
        // if (clockStartTimerRef.current) { clearTimeout(clockStartTimerRef.current); clockStartTimerRef.current = null; }
        // if (clockStopTimerRef.current)  { clearTimeout(clockStopTimerRef.current);  clockStopTimerRef.current = null; }
        DeviceEventEmitter.emit('clock:reset'); // ✅

        setShowRoute(true);
        setRoutePoints([...payload.points]);
        setBump(v => v + 1);

        // clockStartTimerRef.current = setTimeout(() => {
        //   DeviceEventEmitter.emit('clock:start');
        // }, START_MOVE_DELAY)

        // if (payload.rotSeconds != null) {
        //   clockStopTimerRef.current = setTimeout(() => {
        //     DeviceEventEmitter.emit('clock:stop');
        //   }, START_MOVE_DELAY + Math.round(payload.rotSeconds * 1000));
        // }

        scheduleOnUI(() => {
          'worklet';
          cancelAnimation?.(latitude);
          cancelAnimation?.(longitude);
          cancelAnimation?.(rotation);
          cancelAnimation?.(opacity);

          opacity.value = withTiming(0, { duration: 160 }, () => {
            // const wp0 = WAYPOINTS[0];
            // const wp1 = WAYPOINTS[1] ?? WAYPOINTS[0];
            const wp0 = payload.points[0];
            const wp1 = payload.points[1] ?? payload.points[0];
            latitude.value = wp0.latitude;
            longitude.value = wp0.longitude;
            rotation.value = calculateBearing(wp0, wp1);

            opacity.value = withTiming(1, { duration: 160 }, () => {
              // animateRoute([...WAYPOINTS], false);
              const firstLegMs = payload.rotSeconds != null ? payload.rotSeconds * 1000 : undefined;
              animateRoute(payload.points, false, { firstLegDurationMs: firstLegMs });
            });
          });
        });
      },
    );
    // return () => sub.remove();
    return () => {
      sub.remove();
      // if (clockStartTimerRef.current) clearTimeout(clockStartTimerRef.current);
      // if (clockStopTimerRef.current) clearTimeout(clockStopTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        rotateEnabled={false}
        region={REGION}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        mapType={Platform.OS === 'ios' ? 'none' : 'standard'}
      >
        <UrlTile
          flipY={false}
          maximumZ={19}
          tileSize={512}
          doubleTileSize={true}
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showRoute && (
          <Polyline
            key={bump}
            geodesic={false}
            zIndex={10}
            lineCap="round"
            strokeWidth={3}
            lineJoin="round"
            strokeColor={theme.blue}
            coordinates={routePoints!}
          />
        )}

        <AnimatedMarker
          flat={true}
          coordinate={WAYPOINTS[0]}
          anchor={{ x: 0.5, y: 0.5 }}
          centerOffset={{ x: 0, y: 6 }}
          style={animatedMarkerStyle}
          animatedProps={animatedMarkerProps}
        >
          <Animated.View
            collapsable={false}
            style={[styles.airplaneContainer, animatedAirplaneStyle]}
          >
            <View style={styles.airplane}>
              <View style={styles.airplaneBody} />
              <View style={styles.airplaneWings} />
              <View style={styles.airplaneTail} />
            </View>
          </Animated.View>
        </AnimatedMarker>
      </MapView>

      <Clock/>

      <Modal transparent visible={selectModeVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {'Bạn muốn nhập loại dữ liệu nào?'}
            </Text>

            <TouchableOpacity
              style={styles.choiceBtn}
              onPress={() => {
                setSelectModeVisible(false);
                textInputSheetRef.current?.present('estimated');
              }}
            >
              <Text style={styles.choiceText}>{'Dữ liệu thực'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.choiceBtn}
              onPress={() => {
                setSelectModeVisible(false);
                textInputSheetRef.current?.present('forecast');
              }}
            >
              <Text style={styles.choiceText}>{'Dữ liệu dự đoán'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.primary }]}
              onPress={() => setSelectModeVisible(false)}
            >
              <Text style={styles.cancelText}>Huỷ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setSelectModeVisible(true)}
      >
        <Text style={styles.textButton}>{'Nhập dữ liệu'}</Text>
      </TouchableOpacity>

      <TextInputSheet ref={textInputSheetRef} />
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
  },
  airplaneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  airplane: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  airplaneBody: {
    top: 0,
    width: 4,
    height: 24,
    borderRadius: 2,
    position: 'absolute',
    backgroundColor: theme.primary,
  },
  airplaneWings: {
    width: 24,
    borderRadius: 2,
    position: 'absolute',
    height: WING_THICKNESS,
    backgroundColor: theme.primary,
    top: AIRPLANE_LENGTH / 2 - WING_THICKNESS / 2,
  },
  airplaneTail: {
    borderRadius: 1.5,
    position: 'absolute',
    backgroundColor: theme.primary,
    top: AIRPLANE_LENGTH - TAIL_HEIGHT,
    width: 12,
    height: TAIL_HEIGHT,
  },

  airplaneImage: {
    width: 32,
    height: 32,
    tintColor: theme.primary,
  },
  button: {
    bottom: 60,
    borderRadius: 50,
    alignSelf: 'center',
    position: 'absolute',
    backgroundColor: theme.primary,
    padding: theme.typography.spacings.LS,
  },
  textButton: {
    textAlign: 'center',
    fontWeight: '600',
    color: theme.character_white,
    fontSize: theme.typography.fontSizes.L,
  },

  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  card: {
    width: '80%',
    gap: theme.typography.spacings.S,
    padding: theme.typography.spacings.L,
    backgroundColor: theme.character_white,
    borderRadius: theme.typography.radius.M,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    color: theme.primary,
    fontSize: theme.typography.fontSizes.LS,
    marginBottom: theme.typography.spacings.M,
  },
  choiceBtn: {
    alignItems: 'center',
    backgroundColor: theme.primary,
    borderRadius: theme.typography.radius.M,
    paddingVertical: theme.typography.spacings.M,
  },
  choiceText: {
    fontWeight: '600',
    color: theme.character_white,
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: theme.typography.radius.M,
    paddingVertical: theme.typography.spacings.S,
    alignItems: 'center',
    marginTop: theme.typography.spacings.S,
    backgroundColor: 'transparent',
  },
  cancelText: {
    fontWeight: '600',
    color: theme.primary,
  },
}));
