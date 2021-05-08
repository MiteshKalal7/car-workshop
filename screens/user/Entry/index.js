import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Picker,
  Platform,
  UIManager,
  Keyboard,
  Dimensions,
} from 'react-native';
import {Snackbar, TextInput} from 'react-native-paper';
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

class AddEntry extends React.Component {
  state = {
    model: '',
    unit: '',
    type: '',
    message: '',
    modelList: {},
    typeList: {},
    unitList: {},
    userId: '',
    orderId: null,
    visible: false,
    success: false,
  };

  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
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

    this.getModel();
    this.getUnit();
    this.getType();

    // const param = this.props.route.params;
    // if (param !== undefined) {
    //   if (param.screen !== undefined) {
    // this.getOrderData('7');
    // param.screen = undefined;
    // }
    // }
  }

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

  getUnit = () => {
    fetch(`${API_URL}getUnit`)
      .then((res) => res.json())
      .then(({data}) => {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!');
        console.log(data);
        this.setState({
          unitList: data,
        });
      })
      .catch((e) => {
        console.log('getUnit' + e);
      });
  };

  getType = () => {
    fetch(`${API_URL}getType`)
      .then((res) => res.json())
      .then(({data}) => {
        // console.log(data);
        this.setState({
          typeList: data,
        });
      })
      .catch((e) => {
        console.log('getUnit' + e);
      });
  };

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
    });
  };

  getOrderData = (orderId) => {
    let requestData = JSON.stringify({
      id: orderId,
    });
    this.setState({dataLoading: true});

    console.log(`${API_URL}getRecord` + requestData);
    fetch(`${API_URL}getRecord`, {
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
        this.setState({dataLoading: false});
        let status = response.status;
        let data = response.data;

        if (status) {
          this.setState({
            techProblem: data.problem,
            model: data.model_id.toString(),
            kiloMeter: data.km.toString(),
            unit: data.unit_id.toString(),
            anyOther: data.note,
            baNumber: data.ba_no.toString(),
            wkNumber: data.work_order_no,
            orderId: orderId,
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
        this.getOrderData(param.orderId);
        param.screen = undefined;
      }
    }

    const manageEntry = () => {
      // alert(this.state.baNumber);
      if (this.state.model === '') {
        this.showSnackbar('Please select model');
      } else if (this.state.unit === '') {
        this.showSnackbar('Please select unit');
      } else if (this.state.type === '') {
        this.showSnackbar('Please select Type');
      } else if (!this.state.baNumber) {
        this.showSnackbar('BA Number is required');
      } else if (!this.state.wkNumber) {
        this.showSnackbar('WK O NO is required');
      } else if (!this.state.kiloMeter) {
        this.showSnackbar('Kilo Meter district');
      } else if (!this.state.techProblem) {
        this.showSnackbar('Tech Problem is required');
      } else {
        let requestData = JSON.stringify({
          ba_no: this.state.baNumber,
          model_id: this.state.model,
          unit_id: this.state.unit,
          work_order_no: this.state.wkNumber,
          km: this.state.kiloMeter,
          type: this.state.type,
          problem: this.state.techProblem,
          note: this.state.anyOther,
          id: this.state.orderId,
        });
        this.setState({loading: true});
        console.log(`${API_URL}addORupdateRecord` + requestData);
        fetch(`${API_URL}addORupdateRecord`, {
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
            this.setState({loading: false});
            let status = response.status;

            if (status) {
              this.setState({
                baNumber: '',
                model: '',
                unit: '',
                type: '',
                wkNumber: '',
                kiloMeter: '',
                baNumber: '',
                techProblem: '',
                anyOther: '',
              });
              this.props.navigation.navigate('Dashboard', {
                status: true,
                message: response.status_text,
                screen: 'Create',
              });
            } else {
              this.setState({loading: false});
              this.showSnackbar(response.status_text);
            }
          })
          .catch((err) => {
            console.log(err);
            this.setState({loading: false});
          });
      }
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
        <Header
          title={(this.state.orderId ? 'Edit ' : 'Create New ') + 'Entry'}
        />
        <View style={styles.container(colors.secondaryColor)}>
          <ScrollView keyboardShouldPersistTaps="always">
            <View
              style={{
                paddingHorizontal: 10,
                marginBottom: 20,
              }}>
              {/* <Title style={{color: colors.textColor}}>Create New Shipment</Title> */}

              <View style={{justifyContent: 'center'}}>
                <Picker
                  selectedValue={this.state.model}
                  style={{
                    height: 50,
                    marginTop: 5,
                    color: colors.textColor,
                  }}
                  onValueChange={(itemValue) => {
                    this.setState({model: itemValue});
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
                  selectedValue={this.state.unit}
                  style={{
                    height: 40,
                    marginTop: 5,
                    color: colors.textColor,
                  }}
                  onValueChange={(itemValue) => {
                    this.setState({unit: itemValue});
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
                <Picker
                  selectedValue={this.state.type}
                  style={{
                    height: 40,
                    marginTop: 5,
                    color: colors.textColor,
                  }}
                  onValueChange={(itemValue) => {
                    this.setState({type: itemValue});
                  }}>
                  <Picker.Item label="Select Type" value="" />
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
                <TextInput
                  label="BA No."
                  value={this.state.baNumber}
                  onChangeText={(baNumber) => {
                    this.setState({baNumber});
                  }}
                  style={[globalStyles.inputStyle, {marginTop: 0}]}
                  keyboardType={'number-pad'}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'badge-account'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />

                <TextInput
                  label="Work Order No."
                  value={this.state.wkNumber}
                  onChangeText={(wkNumber) => {
                    this.setState({wkNumber});
                  }}
                  style={globalStyles.inputStyle}
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
                  label="KM"
                  value={this.state.kiloMeter}
                  onChangeText={(kiloMeter) => {
                    this.setState({kiloMeter});
                  }}
                  style={globalStyles.inputStyle}
                  keyboardType={'number-pad'}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'speedometer'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />
                <TextInput
                  label="Tech Problem"
                  value={this.state.techProblem}
                  onChangeText={(techProblem) => {
                    this.setState({techProblem});
                  }}
                  style={globalStyles.inputStyle}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'screw-machine-round-top'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />
                <TextInput
                  label="Any Other"
                  value={this.state.anyOther}
                  onChangeText={(anyOther) => {
                    this.setState({anyOther});
                  }}
                  style={globalStyles.inputStyle}
                  right={
                    <TextInput.Icon
                      name={() => (
                        <Icon
                          name={'hammer-screwdriver'}
                          size={20}
                          color={colors.textLight}
                        />
                      )}
                    />
                  }
                  theme={inputTheme}
                />

                <Ripple
                  style={[
                    globalStyles.buttonStyle(colors.primaryColor),
                    {width: Dimensions.get('window').width / 2, marginTop: 30},
                  ]}
                  disabled={this.state.loading ? true : false}
                  onPress={() => manageEntry()}>
                  {this.state.loading ? (
                    <ActivityIndicator color="#fff" size={26} />
                  ) : (
                    <Text
                      style={{color: colors.primaryTextColor, fontSize: 20}}>
                      {this.state.orderId ? 'Update' : 'Submit'}
                    </Text>
                  )}
                </Ripple>
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
})(AddEntry);

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
});
