import React, {Component} from 'react';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import Header from '../common/Header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../global/config';
import {connect} from 'react-redux';
import {getThemeColors} from '../../global/themes';
import {Title, Snackbar} from 'react-native-paper';
import Spareparts from './../common/Sparepart';
import Loader from '../common/Loader';
import Menu, {MenuItem} from 'react-native-material-menu';

class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderData: {},
      actions: [],
      loading: true,
      isModelVisible: false,
      orderId: null,
    };
  }

  async componentDidMount() {
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      this.setState({
        userId: userInfo.id,
      });
    }
    // this.getRecord(7);
  }

  getRecord = (orderId) => {
    let requestData = JSON.stringify({
      id: orderId,
    });
    this.setState({loading: true});

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
        console.log(response.data);
        this.setState({loading: false});

        if (response.status) {
          this.setState({
            orderData: response.data,
            actions: response.actions,
            orderId: orderId,
          });
        } else {
          this.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({loading: false});
      });
  };

  showSnackbar = (message, status = false) => {
    this.setState({
      visible: true,
      success: status,
      message: message,
    });
  };

  updateSparePartValue = (content) => {
    var orderData = this.state.orderData;
    orderData.spare = {content};

    this.setState({
      orderData: orderData,
    });
  };

  _menu = null;

  setMenuRef = (ref) => {
    this._menu = ref;
  };

  onMenuPress = (menuId) => {
    if (menuId === 'edit') {
      this.props.navigation.navigate('Shipment', {
        orderId: this.state.orderId,
        screen: 'Dashboard',
      });
    } else if (menuId === 'add_sparepart') {
      this.setState({
        isModelVisible: true,
        recordId: this.state.orderId,
      });
    } else {
      this.setState({loading: true});
      this.changeOrderStatus(menuId, this.state.orderId);
    }
  };

  changeOrderStatus = (statusId, orderId) => {
    console.log(
      `${API_URL}statusUpdate`,
      JSON.stringify({
        id: orderId,
        status: statusId,
      }),
    );
    fetch(`${API_URL}statusUpdate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: orderId,
        status: statusId,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        this.setState({loading: false});

        if (response.status) {
          var orderData = this.state.orderData;

          console.log(orderData);

          //   renderData.map((item) => {
          //     if (item.id === orderId) {
          orderData.status = response.statusObj;
          orderData.action = response.actions;
          //     }
          //   });

          this.setState({
            orderData: orderData,
            actions: response.actions,
          });

          this.showSnackbar(response.status_text, true);
        } else {
          this.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({loading: false});
      });
  };

  render() {
    const {colors} = this.props;
    const {orderData} = this.state;
    const param = this.props.route.params;
    if (param !== undefined) {
      if (param.screen !== undefined) {
        this.getRecord(param.id);

        param.screen = undefined;
      }
    }

    return (
      <>
        <Header title="Details" hideNotification={true} back={true} />

        <ScrollView style={styles.container(colors.secondaryColor)}>
          {Object.keys(orderData).length ? (
            <>
              <Spareparts
                visible={this.state.isModelVisible}
                recordId={this.state.orderId}
                content={orderData.spare ? orderData.spare.content : ''}
                colors={colors}
                showSnackbar={this.showSnackbar}
                updateSparePartValue={this.updateSparePartValue}
                onClosePress={() => {
                  this.setState({
                    isModelVisible: false,
                  });
                }}
                changeContent={(content) => {
                  let orderData = this.state.orderData;
                  orderData.spare = {content};
                  this.setState({
                    orderData: orderData,
                  });
                }}
              />
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: -50,
                }}>
                <Icon
                  name="car-hatchback"
                  size={Dimensions.get('window').width - 50}
                  color={colors.textColor}
                  style={{alignItems: 'center', justifyContent: 'center'}}
                />
              </View>
              <View style={{paddingHorizontal: 15}}>
                <Title
                  style={{
                    color: colors.textColor,
                    fontSize: 25,
                    textAlign: 'center',
                  }}>
                  {orderData.model.text}
                </Title>
                <View style={{marginTop: 20}}>
                  <Text style={styles.textStyle(colors.textColor)}>
                    BA No. : {orderData.ba_no}
                  </Text>
                  <Text style={styles.textStyle(colors.textColor)}>
                    Unit : {orderData.unit.text}
                  </Text>
                  <Text style={styles.textStyle(colors.textColor)}>
                    Work Order No. : {orderData.work_order_no}
                  </Text>
                  <Text style={styles.textStyle(colors.textColor)}>
                    KM : {orderData.km}
                  </Text>
                  <Text style={styles.textStyle(colors.textColor)}>
                    Problem : {orderData.problem}
                  </Text>
                  {orderData.spare && (
                    <Text style={styles.textStyle(colors.textColor)}>
                      Spare Parts : {orderData.spare.content}
                    </Text>
                  )}
                  <Text style={styles.textStyle(colors.textColor)}>
                    Note : {orderData.note}
                  </Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.textStyle(colors.textColor)}>
                      Status : {orderData.status.text}
                    </Text>
                    <View
                      style={{
                        marginLeft: 'auto',
                        flexDirection: 'row',
                        // zIndex: 99999,
                      }}>
                      {this.state.actions && this.state.actions.length > 0 && (
                        <>
                          <Menu
                            ref={this.setMenuRef}
                            style={{backgroundColor: colors.secondaryColor}}
                            button={
                              <TouchableOpacity
                                onPress={() => {
                                  this._menu.show();
                                }}
                                style={{
                                  marginTop: 'auto',
                                  marginBottom: 'auto',
                                  marginLeft: 10,
                                }}>
                                <Text style={{color: '#78A3E8'}}> Change</Text>
                              </TouchableOpacity>
                            }>
                            <MenuItem
                              onPress={() => {
                                this.onMenuPress('edit');
                                this._menu.hide();
                              }}>
                              <Text style={{color: colors.textColor}}>
                                Edit
                              </Text>
                            </MenuItem>
                            <MenuItem
                              onPress={() => {
                                this.onMenuPress('add_sparepart');
                                this._menu.hide();
                              }}>
                              <Text style={{color: colors.textColor}}>
                                Add Sparepart
                              </Text>
                            </MenuItem>
                            {Object.keys(this.state.actions).map((key) => {
                              return (
                                <>
                                  <MenuItem
                                    onPress={() => {
                                      this.onMenuPress(
                                        Object.keys(this.state.actions[key])[0],
                                      );
                                      this._menu.hide();
                                    }}
                                    key={key}>
                                    <Text style={{color: colors.textColor}}>
                                      {
                                        Object.values(
                                          this.state.actions[key],
                                        )[0]
                                      }
                                    </Text>
                                  </MenuItem>
                                </>
                              );
                            })}
                          </Menu>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </>
          ) : null}
        </ScrollView>
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
        {this.state.loading && <Loader color={colors.primaryColor} />}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme);
  return {colors: theme};
};

export default connect(mapStateToProps)(Detail);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
  textStyle: (color) => ({
    fontSize: 20,
    color: color,
  }),
});
