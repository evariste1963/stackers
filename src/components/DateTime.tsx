import { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/global';

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((diff + start.getDay() * 24 * 60 * 60 * 1000) / oneWeek);
}

function formatDate(date: Date): string {
  const week = getWeekNumber(date);
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${week}  ${day}  ${hours}:${minutes}`;
}

export function DateTime() {
  const [timeString, setTimeString] = useState(formatDate(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeString(formatDate(new Date()));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return <Text style={styles.date}>{timeString}</Text>;
}

const styles = StyleSheet.create({
  date: {
    fontSize: 24,
    color: colors.date,
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
  },
});
