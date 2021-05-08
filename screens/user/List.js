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
  ScrollView,
} from 'react-native';
import Header from '../common/Header';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../global/config';
import {Snackbar} from 'react-native-paper';
import {connect} from 'react-redux';
import {getThemeColors} from '../../global/themes';
import rocketAnim from './../common/rocketAnim.json';
import shippingTruck from './../common/shipping-truck.json';
import AnimatedPullToRefresh from 'react-native-animated-pull-to-refresh';
import Loader from '../common/Loader';
// import Ripple from 'react-native-material-ripple';
// import LinearGradient from 'react-native-linear-gradient';
// import Menu, {MenuItem} from 'react-native-material-menu';
import Accordian from './../common/Accordian';
import LottieView from 'lottie-react-native';
import Spareparts from './../common/Sparepart';

const vh = Dimensions.get('window').height * 0.01;

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contentLoading: false,
      visible: false,
      success: false,
      message: '',
      isRefreshing: false,
      showLoading: true,
      isModelVisible: false,
      pageMeta: {},
      recordSummery: {},
      loadMore: true,
      page: 1,
      activeColor: '',
      renderData: [],
      days: '',
      filterType: 'all',
      filters: {},
      recordId: null,
      content: '',
    };

    // alert(this.props.currency);

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  setMenuRef = (ref) => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
  };

  async componentDidMount() {
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      this.setState({
        userId: userInfo.id,
      });
    }
  }

  carList = (filterType = this.state.filterType, removeRecord = false) => {
    let pageNumber = this.state.page;
    let bodyData = JSON.stringify({
      type: filterType,
      page: pageNumber,
      days: this.state.days,
    });

    // alert(bodyData);

    console.log(`${API_URL}carList`, bodyData);

    fetch(`${API_URL}carList`, {
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
          this.setState({
            pageMeta: response.meta,
            isRefreshing: false,
            showLoading: false,
            filteringRecords: false,
          });

          LayoutAnimation.configureNext({
            duration: 450,
            create: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.opacity,
            },
            update: {type: LayoutAnimation.Types.easeInEaseOut},
          });

          if (response.meta.pages === 0) {
            this.setState({
              renderData: [],
              contentLoading: false,
            });
          } else if (pageNumber === response.meta.pages) {
            this.setState({
              loadMore: false,
              contentLoading: false,
            });

            if (response.data.length > 0 && removeRecord) {
              this.setState({
                renderData: response.data,
              });
            } else if (response.data.length > 0 && !removeRecord) {
              this.setState({
                renderData: this.state.renderData.concat(response.data),
              });
            } else if (removeRecord) {
              this.setState({
                renderData: [],
              });
            }
          } else {
            if (pageNumber === 1) {
              this.setState({
                renderData: response.data,
                contentLoading: false,
              });
            } else {
              if (response.data.length > 0) {
                this.setState({
                  renderData: this.state.renderData.concat(response.data),
                });
              } else {
                this.setState({
                  loadMore: false,
                });
              }
            }
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

  onRefresh = () => {
    this.setState(
      {
        isRefreshing: true,
        page: 1,
        loadMore: true,
      },
      () => {
        this.carList(this.state.filterType, true);
      },
    );
  };

  onEndReached = () => {
    let newPage = this.state.page + 1;
    // alert(this.state.pageMeta.pages + ' = ' + newPage);
    if (newPage <= this.state.pageMeta.pages) {
      this.setState(
        {
          page: newPage,
        },
        () => {
          this.carList();
        },
      );
    } else {
      this.setState({
        loadMore: false,
      });
    }
  };

  onMenuPress = (menuId, orderId, content) => {
    console.log(orderId + '=' + menuId);

    if (menuId === 'edit') {
      this.props.navigation.navigate('Shipment', {
        orderId: orderId,
        screen: 'Dashboard',
      });
    } else if (menuId === 'add_sparepart') {
      this.setState({
        recordId: orderId,
        content: content,
        isModelVisible: true,
      });
    } else {
      this.setState({showLoading: true});
      this.changeOrderStatus(menuId, orderId);
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
        this.setState({showLoading: false});

        if (response.status) {
          var renderData = [...this.state.renderData];

          renderData.map((item) => {
            if (item.id === orderId) {
              item.status = response.statusObj;
              item.action = response.actions;
            }
          });

          LayoutAnimation.configureNext({
            duration: 300,
            create: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.opacity,
            },
            update: {type: LayoutAnimation.Types.easeInEaseOut},
          });

          this.showSnackbar(response.status_text, true);
          this.setState({renderData});
        } else {
          this.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({showLoading: false});
      });
  };

  updateSparePartValue = (content, id) => {
    // alert(content + id);

    var renderData = [...this.state.renderData];

    renderData.map((item) => {
      if (item.id === id) {
        item.spare = {content: content};
      }
    });

    this.setState({
      renderData: renderData,
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
            filterType: param.type,
            days: param.days,
          },
          () => {
            this.carList(param.type, true);
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
            <AnimatedPullToRefresh
              isRefreshing={this.state.isRefreshing}
              onRefresh={this.onRefresh}
              pullHeight={10 * vh}
              backgroundColor={'#5DADE2'}
              renderElement={
                <ScrollView style={styles.container}>
                  <Spareparts
                    visible={this.state.isModelVisible}
                    recordId={this.state.recordId}
                    colors={colors}
                    showSnackbar={this.showSnackbar}
                    content={this.state.content}
                    updateSparePartValue={this.updateSparePartValue}
                    onClosePress={() => {
                      this.setState({
                        isModelVisible: false,
                      });
                    }}
                    changeContent={(content) => {
                      this.setState({
                        content: content,
                      });
                    }}
                  />
                  <View style={{paddingHorizontal: 12, marginTop: 10}}>
                    {this.state.renderData.length > 0 ? (
                      <>
                        <View>
                          <FlatList
                            nestedScrollEnabled={true}
                            data={this.state.renderData}
                            keyExtractor={(item) => item.id.toString()}
                            ListFooterComponent={
                              this.state.loadMore ? (
                                <ActivityIndicator
                                  color={colors.primaryColor}
                                  size="large"
                                />
                              ) : null
                            }
                            onEndReached={() => this.onEndReached()}
                            onEndReachedThreshold={10}
                            renderItem={({item}) => (
                              <View
                                style={{
                                  backgroundColor: colors.backgroundColor,
                                }}>
                                <Accordian
                                  dataItem={item}
                                  onMenuPress={(mid, content = '') => {
                                    // let id = mid === 1 ? item.id : [item.id];
                                    this.onMenuPress(mid, item.id, content);
                                  }}
                                  navigate={this.props.navigation.navigate}
                                />
                              </View>
                            )}
                          />
                        </View>
                      </>
                    ) : (
                      !this.state.showLoading && (
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <LottieView
                            source={shippingTruck}
                            style={{
                              height: Dimensions.get('window').height / 3.2,
                            }}
                            autoPlay
                            loop
                          />
                          <Text style={{color: colors.textLight, fontSize: 17}}>
                            No Records Found
                          </Text>
                        </View>
                      )
                    )}

                    {/* <Text style={{color: 'red'}}>
                                In: 01-02-2021 10:21 am {'\n'} Status: Repaired
                              </Text> */}
                  </View>
                </ScrollView>
              }
              pullAnimationSource={rocketAnim}
              startRefreshAnimationSource={rocketAnim}
              refreshAnimationSource={shippingTruck}
              endRefreshAnimationSource={shippingTruck}
            />
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

export default connect(mapStateToProps)(Dashboard);

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
