import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  ScrollView,
  Picker,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../common/Header';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../../global/config';
import {TouchableRipple, Snackbar, FAB, TextInput} from 'react-native-paper';
import {connect} from 'react-redux';
import {getThemeColors} from '../../../global/themes';
import Loader from '../../common/Loader';
import {globalStyles} from '../../../global/styles';
import Ripple from 'react-native-material-ripple';
import Load from '../../common/Load';
import {RefreshControl} from 'react-native';

// import Ripple from 'react-native-material-ripple';
// import LinearGradient from 'react-native-linear-gradient';
// import LottieView from 'lottie-react-native';

class CarView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contentLoading: false,
      visible: false,
      success: false,
      showLoading: true,
      recordSummery: {},
      listArray: [],
      days: '',
      recordId: null,
      type: '',
      listRefreshing: false,
    };

    // alert(this.props.currency);

    // if (Platform.OS === 'android') {
    //   UIManager.setLayoutAnimationEnabledExperimental(true);
    // }
  }

  async componentDidMount() {
    // let userInfo = await AsyncStorage.getItem('userInfo');
    // if (userInfo) {
    //   userInfo = JSON.parse(userInfo);
    // this.setState({
    //   title: 'JEEP',
    // });
    // this.detailLoadByCar();
  }

  detailLoadByCar = () => {
    let bodyData = JSON.stringify({
      car_type: this.state.type,
    });

    // alert(bodyData);

    console.log(`${API_URL}detailLoadByCar`, bodyData);

    fetch(`${API_URL}detailLoadByCar`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.status) {
          //   LayoutAnimation.configureNext({
          //     duration: 450,
          //     create: {
          //       type: LayoutAnimation.Types.easeInEaseOut,
          //       property: LayoutAnimation.Properties.opacity,
          //     },
          //     update: {type: LayoutAnimation.Types.easeInEaseOut},
          //   });
          //   console.log(response.data);
          this.setState({
            showLoading: false,
            listRefreshing: false,
          });

          if (response.data.length > 0) {
            this.setState({
              listArray: response.data,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({showLoading: false});
      });
  };

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
    });
  };

  render() {
    const param = this.props.route.params;
    if (param !== undefined) {
      if (param.screen !== undefined) {
        console.log(param);
        this.setState(
          {
            title: param.title,
            type: param.type,
          },
          () => {
            this.detailLoadByCar();
          },
        );

        param.screen = undefined;
      }
    }

    const {colors} = this.props;

    return (
      <>
        <Header title={this.state.title} back={true} />
        <>
          <View style={styles.container(colors.backgroundColor)}>
            <ScrollView
              style={styles.container}
              refreshControl={
                <RefreshControl
                  tintColor={'lime'}
                  onRefresh={() => {
                    this.setState(
                      {
                        listRefreshing: true,
                      },
                      () => {
                        this.detailLoadByCar();
                      },
                    );
                  }}
                  refreshing={this.state.listRefreshing}
                />
              }>
              <View style={{paddingHorizontal: 12, marginTop: 10}}>
                {this.state.listArray.length > 0 &&
                  this.state.listArray.map((item) => {
                    // console.log(item);
                    return (
                      // <Text>{JSON.stringify(item)}</Text>
                      <Load
                        dataItem={item}
                        navigate={this.props.navigation.navigate}
                        onMenuPress={(id) => {
                          this.props.navigation.navigate('Form', {
                            id: id,
                            title: 'Edit Load',
                            screen: 'Index',
                          });
                        }}
                      />
                    );
                  })}
              </View>
            </ScrollView>
          </View>
        </>
        <Snackbar
          visible={this.state.visible}
          duration={2000}
          onDismiss={() => {
            this.setState({
              visible: false,
            });
          }}
          style={
            this.state.success
              ? {backgroundColor: colors.alertSuccess}
              : {backgroundColor: colors.alertDanger}
          }>
          {this.state.message}
        </Snackbar>

        {this.state.showLoading && <Loader color={colors.primaryColor} />}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme);
  return {colors: theme};
};

export default connect(mapStateToProps)(CarView);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
  cardStyle: (bgColor) => ({
    borderRadius: 15,
    backgroundColor: bgColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '49%',
    borderWidth: 1,
    elevation: 5,
    marginBottom: 10,
  }),
  cardHeading: (color) => ({
    fontSize: 20,
    textAlign: 'center',
    color: color,
  }),
  cardNumber: (color) => ({
    paddingTop: 5,
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    color: color,
  }),
  head: (color, bgColor) => ({
    height: 40,
    backgroundColor: bgColor,
    color: color,
  }),
  text: (color) => ({margin: 6, color: color, fontSize: 16, opacity: 0.9}),
});
