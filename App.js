import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

function App() {
  const [token, setToken] = useState('');

  useEffect(() => {
    // 푸시 알림 권한 요청 및 토큰 획득
    requestUserPermission();
    createNotificationChannel();

    // 포그라운드 알림 리스너
    const foregroundUnsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      showLocalNotification(remoteMessage);
    });

    return () => {
      // 컴포넌트 언마운트 시에 리스너 해제
      foregroundUnsubscribe();
    };
  }, []);

  // 푸시 알림 권한 요청 및 토큰 획득 함수
  async function requestUserPermission() {
    try {
      const authStatus = await messaging().requestPermission();

      if (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      ) {
        console.log('Authorization status:', authStatus);
        const refreshedToken = await messaging().getToken();
        //console.log('토큰:', refreshedToken);
        setToken(refreshedToken);
        // 토큰을 서버로 전송
      }
    } catch (error) {
      console.error('푸시 알림 권한 요청 및 토큰 얻기 실패:', error);
    }
  }

  function createNotificationChannel() {
    PushNotification.createChannel(
      {
        channelId: '1', // 채널 ID
        channelName: 'Sensor Alert', // 채널 이름
        channelDescription: '장비 알림', // 채널 설명
        soundName: 'default', // 기본 알림음 이름
        importance: PushNotification.Importance.HIGH, // 알림 중요도
        vibrate: true, // 진동 여부
      },
      created => console.log(`createChannel returned '${created}'`), // 채널 생성 결과 로깅
    );
  }

  // 로컬 알림 표시 함수
  function showLocalNotification(remoteMessage) {
    // const title = remoteMessage?.data?.title;
    // const message = remoteMessage?.data?.body;
    const title =
      remoteMessage.notification?.title || remoteMessage.data?.title;
    const message =
      remoteMessage.notification?.body || remoteMessage.data?.body;

    if (title && message) {
      PushNotification.localNotification({
        channelId: '1', // 채널 ID
        title: title,
        message: message,
      });
    } else {
      console.error('Notification title or body is undefineds:', remoteMessage);
    }
  }

  //  const onMessage = event => {
  //    try {
  //      const receiveAlertData = JSON.parse(event.nativeEvent.data);
  //      console.log('receiveAlertData', receiveAlertData);
  //
  //      if (receiveAlertData) {
  //        // receiveAlertData 객체에서 name과 value를 추출
  //        const title = receiveAlertData.name;
  //        const body = receiveAlertData.value;
  //        console.log('title, body, token', title, body, token);
  //        console.log('22222', JSON.stringify({title, body, token}));
  //
  //        fetch('http://192.168.0.7:3001/message', {
  //          method: 'POST',
  //          headers: {
  //            'Content-Type': 'application/json',
  //          },
  //          body: JSON.stringify({title, body, token}),
  //        })
  //          .then(response => response.json())
  //          .then(data => console.log('Message sent to the server:', data))
  //          .catch(error =>
  //            console.error('Error sending message to the server:', error),
  //          );
  //      }
  //    } catch (error) {
  //      console.error('Error parsing message from WebView:', error);
  //    }
  //  };

  function eventData(data) {
    const userid = data;
    const tokens = token;
    console.log(tokens);
    console.log('data', data);

    // fetch('http://inent2023.co.kr:3001/api/token', {
    fetch('http://10.10.10.13:3001/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid: userid,
        token: tokens,
      }),
    })
      .then(response => response.json())
      .catch(error => {
        console.log(error);
      });
  }

  return (
    <WebView
      // source={{uri: 'http://192.168.0.7:3000/'}}
      // source={{uri: 'http://49.50.165.218:5500/'}}
      source={{uri: 'http://10.10.10.13:3000/'}}
      // source={{uri: 'http://inent2023.co.kr:5500/'}}
      style={styles.webview}
      //onMessage={onMessage}
      onMessage={event => {
        eventData(event.nativeEvent.data);
      }}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});

export default App;
