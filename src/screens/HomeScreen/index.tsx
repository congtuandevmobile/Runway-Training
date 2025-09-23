import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
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

export interface AirplanePosition {
  latitude: number;
  longitude: number;
}

const AnimatedMarker = Animated.createAnimatedComponent(Marker);

export const HomeScreen: React.FC = function HomeScreen() {
  const startPosition = START_POINT
  const endPosition = END_POINT;

  const latitude = useSharedValue(startPosition.latitude);
  const longitude = useSharedValue(startPosition.longitude);
//   const rotation = useSharedValue(0);
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

    rotation.value = bearing

    // rotation.value = withTiming(bearing, {
    //   duration: 2000,
    //   easing: Easing.out(Easing.quad),
    // });

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

        {/* Animated Marker cho máy bay */}
        <AnimatedMarker
          flat={true}
          anchor={{ x: 0.5, y: 0}}
          style={animatedMarkerStyle}
          animatedProps={animatedMarkerProps}
        //   coordinate={{ latitude: 0, longitude: 0 }}
          coordinate={{ latitude: latitude.value, longitude: longitude.value }}
        >
          <Animated.View
            style={[styles.airplaneContainer, animatedAirplaneStyle]}
          >
            {/* Custom airplane shape */}
            <View style={styles.airplane}>
              <View style={styles.airplaneBody} />
              <View style={styles.airplaneWings} />
              <View style={styles.airplaneTail} />
            </View>
          </Animated.View>
        </AnimatedMarker>

        {/* <Marker
          pinColor="green"
          title="Điểm khởi hành"
          coordinate={startPosition}
        /> */}

        {/* <Marker pinColor="red" title="Điểm đến" coordinate={endPosition} /> */}
      </MapView>
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
    backgroundColor: '#f0f321ff',
    position: 'absolute',
    borderRadius: 2,
  },
  airplaneWings: {
    width: 24,
    height: 4,
    backgroundColor: '#f0f321ff',
    position: 'absolute',
    borderRadius: 2,
  },
  airplaneTail: {
    width: 12,
    height: 3,
    backgroundColor: '#f0f321ff',
    position: 'absolute',
    top: 20,
    borderRadius: 1.5,
  },
  airplaneImage: {
    width: 32,
    height: 32,
    tintColor: '#f0f321ff',
  },
}));
