import { useState, useEffect, useRef, useCallback } from 'react';
import { SLOT_LOCK_SECONDS } from '../utils/groomingRules';

/**
 * Đếm ngược thời gian khóa tạm slot/phòng (BR: 10 phút).
 * @param {boolean} active - true khi đã chọn slot và cần bắt đầu khóa.
 * @param {number} totalSeconds
 */
export default function useSlotLock(active, totalSeconds = SLOT_LOCK_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef(null);

  const reset = useCallback(() => {
    setSecondsLeft(totalSeconds);
    setExpired(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (!active) return undefined;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isCritical = secondsLeft <= 60 && secondsLeft > 0;

  return { secondsLeft, formatted, expired, isCritical, reset };
}