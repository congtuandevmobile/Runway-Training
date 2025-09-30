import React, { useEffect, useRef } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import MapView, { PROVIDER_DEFAULT, UrlTile, Marker } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { END_POINT, REGION, START_POINT } from './contant';
import { ITextInputSheetRef, TextInputSheet } from './TextInputSheet';

export interface AirplanePosition {
  latitude: number;
  longitude: number;
}

const AnimatedMarker = Animated.createAnimatedComponent(Marker);

export const HomeScreen: React.FC = function HomeScreen() {
  const startPosition = START_POINT;
  const endPosition = END_POINT;
  const textInputSheetRef = useRef<ITextInputSheetRef>(null);

  const latitude = useSharedValue(startPosition.latitude);
  const longitude = useSharedValue(startPosition.longitude);
  const opacity = useSharedValue(1);

  const calculateBearing = (
    start: AirplanePosition,
    end: AirplanePosition,
  ): number => {
    const startLat = start.latitude * (Math.PI / 180);
    const startLng = start.longitude * (Math.PI / 180);
    const destLat = end.latitude * (Math.PI / 180);
    const destLng = end.longitude * (Math.PI / 180);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);

    const bearing = Math.atan2(y, x) * (180 / Math.PI);
    return (bearing + 360) % 360;
  };

  const initialBearing = calculateBearing(startPosition, endPosition);
  const rotation = useSharedValue(initialBearing);

  const animateAirplane = () => {
    'worklet';
    const bearing = calculateBearing(startPosition, endPosition);

    rotation.value = bearing;

    latitude.value = withDelay(
      1000,
      withTiming(endPosition.latitude, {
        duration: 10000,
        easing: Easing.inOut(Easing.quad),
      }),
    );

    longitude.value = withDelay(
      1000,
      withTiming(endPosition.longitude, {
        duration: 10000,
        easing: Easing.inOut(Easing.quad),
      }),
    );
  };

  // Reset animation
  const resetAirplane = () => {
    'worklet';
    opacity.value = withTiming(0, { duration: 200 }, () => {
      latitude.value = startPosition.latitude;
      longitude.value = startPosition.longitude;
      rotation.value = initialBearing;

      opacity.value = withTiming(1, { duration: 200 });
    });
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
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  useEffect(() => {
    const firstAnimation = setTimeout(() => {
      animateAirplane();
    }, 600);

    const interval = setInterval(() => {
      resetAirplane();
      setTimeout(() => {
        animateAirplane();
      }, 600);
    }, 13000);

    return () => {
      clearTimeout(firstAnimation);
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
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

        <AnimatedMarker
          flat={true}
          anchor={{ x: 0.5, y: 0 }}
          style={animatedMarkerStyle}
          animatedProps={animatedMarkerProps}
          coordinate={{ latitude: latitude.value, longitude: longitude.value }}
        >
          <Animated.View
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
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          textInputSheetRef.current?.present();
        }}
      >
        <Text style={styles.textButton}>{'Nhập dữ liệu'}</Text>
      </TouchableOpacity>

      <TextInputSheet ref={textInputSheetRef} />
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
  },
  airplaneContainer: {
    width: 17,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  airplane: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  airplaneBody: {
    width: 4,
    height: 24,
    backgroundColor: '#fa541c',
    position: 'absolute',
    borderRadius: 2,
  },
  airplaneWings: {
    width: 24,
    height: 4,
    backgroundColor: '#fa541c',
    position: 'absolute',
    borderRadius: 2,
  },
  airplaneTail: {
    width: 12,
    height: 3,
    backgroundColor: '#fa541c',
    position: 'absolute',
    top: 20,
    borderRadius: 1.5,
  },
  airplaneImage: {
    width: 32,
    height: 32,
    tintColor: '#fa541c',
  },
  button: {
    bottom: 60,
    padding: 20,
    borderRadius: 50,
    alignSelf: 'center',
    position: 'absolute',
    backgroundColor: '#fa541c',
  },
  textButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}));
