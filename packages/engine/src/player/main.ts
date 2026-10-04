/* Page entry: mount the video this build is for. studioConfig points the virtual modules at the video folder. */

import { SCENES } from 'virtual:scenes';
import video from 'virtual:video';
import { mountPlayer } from './mount';

await mountPlayer(video, SCENES, document.getElementById('player')!);
