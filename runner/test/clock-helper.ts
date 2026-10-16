export type FrozenClock = {
  tick: (milliseconds: number) => void;
  restore: () => void;
};

// Only Date.now() is frozen; `new Date()` with no arguments still reads the real clock.
export const freezeNow = (start: number | string = Date.now()): FrozenClock => {
  const realNow = Date.now;
  let now = typeof start === "string" ? Date.parse(start) : start;
  Date.now = () => now;

  return {
    tick: (milliseconds) => {
      now += milliseconds;
    },
    restore: () => {
      Date.now = realNow;
    },
  };
};
