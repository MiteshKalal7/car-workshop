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

class Form extends React.Component {
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
    listArray: {
      ba_no: '',
      km: '',
      engine: '',
      other: '',
      type: {
        id: '',
      },
      model: {
        id: '',
      },
      cl: {
        id: '',
      },
      unit: {
        id: '',
      },
    },
    id: null,
    title: 'Create Load',
    orderId: null,
    visible: false,
    success: false,
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
    fetch(`${API_URL}getLoadBalance`)
      .then((res) => res.json())
      .then(({data}) => {
        // alert(JSON.stringify(data));

        this.setState({
          loadBalance: data,
          isRefreshing: false,
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

  getData = (id = '') => {
    this.setState({dataLoading: true});

    let bodyData = JSON.stringify({
      id: id,
    });

    console.log(`${API_URL}getLoad`, bodyData);
    fetch(`${API_URL}getLoad`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        this.setState({dataLoading: false});
        let status = response.status;
        let data = response.data;

        console.log('after api call');
        console.log(data);

        if (status) {
          this.setState({
            listArray: data,
            isRefreshing: false,
          });
        } else {
          this.setState({dataLoading: false});
          this.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({dataLoading: false});
      });
  };

  render() {
    const param = this.props.route.params;
    if (param !== undefined) {
      if (param.screen !== undefined) {
        // this.getData('7');

        if (param.id) {
          this.getData(param.id);
        }

        this.setState({
          title: param.title,
          id: param.id,
        });
        param.screen = undefined;
      }
    }

    const manageEntry = () => {
      // alert(this.state.name);
      console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$');
      console.log(this.state.listArray);

      let item = this.state.listArray;

      //   this.state.listArray.map((item) => {
      if (
        item.unit_id !== '' &&
        item.cl_id !== '' &&
        item.type_id !== '' &&
        item.model_id !== ''
      ) {
        let requestData = JSON.stringify({
          ba_no: item.ba_no,
          type_id: item.type.id,
          model_id: item.model.id,
          cl_id: item.cl.id,
          km: item.km,
          engine: item.engine,
          unit_id: item.unit.id,
          other: item.other,
          id: this.state.id,
        });

        let apiName = 'loadSave';

        if (this.state.id) {
          apiName = 'loadEdit';
        }

        this.setState({loading: true});

        console.log(`${API_URL}${apiName}` + requestData);
        fetch(`${API_URL}${apiName}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: requestData,
        })
          .then((res) => res.json())
          .then((response) => {
            console.log(response);
            // message = response.status_text;
            this.setState({loading: false});
            let status = response.status;
            if (status) {
              this.props.navigation.navigate('Maintenance', {
                screen: 'form',
                message: response.status_text,
              });
            } else {
              this.showSnackbar(response.status_text);
            }
          })
          .catch((err) => {
            console.log(err);
            this.setState({loading: false});
          });
      } else {
        console.log('Fill all data');
      }
      //   });

      // this.setState({loading: false});
      // if (message !== '') {
      //   alert(message);
      //   this.showSnackbar(message);
      // }
    };

    const {colors} = this.props;

    const inputTheme = {
      colors: {
        primary: colors.primaryColor,
        placeholder: colors.textLight,
        text: colors.textColor,
      },
    };

    return (
      <>
        <Header title={this.state.title} back={true} />
        <View style={styles.container(colors.backgroundColor)}>
          <ScrollView keyboardShouldPersistTaps="always">
            <View
              style={{
                paddingHorizontal: 10,
                marginTop: 10,
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  elevation: 8,
                  backgroundColor: colors.secondaryColor,
                  borderRadius: 10,
                  padding: 10,
                  marginVertical: 10,
                }}>
                <TextInput
                  label="BA No"
                  value={this.state.listArray.ba_no.toString()}
                  onChangeText={(ba_no) => {
                    let listArray = this.state.listArray;
                    listArray.ba_no = ba_no;
                    this.setState({listArray});
                  }}
                  style={[globalStyles.inputStyle, {marginTop: -5}]}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'order-numeric-ascending'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />

                <Picker
                  selectedValue={this.state.listArray.type.id.toString()}
                  style={{
                    height: 50,
                    color: colors.textColor,
                    marginBottom: 5,
                  }}
                  onValueChange={(itemValue) => {
                    let listArray = this.state.listArray;
                    listArray.type.id = itemValue;
                    this.setState({listArray});
                  }}>
                  <Picker.Item label="Select Car Type" value="" />

                  {this.state.typeList &&
                    Object.keys(this.state.typeList).map((key) => {
                      return (
                        <Picker.Item
                          label={this.state.typeList[key]}
                          value={key}
                        />
                      );
                    })}
                </Picker>

                <Picker
                  selectedValue={this.state.listArray.model.id.toString()}
                  style={{
                    height: 50,
                    color: colors.textColor,
                    marginBottom: 5,
                  }}
                  onValueChange={(itemValue) => {
                    let listArray = this.state.listArray;
                    listArray.model.id = itemValue;
                    this.setState({listArray});
                  }}>
                  <Picker.Item label="Select Model" value="" />

                  {this.state.modelList &&
                    Object.keys(this.state.modelList).map((key) => {
                      return (
                        <Picker.Item
                          label={this.state.modelList[key]}
                          value={key}
                        />
                      );
                    })}
                </Picker>

                <Picker
                  selectedValue={this.state.listArray.cl.id.toString()}
                  style={{
                    height: 50,
                    color: colors.textColor,
                    marginBottom: 5,
                  }}
                  onValueChange={(itemValue) => {
                    let listArray = this.state.listArray;
                    listArray.cl.id = itemValue;
                    this.setState({listArray});
                  }}>
                  <Picker.Item label="Select Class" value="" />

                  {this.state.classList &&
                    Object.keys(this.state.classList).map((key) => {
                      return (
                        <Picker.Item
                          label={this.state.classList[key]}
                          value={key}
                        />
                      );
                    })}
                </Picker>

                <TextInput
                  label="KM"
                  value={this.state.listArray.km.toString()}
                  onChangeText={(km) => {
                    let listArray = this.state.listArray;
                    listArray.km = km;
                    this.setState({listArray});
                  }}
                  style={[globalStyles.inputStyle, {marginTop: -10}]}
                  keyboardType={'number-pad'}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'order-numeric-ascending'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />
                <TextInput
                  label="Engine"
                  value={this.state.listArray.engine}
                  onChangeText={(engine) => {
                    let listArray = this.state.listArray;
                    listArray.engine = engine;
                    this.setState({listArray});
                  }}
                  style={[globalStyles.inputStyle, {marginTop: 1}]}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'order-numeric-ascending'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />

                <Picker
                  selectedValue={this.state.listArray.unit.id.toString()}
                  style={{
                    height: 50,
                    color: colors.textColor,
                    marginBottom: 5,
                  }}
                  onValueChange={(itemValue) => {
                    let listArray = this.state.listArray;
                    listArray.unit.id = itemValue;
                    this.setState({listArray});
                  }}>
                  <Picker.Item label="Select Unit" value="" />

                  {this.state.unitList &&
                    Object.keys(this.state.unitList).map((key) => {
                      return (
                        <Picker.Item
                          label={this.state.unitList[key]}
                          value={key}
                        />
                      );
                    })}
                </Picker>

                <TextInput
                  label="Other"
                  value={this.state.listArray.other.toString()}
                  onChangeText={(other) => {
                    let listArray = this.state.listArray;
                    listArray.other = other;
                    this.setState({listArray});
                  }}
                  style={[
                    globalStyles.inputStyle,
                    {marginTop: -10, marginBottom: 10},
                  ]}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'order-numeric-ascending'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />
              </View>

              <Ripple
                style={[
                  globalStyles.buttonStyle(colors.primaryColor),
                  {
                    width: Dimensions.get('window').width / 2,
                    marginVertical: 20,
                    elevation: 10,
                    marginBottom: 20,
                  },
                ]}
                disabled={this.state.loading ? true : false}
                onPress={() => manageEntry()}>
                {this.state.loading ? (
                  <ActivityIndicator color="#fff" size={26} />
                ) : (
                  <Text style={{color: colors.primaryTextColor, fontSize: 20}}>
                    Submit
                  </Text>
                )}
              </Ripple>
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
})(Form);

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
