import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { useRouter } from 'expo-router';

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 500;

interface TabConfig {
  name: string;
  title: string;
  icon: string;
}

const tabs: TabConfig[] = [
  { name: '', title: 'Home', icon: 'home' },
  { name: 'portfolio', title: 'Portfolio', icon: 'briefcase' },
  { name: 'yourStack', title: 'Your Stack', icon: 'prism' },
  { name: 'add2stack', title: 'Add-2-stack', icon: 'add-circle' },
  { name: 'account', title: 'Account', icon: 'person-sharp' },
];

export function useSwipeNavigation(currentTabName: string) {
  const router = useRouter();

  const currentIndex = tabs.findIndex(t => t.name === currentTabName);

  const goToNextTab = useCallback(() => {
    if (currentIndex === -1 || currentIndex >= tabs.length - 1) {
      return;
    }
    const targetTab = tabs[currentIndex + 1].name;
    router.push(targetTab === '' ? '/' : targetTab as any);
  }, [currentIndex, router]);

  const goToPreviousTab = useCallback(() => {
    if (currentIndex <= 0) {
      return;
    }
    const targetTab = tabs[currentIndex - 1].name;
    router.push(targetTab === '' ? '/' : targetTab as any);
  }, [currentIndex, router]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      const isSwipeRight = translationX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD;
      const isSwipeLeft = translationX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD;

      if (!isSwipeRight && !isSwipeLeft) {
        return;
      }

      if (isSwipeRight && currentIndex > 0) {
        scheduleOnRN(goToPreviousTab);
      } else if (isSwipeLeft && currentIndex < tabs.length - 1 && currentIndex !== -1) {
        scheduleOnRN(goToNextTab);
      }
    });

  return {
    swipeGesture,
    goToNextTab,
    goToPreviousTab,
  };
}
