import { AirplanePosition } from "./type"
import { DeviceEventEmitter } from 'react-native';

export type RouteName = 'P4' | 'P5';

export const REGION = {
    latitude: 10.8188889,
    longitude: 106.6519444,
    latitudeDelta: 0.03,
    longitudeDelta: 0.031,
}

export const START_POINT: AirplanePosition = 
{ latitude: 10.8248507, longitude: 106.6631657 }

export const END_POINT: AirplanePosition = {
    latitude: 10.8150186,
    longitude: 106.6371299
}

export const WAYPOINTS: AirplanePosition[] = [
    START_POINT,
    END_POINT,
]

// export const WAYPOINTS: AirplanePosition[] = [
//   /*-----------Bellow data is START POINT--------------*/  
//   START_POINT,
//   /*---------------------------------------------------*/

//   /*--Bellow is data train "Tại đường lăn 1750m (P4)"--*/
//   { latitude: 10.81851, longitude: 106.64667 }, 
//   { latitude: 10.81520, longitude: 106.64218 },
//   /*---------------------------------------------------*/
// ];

export const P4: AirplanePosition[] = [
  START_POINT,

  /*--Bellow is data train "Tại đường lăn 1750m (P4)"--*/
  { latitude: 10.81851, longitude: 106.64667 }, 
  { latitude: 10.81520, longitude: 106.64218 },
  /*---------------------------------------------------*/
]

export const P5: AirplanePosition[] = [
  START_POINT,

  /* Bellow is data train "Tại đường lăn 2086.35m (P5)"*/
  { latitude: 10.817794, longitude: 106.644555 }, 
  { latitude: 10.815212, longitude: 106.642238 },
  /*---------------------------------------------------*/
]

export function setRoute(name: RouteName, rotSeconds?: number) {
  const next = name === 'P4' ? P4 : P5;
  WAYPOINTS.splice(0, WAYPOINTS.length, ...next); 
  DeviceEventEmitter.emit('route:updated', { name, points: next, rotSeconds});
}



