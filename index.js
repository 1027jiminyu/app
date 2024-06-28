import {AppRegistry} from 'react-native';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import {name as appName} from './app.json';
import PushNotification from 'react-native-push-notification';

// 푸시 알림 채널 생성
PushNotification.createChannel(
  {
    channelId: '1', // (required)
    channelName: 'Sensor Alert', // (required)
  },
  created => console.log(`createChannel returned '${created}'`),
);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  const title = remoteMessage?.data?.title;
  const message = remoteMessage?.data?.body;
  console.log(title);
  console.log(message);
  if (title && message) {
        PushNotification.localNotification({
          channelId: '1', // 채널 ID
          title: title,
          message: message,
        });
      } else {
        console.error('Notification title or body is undefineds:', remoteMessage);
      }
});

AppRegistry.registerComponent(appName, () => App);
