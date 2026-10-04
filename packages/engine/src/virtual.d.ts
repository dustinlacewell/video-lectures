/* The two modules a video provides. studioConfig (vite.ts) aliases them to <video>/video.ts and <video>/scenes/index.ts. */

declare module 'virtual:video' {
  const video: import('./video').VideoData;
  export default video;
}

declare module 'virtual:scenes' {
  export const SCENES: import('./render').SceneMap;
}
