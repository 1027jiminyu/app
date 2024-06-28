import {initializeApp} from 'firebase/app';
import {messaging} from 'firebase/messaging';

const firebaseConfig = {
  // Firebase 프로젝트 설정 정보
  apiKey: 'AIzaSyBLHzNV64rq3XRYloarRgvFas_Xpa0QIFI',
  authDomain: 'inent-650b3.firebaseapp.com',
  projectId: 'inent-650b3',
  storageBucket: 'inent-650b3.appspot.com',
  messagingSenderId: '796730025932',
  appId: '1:796730025932:android:21a7f739cbe76b35095f69',
};

const app = initializeApp(firebaseConfig);

export const messaging = messaging(app);
