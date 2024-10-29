// global.d.ts
export {};

declare global {
  interface Window {
    modelsPreloaded?: boolean;
  }
}
