import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Picker,
  Dimensions,
} from 'react-native';
import {Snackbar, TextInput, FAB, TouchableRipple} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {API_URL} from '../../../global/config';
import {getThemeColors} from '../../../global/themes';
import Ripple from 'react-native-material-ripple';
import {globalStyles} from '../../../global/styles';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import {setTheme} from '../../../redux/actions/config';
import Loader from '../../common/Loader';
import Header from '../../common/Header';
import Segment from '../../common/Segment';
import {Alert} from 'react-native';
import {RefreshControl} from 'react-native';
import MaintenanceForm from './Form';

class Maintenance extends React.Component {
  state = {
    model: '',
    unit: '',
    type: '',
    message: '',
    typeList: {},
    unitList: {},
    modelList: {},
    classList: {},
    loadBalance: {},
    totalUnit: 0,
    listArray: [
      {
        ba_no: '',
        type_id: '',
        model_id: '',
        cl_id: '',
        km: '',
        engine: '',
        unit_id: '',
        other: '',
      },
    ],
    userId: '',
    orderId: null,
    visible: false,
    success: false,
    display: true,
    isRefreshing: false,
  };

  constructor(props) {
    super(props);
  }
  async componentDidMount() {
    // this.checkUserIsLoggedIn();
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      this.setState({
        userId: userInfo.id,
      });
    }

    this.getType();
    this.getTotalUnit();
    this.getClass();
    this.getModel();
    this.getUnit();
    // this.getData();
    this.getLoadBalance();

    // const param = this.props.route.params;
    // if (param !== undefined) {
    //   if (param.screen !== undefined) {
    // this.getData('7');
    // param.screen = undefined;
    // }
    // }
  }

  getType = () => {
    fetch(`${API_URL}getCarType`)
      .then((res) => res.json())
      .then(({data}) => {
        this.setState({
          typeList: data,
        });
      })
      .catch((e) => {
        console.log('typeList' + e);
      });
  };

  getTotalUnit = () => {
    fetch(`${API_URL}totalUnit`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          this.setState({
            totalUnit: data.totalUnit,
          });
        }
      })
      .catch((e) => {
        console.log('totalUnit' + e);
      });
  };

  getUnit = () => {
    fetch(`${API_URL}getUnit`)
      .then((res) => res.json())
      .then(({data}) => {
        this.setState({
          unitList: data,
        });
      })
      .catch((e) => {
        console.log('unitList' + e);
      });
  };

  getClass = () => {
    fetch(`${API_URL}getClass`)
      .then((res) => res.json())
      .then(({data}) => {
        this.setState({
          classList: data,
        });
      })
      .catch((e) => {
        console.log('classList' + e);
      });
  };

  getModel = () => {
    fetch(`${API_URL}getModel`)
      .then((res) => res.json())
      .then(({data}) => {
        this.setState({
          modelList: data,
        });
      })
      .catch((e) => {
        console.log('modelList' + e);
      });
  };

  getLoadBalance = () => {
    this.setState({dataLoading: true});

    fetch(`${API_URL}getLoadBalance`)
      .then((res) => res.json())
      .then(({data}) => {
        // alert(JSON.stringify(data));

        this.setState({
          loadBalance: data,
          isRefreshing: false,
          dataLoading: false,
        });
      })
      .catch((e) => {
        console.log('getLoadBalance' + e);
      });
  };

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
    });
  };

  // getData = () => {
  //   this.setState({dataLoading: true});

  //   console.log(`${API_URL}loadList`);
  //   fetch(`${API_URL}loadList`)
  //     .then((res) => res.json())
  //     .then((response) => {
  //       console.log(response);
  //       this.setState({dataLoading: false});
  //       let status = response.status;
  //       let data = response.data;

  //       if (status) {
  //         this.setState({
  //           listArray: data,
  //           isRefreshing: false,
  //         });
  //       } else {
  //         this.setState({dataLoading: false});
  //         this.showSnackbar(response.status_text);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       this.setState({dataLoading: false});
  //     });
  // };

  render() {
    const param = this.props.route.params;
    if (param !== undefined) {
      if (param.screen !== undefined) {
        this.showSnackbar(param.message, true);
        param.screen = undefined;
      }
    }

    const {colors} = this.props;

    return (
      <>
        <Header title={'Maint Load'} />
        <View style={styles.container(colors.backgroundColor)}>
          <ScrollView
            keyboardShouldPersistTaps="always"
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={() => {
                  this.getLoadBalance();
                }}
              />
            }>
            <Segment index="1" theme={this.props.theme} colors={colors} />

            <View
              style={{
                paddingHorizontal: 10,
                marginTop: 10,
              }}>
              <Ripple
                style={[
                  styles.cardStyle(colors.secondaryColor),
                  {width: '100%'},
                ]}
                onPress={() => {
                  this.props.navigation.navigate('UnitList');
                }}>
                <Text style={styles.cardHeading(colors.textColor)}>
                  Total Unit
                </Text>
                <Text style={styles.cardNumber(colors.textLight)}>
                  {this.state.totalUnit}
                </Text>
              </Ripple>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}>
                {Object.keys(this.state.loadBalance).map((key) => {
                  return (
                    <Ripple
                      style={[styles.cardStyle(colors.secondaryColor)]}
                      onPress={() => {
                        this.props.navigation.navigate('View', {
                          screen: 'Index',
                          title:
                            this.state.loadBalance[key].car_type ??
                            this.state.loadBalance[key].car_type_text,
                          type: this.state.loadBalance[key].car_type_value,
                        });
                      }}>
                      <Text style={styles.cardHeading(colors.textColor)}>
                        {this.state.loadBalance[key].car_type ??
                          this.state.loadBalance[key].car_type_text}
                      </Text>
                      <Text style={styles.cardNumber(colors.textLight)}>
                        {this.state.loadBalance[key].load.toString()}
                      </Text>
                    </Ripple>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
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
        <FAB
          style={styles.fab(colors.primaryColor)}
          icon={'plus'}
          onPress={() => {
            this.props.navigation.navigate('Form', {
              id: null,
              title: 'Create Load',
              screen: 'Index',
            });
          }}
        />
        {this.state.dataLoading && <Loader color={colors.primaryColor} />}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme, state.brand);

  return {colors: theme, theme: state.theme};
};

export default connect(mapStateToProps, {
  setUserTheme: setTheme,
})(Maintenance);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
  cardTextStyle: (color) => ({
    color: color,
    paddingVertical: 2,
    fontSize: 16,
  }),
  fab: (color) => ({
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: color,
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
});
