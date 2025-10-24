'use strict';
import type { LatLng } from './type';

export function toRad(deg: number) { 'worklet'; return (deg * Math.PI) / 180; }
export function toDeg(rad: number) { 'worklet'; return (rad * 180) / Math.PI; }

export function calculateBearing(a: LatLng, b: LatLng): number {
  'worklet';
  const φ1 = toRad(a.latitude), λ1 = toRad(a.longitude);
  const φ2 = toRad(b.latitude), λ2 = toRad(b.longitude);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

export function shortestTurn(currentDeg: number, targetDeg: number): number {
  'worklet';
  return ((targetDeg - currentDeg + 540) % 360) - 180;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  'worklet';
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const s = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function durationMsBySpeed(a: LatLng, b: LatLng, kmh = 250): number {
  'worklet';
  const km = haversineKm(a, b);
  const hours = km / Math.max(kmh, 1e-3);
  return Math.max(300, hours * 3600 * 1000);
}
