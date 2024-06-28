//클라이언트에서 서버로 데이터 전송 후 서버에서 클라이언트로 데이터 받아오기

import Server from "../Server/Server";

//로그인 SQL
function LoginSQL(id, pw) {
  let Datas;

  //서버에 ID,PW 전송
  Server.emit("login", id, pw);

  //서버에서 응답
  Datas = new Promise((resolve, reject) => {
    Server.on("login_msg", (err, rows) => {
      if (err) return resolve(err);
      resolve(rows);
    });
  });

  return Datas;
}
//=================================================

//장비 리스트 SQL
function DeviceListSQL(id) {
  let Datas;

  //서버에 ID전송
  Server.emit("deviceList", id);

  //서버에서 응답
  Datas = new Promise((resolve, reject) => {
    Server.on("deviceList_msg", (err, rows) => {
      if (err) return resolve(err);
      resolve(rows);
    });
  });

  return Datas;
}
//=================================================

//장비 센서 데이터 SQL
async function DeviceDataSQL(deviceId) {
  let Datas = [];
  // 서버에 ID전송
  Server.emit("deviceData", deviceId);

  // 서버에서 응답을 받을 때까지 대기
  Datas = await new Promise((resolve, reject) => {
    Server.on("deviceData_msg", (rows, err) => {
      if (err) {
        reject(err);
      } else {
        // Datas 배열에 받은 데이터를 추가함
        resolve(rows);
      }
    });
  });

  return Datas;
}

//=================================================

//장비 센서 최신 정보 데이터 SQL
function RecentDataSQL(id) {
  let Datas;

  //서버에 ID전송
  Server.emit("recentData", id);

  //서버에서 응답
  Datas = new Promise((resolve, reject) => {
    Server.on("recentData_msg", (err, rows) => {
      if (err) return resolve(err);
      resolve(rows);
    });
  });

  return Datas;
}
//=================================================

//장비 정보 데이터 SQL
function DeviceInfoSQL(deviceId) {
  let Datas;

  //서버에 ID전송
  Server.emit("deviceInfo", deviceId);

  //서버에서 응답
  Datas = new Promise((resolve, reject) => {
    Server.on("deviceInfo_msg", (err, rows) => {
      if (err) return resolve(err);
      resolve(rows);
    });
  });
  return Datas;
}
//=================================================

//새로고침 SQL
function RefreshSQL(id) {
  let Datas;

  //서버에 ID,PW 전송
  Server.emit("Refresh", id);

  //서버에서 응답
  Datas = new Promise((resolve, reject) => {
    Server.on("Refresh_msg", (err, rows) => {
      if (err) return resolve(err);
      resolve(rows);
    });
  });

  return Datas;
}
//=================================================

export {
  LoginSQL,
  DeviceListSQL,
  DeviceDataSQL,
  RecentDataSQL,
  DeviceInfoSQL,
  RefreshSQL,
};
