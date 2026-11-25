// Tiny vibrations on Android (iOS Safari ignores navigator.vibrate, harmlessly).
export function tap(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {}
}

export function success() {
  try {
    navigator.vibrate?.([10, 40, 18]);
  } catch {}
}
