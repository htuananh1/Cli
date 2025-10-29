declare module 'chalk-animation' {
  interface ChalkAnimation {
    (text: string): ChalkAnimation;
    stop(): void;
    start(): void;
  }
  
  const chalkAnimation: {
    rainbow: (text: string) => ChalkAnimation;
    pulse: (text: string) => ChalkAnimation;
    glitch: (text: string) => ChalkAnimation;
    radar: (text: string) => ChalkAnimation;
    neon: (text: string) => ChalkAnimation;
    karaoke: (text: string) => ChalkAnimation;
  };
  
  export = chalkAnimation;
}

declare module 'gradient-string' {
  interface Gradient {
    (text: string): string;
  }
  
  const gradient: {
    rainbow: Gradient;
    atlas: Gradient;
    vintage: Gradient;
    passion: Gradient;
    instagram: Gradient;
    retro: Gradient;
    summer: Gradient;
    pastel: Gradient;
    mind: Gradient;
    morning: Gradient;
    night: Gradient;
    ocean: Gradient;
    fruit: Gradient;
    cristal: Gradient;
    teen: Gradient;
    sunset: Gradient;
    cosmic: Gradient;
    aurora: Gradient;
    fire: Gradient;
    cherry: Gradient;
    mint: Gradient;
    rainbow: Gradient;
    fruit: Gradient;
    passion: Gradient;
    instagram: Gradient;
    retro: Gradient;
    summer: Gradient;
    pastel: Gradient;
    mind: Gradient;
    morning: Gradient;
    night: Gradient;
    ocean: Gradient;
    fruit: Gradient;
    cristal: Gradient;
    teen: Gradient;
    sunset: Gradient;
    cosmic: Gradient;
    aurora: Gradient;
    fire: Gradient;
    cherry: Gradient;
    mint: Gradient;
  };
  
  export = gradient;
}