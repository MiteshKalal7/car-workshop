import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import DrawerContent from './screens/common/DrawerContent';

import Registration from './screens/authentication/Registration';
import Login from './screens/authentication/Login';
import ForgotPassword from './screens/authentication/ForgotPassword';
import ChangePassword from './screens/authentication/ChangePassword';
import Dashboard from './screens/user/Dashboard';
import Details from './screens/user/Details';
import List from './screens/user/List';
import Search from './screens/user/Search';
import View from './screens/user/Maintenance/View';
import Form from './screens/user/Maintenance/Form';
import UnitList from './screens/user/UnitList';
import ProfileStep from './screens/user';
import Shipment from './screens/user/Entry';
import Maintenance from './screens/user/Maintenance/index';
// import SplashScreen from 'react-native-splash-screen';

// import {LogBox} from 'react-native';
import {Provider} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import {store, getAsyncStorage} from './redux/store';
import messaging from '@react-native-firebase/messaging';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// LogBox.ignoreLogs(['Warning: ...']);
// console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
console.disableYellowBox = true;

function User() {
  const [userInfo, setUserInfo] = React.useState('');

  React.useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      store.dispatch(getAsyncStorage());

      userInfo = JSON.parse(userInfo);
      setUserInfo(userInfo);
    }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <DrawerContent {...props} size="22" data={userInfo} />
      )}>
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Maintenance" component={Maintenance} />
      <Drawer.Screen name="Details" component={Details} />
      <Drawer.Screen name="ProfileStep" component={ProfileStep} />
      <Drawer.Screen name="Shipment" component={Shipment} />
    </Drawer.Navigator>
  );
}

function App() {
  React.useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Registration" component={Registration} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
          <Stack.Screen name="User" component={User} />
          <Stack.Screen name="UnitList" component={UnitList} />
          <Stack.Screen name="List" component={List} />
          <Stack.Screen name="View" component={View} />
          <Stack.Screen name="Form" component={Form} />
          <Stack.Screen name="Search" component={Search} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
