import moment from 'moment';
import {io} from 'socket.io-client';
const wsHost =
  process.env.NODE_ENV === 'development'
    ? 'ws://175.208.89.113:7000'
    : 'ws://175.208.89.113:7000';
const wsHost1 =
  process.env.NODE_ENV === 'development'
    ? 'ws://localhost:3001'
    : 'ws://localhost:3001';

class WsApi {
  static serverInfo = {
    serverdn: 'livestockdb.com',
    serverip: '175.208.89.113',
    socket: 'websocket',
    portNo: '7000',
  };

  static ws;
  static callback = {};
  static ws1;
  static callback1 = {};

  static async connect() {
    return new Promise(resolve => {
      this.ws = new WebSocket(wsHost);
      this.ws.onmessage = event => {
        try {
          // 장비가 연결되지 않은 상태에서 주석을 풀고 테스트를 하면,
          // event.data = id not Found 인 경우가 되어, JSON.parse의 SyntaxError 발생함.
          let data = JSON.parse(event.data);
          let type = data.type || data.res;
          if (this.callback[type]) {
            this.callback[type](data);
            delete this.callback[type];
          }
        } catch (error) {
          console.error(error);
        }
      };

      this.ws.onopen = () => resolve();
      this.ws.onclose = () => {
        this.connect();
      };
    });
  }

  //======================================소켓==================================
  //▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
  static async connect1() {
    return new Promise(resolve => {
      this.ws1 = io(wsHost1, {transports: ['websocket']});
      this.ws1.on('connect', () => {
        resolve();
        //console.log(this.ws1.connected); // true
      });
      this.ws1.on('disconnect', () => {
        this.ws1.connect();
      });
    });
  }
  //▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  //======================================소켓==================================

  static async getConnectList(userid) {
    //this.ws가 undefined면
    if (!this.ws) {
      await this.connect();
    }
    return new Promise(resolve => {
      this.callback['connectList'] && this.callback['connectList']();
      this.callback['connectList'] = resolve;

      this.ws.send(
        JSON.stringify({
          command: 'connectList',
          deviceId: userid,
        }),
      );
    });
  }

  //======================================소켓==================================
  //▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
  static async getConnectList1(userid) {
    //this.ws가 undefined면
    if (!this.ws1) {
      await this.connect1();
    }
    return new Promise(resolve => {
      this.ws1.emit(
        'getConnectList',
        JSON.stringify({
          command: 'connectList',
          deviceId: userid,
        }),
      );
    });
  }
  //▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  //======================================소켓==================================

  static async getSystemInfo(manufacturer, userid, deviceid) {
    if (!this.ws) {
      await this.connect();
    }

    let {arr} = await this.getConnectList(userid);
    //console.log('getSystemInof connected list: ')
    //console.log(arr);
    if (arr.indexOf(deviceid) == -1) {
      return alert('장비가 연결되지 않았습니다.');
    }
    // await this.getConnectList();

    let systemInfo;

    if (manufacturer == 'insys') {
      systemInfo = new Promise(resolve => {
        // callback을 받을 인자를 넣어야 제대로 받는다. status는 보내는 인자고, statusResult가 받는 인자로 정의되어 있다.
        this.callback['statusResult'] && this.callback['statusResult']();
        this.callback['statusResult'] = resolve;

        this.ws.send(
          JSON.stringify({
            command: 'orderInsys',
            deviceId: userid,
            sendto: deviceid,
            ordermsg: JSON.stringify({
              company: 'insys',
              name: 'server',
              timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
              deviceId: deviceid,
              type: 'status',
            }),
          }),
        );
      });
    } else if (manufacturer == 'jtron') {
      systemInfo = new Promise(resolve => {
        this.callback['sysInfo'] && this.callback['sysInfo']();
        this.callback['sysInfo'] = resolve;
        this.ws.send(
          JSON.stringify({
            command: 'orderJtron',
            deviceid: userid,
            sendto: deviceid,
            ordermsg: JSON.stringify({
              company: 'JTRON',
              name: 'server',
              deviceid: deviceid,
              sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
              type: 'sysInfo',
            }),
          }),
        );
      });
    } else {
      alert('해당 장비의 제조사가 올바르지 않습니다.');
    }

    return systemInfo;
  }

  //======================================소켓==================================
  //▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
  static async getSystemInfo1(manufacturer, userid, deviceid) {
    if (!this.ws1) {
      await this.connect1();
    }
    let {arr} = await this.getConnectList1(userid);

    if (arr.indexOf(deviceid) == -1) {
      return alert('장비가 연결되지 않았습니다.');
    }
    // await this.getConnectList();

    let systemInfo;

    if (manufacturer == 'insys') {
      systemInfo = new Promise(resolve => {
        this.ws1.emit(
          'getSystemInfo',
          JSON.stringify({
            command: 'orderInsys',
            deviceId: userid,
            sendto: deviceid,
            ordermsg: JSON.stringify({
              company: 'insys',
              name: 'server',
              timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
              deviceId: deviceid,
              type: 'status',
            }),
          }),
        );
      });
    } else if (manufacturer == 'jtron') {
      systemInfo = new Promise(resolve => {
        this.ws1.emit(
          'getSystemInfo',
          JSON.stringify({
            command: 'orderJtron',
            deviceid: userid,
            sendto: deviceid,
            ordermsg: JSON.stringify({
              company: 'JTRON',
              name: 'server',
              deviceid: deviceid,
              sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
              type: 'sysInfo',
            }),
          }),
        );
      });
    } else {
      alert('해당 장비의 제조사가 올바르지 않습니다.');
    }

    return systemInfo;
  }
  //▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  //======================================소켓==================================

  // insideTime: "측정 구간",  //measectInput.value - 분단위
  // outsideTime: "세척 구간", //flushsectInput.value - 분단위
  // restTime: "휴식 기간", 	//restsectInput.value - 분단위
  // dataInterval: "측정 주기",//meacycleInput.value - 초단위
  static async setup(
    userid,
    deviceid,
    insideTime,
    outsideTime,
    restTime,
    dataInterval,
  ) {
    if (!this.ws) {
      await this.connect();
    }
    return new Promise(resolve => {
      this.callback['setup'] && this.callback['setup']();
      this.callback['setup'] = resolve;

      this.ws.send(
        JSON.stringify({
          command: 'orderInsys',
          deviceId: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'insys',
            name: 'server',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            deviceId: deviceid,
            type: 'setup',
            setup: {
              insideTime: insideTime,
              outsideTime: outsideTime,
              restTime: restTime,
              dataInterval: dataInterval,
            },
          }),
        }),
      );
    });
  }

  //======================================소켓==================================
  //▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
  // insideTime: "측정 구간",  //measectInput.value - 분단위
  // outsideTime: "세척 구간", //flushsectInput.value - 분단위
  // restTime: "휴식 기간", 	//restsectInput.value - 분단위
  // dataInterval: "측정 주기",//meacycleInput.value - 초단위
  static async setup1(
    userid,
    deviceid,
    insideTime,
    outsideTime,
    restTime,
    dataInterval,
  ) {
    if (!this.ws1) {
      await this.connect1();
    }
    return new Promise(resolve => {
      this.ws.emit(
        'setup',
        JSON.stringify({
          command: 'orderInsys',
          deviceId: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'insys',
            name: 'server',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            deviceId: deviceid,
            type: 'setup',
            setup: {
              insideTime: insideTime,
              outsideTime: outsideTime,
              restTime: restTime,
              dataInterval: dataInterval,
            },
          }),
        }),
      );
    });
  }
  //▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  //======================================소켓==================================

  static async sample(userid, deviceid) {
    if (!this.ws) {
      await this.connect();
    }

    return new Promise(resolve => {
      this.callback['sample'] && this.callback['sample']();
      this.callback['sample'] = resolve;

      this.ws.send(
        JSON.stringify({
          command: 'orderJtron',
          deviceId: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceId: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'sample',
            sample: {
              actuate: 'On',
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //======================================소켓==================================
  //▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

  static async sample1(userid, deviceid) {
    if (!this.ws1) {
      await this.connect1();
    }

    return new Promise(resolve => {
      this.ws.emit(
        'sample',
        JSON.stringify({
          command: 'orderJtron',
          deviceId: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceId: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'sample',
            sample: {
              actuate: 'On',
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  //======================================소켓==================================

  static async clean(userid, deviceid) {
    if (!this.ws) {
      await this.connect();
    }

    await this.getConnectList();

    return new Promise(resolve => {
      this.callback['clean'] && this.callback['clean']();
      this.callback['clean'] = resolve;

      this.ws.send(
        JSON.stringify({
          command: 'orderJtron',
          deviceid: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceid: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'clean',
            clean: {
              actuate: 'On',
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //======================================소켓==================================
  //▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

  static async clean1(userid, deviceid) {
    if (!this.ws1) {
      await this.connect1();
    }

    await this.getConnectList1();

    return new Promise(resolve => {
      this.ws.emit(
        'clean',
        JSON.stringify({
          command: 'orderJtron',
          deviceid: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceid: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'clean',
            clean: {
              actuate: 'On',
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  //======================================소켓==================================

  static async stop(userid, deviceid) {
    if (!this.ws) {
      await this.connect();
    }

    return new Promise(resolve => {
      this.callback['stop'] && this.callback['stop']();
      this.callback['stop'] = resolve;

      this.ws.send(
        JSON.stringify({
          command: 'orderJtron',
          deviceid: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceid: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'stop',
            stop: {
              actuate: 'On',
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //======================================소켓==================================
  //▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

  static async stop1(userid, deviceid) {
    if (!this.ws1) {
      await this.connect1();
    }

    return new Promise(resolve => {
      this.ws.emit(
        'stop',
        JSON.stringify({
          command: 'orderJtron',
          deviceid: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceid: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'stop',
            stop: {
              actuate: 'On',
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  //======================================소켓==================================

  static async autoSample(userid, deviceid) {
    if (!this.ws) {
      await this.connect();
    }

    return new Promise(resolve => {
      this.callback['autoSample'] && this.callback['autoSample']();
      this.callback['autoSample'] = resolve;

      this.ws.send(
        JSON.stringify({
          command: 'orderJtron',
          deviceid: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceid: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'autoSample',
            autoSample: {
              actuate: 'On',
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //======================================소켓==================================
  //▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

  static async autoSample1(userid, deviceid) {
    if (!this.ws1) {
      await this.connect1();
    }

    return new Promise(resolve => {
      this.ws.emit(
        'autoSample',
        JSON.stringify({
          command: 'orderJtron',
          deviceid: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceid: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'autoSample',
            autoSample: {
              actuate: 'On',
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  //======================================소켓==================================

  static async autoSampleLv(userid, deviceid, value) {
    if (!this.ws) {
      await this.connect();
    }

    return new Promise(resolve => {
      this.callback['autoSampleLv'] && this.callback['autoSampleLv']();
      this.callback['autoSampleLv'] = resolve;

      this.ws.send(
        JSON.stringify({
          command: 'orderJtron',
          deviceid: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceid: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'autoSampleLv',
            autoSampleLv: {
              value: value,
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //======================================소켓==================================
  //▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

  static async autoSampleLv1(userid, deviceid, value) {
    if (!this.ws1) {
      await this.connect1();
    }

    return new Promise(resolve => {
      this.ws.emit(
        'autoSampleLv',
        JSON.stringify({
          command: 'orderJtron',
          deviceid: userid,
          sendto: deviceid,
          ordermsg: JSON.stringify({
            company: 'JTRON',
            name: 'server',
            deviceid: deviceid,
            sendDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: 'autoSampleLv',
            autoSampleLv: {
              value: value,
              ...this.serverInfo,
            },
          }),
        }),
      );
    });
  }

  //▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  //======================================소켓==================================
}
// @ts-ignore
window.WsApi = WsApi;
export default WsApi;
