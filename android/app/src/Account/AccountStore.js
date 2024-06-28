import {Component} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AccountStore extends Component {
  async getId() {
    const userId = (await AsyncStorage.getItem('userid')) || null;
    const userid = JSON.parse(userId);
    console.log(userid);
    return userid;
  }
  async getRole() {
    const userRole = (await AsyncStorage.getItem('role')) || null;
    const role = JSON.parse(userRole);
    console.log(role);
    return role;
  }
  userid = this.getId();
  role = this.getRole();

  Login(datas) {
    this.userid = datas.userid;
    this.role = datas.role;
    AsyncStorage.setItem('userid', JSON.stringify(this.userid));
    AsyncStorage.setItem('role', JSON.stringify(this.role));
  }

  Logout() {
    this.userid = '';
    this.role = '';
    AsyncStorage.removeItem('userid');
    AsyncStorage.removeItem('role');
  }
}
// eslint-disable-next-line
export default new AccountStore();
