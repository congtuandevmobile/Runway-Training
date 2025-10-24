/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import Text from '../Text';
import { StyleSheet } from 'react-native-unistyles';

function format(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return `${m.toString().padStart(2, '0')}:${sec
    .toString()
    .padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

export const Clock: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const loop = () => {
    if (!running || startAtRef.current == null) return;
    setElapsed(Date.now() - startAtRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const onStart = DeviceEventEmitter.addListener('clock:start', () => {
      startAtRef.current = Date.now();
      setElapsed(0);
      setRunning(true);
    });

    const onStop = DeviceEventEmitter.addListener('clock:stop', () => {
      setRunning(false);
      startAtRef.current = null;
    });

    const onReset = DeviceEventEmitter.addListener('clock:reset', () => {
      setRunning(false);
      setElapsed(0);
      startAtRef.current = null;
    });

    return () => {
      onStart.remove();
      onStop.remove();
      onReset.remove();
    };
  }, []);

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(loop);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        ROT: {format(elapsed)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    top: 65,
    width: 150,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    left: theme.typography.spacings.L,
    borderRadius: theme.typography.radius.S,
    paddingVertical: theme.typography.spacings.MS,
    paddingHorizontal: theme.typography.spacings.MS,
  },
  text: {
    width: '100%',
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.character_white,
    fontSize: theme.typography.fontSizes.MS,
  }
}));
