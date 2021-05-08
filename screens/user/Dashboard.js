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
  TextInput,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../common/Header';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../global/config';
import {TouchableRipple, Snackbar, Title, DataTable} from 'react-native-paper';
import {connect} from 'react-redux';
import {getThemeColors} from '../../global/themes';
import rocketAnim from './../common/rocketAnim.json';
import Segment from './../common/Segment';
import shippingTruck from './../common/shipping-truck.json';
import AnimatedPullToRefresh from 'react-native-animated-pull-to-refresh';
import Loader from '../common/Loader';
import Ripple from 'react-native-material-ripple';
// import LinearGradient from 'react-native-linear-gradient';
import Menu, {MenuItem} from 'react-native-material-menu';
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
      showLoading: false,
      isModelVisible: false,
      pageMeta: {},
      recordSummery: {},
      loadMore: true,
      page: 1,
      activeColor: '',
      renderData: [],
      days: 10,
      last10daysin: 10,
      last10daysout: 10,
      filterType: 'all',
      filters: {},
      recordId: null,
      content: '',
      displayFilterValue: 'All Latest Car',
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
    SplashScreen.hide();

    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      this.setState({
        userId: userInfo.id,
      });
    }
    this.carList();
    this.recordSummery();
    this.getFilterList();
    // this.getFinancialSummery();
    // this.merchantOrderList(this.state.filterType);
    // this.getOrderFilter();
  }

  getFilterList = () => {
    console.log(`${API_URL}filterParam`);
    fetch(`${API_URL}filterParam`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status) {
          this.setState({
            filters: response.data,
          });
        }
      })
      .catch((err) => {
        console.log('getOrderFilter = ' + err);
        this.setState({contentLoading: false});
      });
  };

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

          // this.setState({
          //   renderData: response.data,
          // });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({contentLoading: false, filteringRecords: false});
      });
  };

  recordSummery = () => {
    let bodyData = JSON.stringify({
      days: this.state.days,
    });

    console.log(`${API_URL}recordSummery`, bodyData);
    fetch(`${API_URL}recordSummery`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    })
      .then((res) => res.json())
      .then((response) => {
        // console.log(response.data);
        if (response.status) {
          this.setState({
            recordSummery: response.data,
          });
        }
      })
      .catch((err) => {
        console.log(err);
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
        filterType: 'all',
        displayFilterValue: 'All Latest Car',
      },
      () => {
        this.recordSummery();
        this.carList('all', true);
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
        this.showSnackbar(param.message, param.status);

        this.setState(
          {
            page: 1,
            loadMore: true,
          },
          () => {},
        );

        param.screen = undefined;
      }
    }

    const ContentLoader = () => {
      const array = [0, 1, 2, 3, 4, 5];
      return (
        <View style={{flex: 1, backgroundColor: colors.backgroundColor}}>
          <SkeletonPlaceholder backgroundColor={colors.cardColor}>
            <View style={{height: 130}} />
            <View style={{paddingHorizontal: 10, marginTop: 20}}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}>
                {array.map((i) => (
                  <View style={styles.imageBox} key={i}>
                    <View style={styles._imageIcon}>
                      <View style={{width: '70%', justifyContent: 'center'}} />
                    </View>
                  </View>
                ))}
              </View>
              <View style={{marginTop: 10}}>
                <View style={styles.cardStyle} />
                <View style={styles.cardStyle} />
                <View style={styles.cardStyle} />
              </View>
            </View>
          </SkeletonPlaceholder>
        </View>
      );
    };

    const {colors} = this.props;
    return (
      <>
        <Header title="Dashboard" />
        <>
          {this.state.contentLoading ? (
            <ContentLoader />
          ) : (
            <View style={styles.container(colors.backgroundColor)}>
              <AnimatedPullToRefresh
                isRefreshing={this.state.isRefreshing}
                onRefresh={this.onRefresh}
                pullHeight={10 * vh}
                backgroundColor={'#5DADE2'}
                renderElement={
                  <ScrollView style={styles.container}>
                    <Segment
                      index="0"
                      theme={this.props.theme}
                      colors={colors}
                    />
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
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                          }}>
                          {Object.keys(this.state.recordSummery).map((key) => {
                            let last = {};

                            if (key !== 'normal') {
                              last = {width: '100%'};
                            }

                            let records = this.state.recordSummery;

                            if (key === 'normal') {
                              return Object.keys(records.normal).map((key) => {
                                let fullWidth = {};

                                // console.log(records.normal[key]);

                                if (records.normal[key].full_width) {
                                  fullWidth = {width: '100%'};
                                }
                                return (
                                  <Ripple
                                    style={[
                                      styles.cardStyle(
                                        records.normal[key].color.bg,
                                      ),
                                      fullWidth,
                                    ]}
                                    onPress={() => {
                                      this.props.navigation.navigate('List', {
                                        screen: 'Dashboard',
                                        title: records.normal[key].text,
                                        type:
                                          records.normal[key].filterParam.type,
                                      });
                                    }}>
                                    <Text
                                      style={styles.cardHeading(
                                        records.normal[key].color.font,
                                      )}>
                                      {records.normal[key].text}
                                    </Text>
                                    <Text
                                      style={styles.cardNumber(
                                        records.normal[key].color.font,
                                      )}>
                                      {records.normal[key].number}
                                    </Text>
                                  </Ripple>
                                );
                              });
                            } else if (key === 'special') {
                              return Object.keys(records.special).map((key) => {
                                return (
                                  <View
                                    style={[
                                      styles.cardStyle(
                                        records.special[key].color.bg,
                                      ),
                                      last,
                                    ]}>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}>
                                      <Text
                                        style={styles.cardHeading(
                                          records.special[key].color.font,
                                        )}>
                                        Last
                                      </Text>
                                      <TextInput
                                        style={{
                                          height: 40,
                                          width: 50,
                                          marginHorizontal: 10,
                                          borderWidth: 1,
                                          borderColor: colors.secondaryColor,
                                          borderRadius: 5,
                                          paddingHorizontal: 5,
                                          color:
                                            records.special[key].color.font,
                                        }}
                                        onSubmitEditing={() => {
                                          this.props.navigation.navigate(
                                            'List',
                                            {
                                              screen: 'Dashboard',
                                              title: `Last ${this.state[key]} ${records.special[key].text}`,
                                              days: this.state[key],
                                              type:
                                                records.special[key].filterParam
                                                  .type,
                                            },
                                          );

                                          // this.setState(
                                          //   {
                                          //     showLoading: true,
                                          //     page: 1,
                                          //     loadMore: true,
                                          //     filterType:
                                          //       records.special[key].filterParam
                                          //         .type,
                                          //   },
                                          //   () => {
                                          //     this.carList(
                                          //       records.special[key].filterParam
                                          //         .type,
                                          //       true,
                                          //     );
                                          //     this.recordSummery();
                                          //   },
                                          // );
                                        }}
                                        maxLength={4}
                                        placeholderTextColor={colors.textColor}
                                        onChangeText={(days) => {
                                          let state = {};
                                          state[key] = days;
                                          console.log(state);
                                          this.setState(state);
                                        }}
                                        value={this.state[key].toString()}
                                        placeholder="Days"
                                        keyboardType="numeric"
                                      />
                                      <Text
                                        style={styles.cardHeading(
                                          records.special[key].color.font,
                                        )}>
                                        {records.special[key].text}
                                      </Text>
                                    </View>
                                    <Text
                                      style={styles.cardNumber(
                                        records.special[key].color.font,
                                      )}>
                                      {records.special[key].number}
                                    </Text>
                                  </View>
                                );
                              });
                            }
                          })}
                        </View>
                      </View>

                      <View style={{marginTop: 10}}>
                        <View style={{flexDirection: 'row'}}>
                          <Title style={{color: colors.textColor}}>
                            {this.state.displayFilterValue}
                          </Title>
                          <View style={{marginLeft: 'auto'}}>
                            {this.state.filteringRecords ? (
                              <ActivityIndicator
                                size={30}
                                color={colors.primaryColor}
                              />
                            ) : (
                              <Menu
                                ref={this.setMenuRef}
                                style={{backgroundColor: colors.secondaryColor}}
                                button={
                                  <TouchableRipple
                                    onPress={this.showMenu}
                                    borderless={true}
                                    centered={true}
                                    style={{
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      overflow: 'hidden',
                                      margin: 6,
                                      width: 30 * 1.2,
                                      height: 30 * 1.2,
                                      borderRadius: (30 * 1.2) / 2,
                                    }}
                                    rippleColor="rgba(0, 0, 0, .32)">
                                    <Icon
                                      size={30}
                                      name="filter-variant"
                                      color={colors.textLight}
                                    />
                                  </TouchableRipple>
                                }>
                                {Object.keys(this.state.filters).map(
                                  (key, i) => {
                                    return (
                                      <MenuItem
                                        onPress={() => {
                                          this.setState(
                                            {
                                              filteringRecords: true,
                                              page: 1,
                                              loadMore: true,
                                              filterType: key,
                                              displayFilterValue: this.state
                                                .filters[key],
                                              selectedItem: [],
                                            },
                                            () => {
                                              this.carList(
                                                this.state.filterType,
                                                true,
                                              );
                                              this.recordSummery();
                                            },
                                          );
                                          this._menu.hide();
                                        }}>
                                        <Text style={{color: colors.textLight}}>
                                          {this.state.filters[key]}
                                        </Text>
                                      </MenuItem>
                                    );
                                  },
                                )}
                              </Menu>
                            )}
                          </View>
                        </View>
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
                            <Text
                              style={{color: colors.textLight, fontSize: 17}}>
                              No Records Found
                            </Text>
                          </View>
                        )}

                        {/* <Text style={{color: 'red'}}>
                                In: 01-02-2021 10:21 am {'\n'} Status: Repaired
                              </Text> */}
                      </View>
                    </View>
                  </ScrollView>
                }
                pullAnimationSource={rocketAnim}
                startRefreshAnimationSource={rocketAnim}
                refreshAnimationSource={shippingTruck}
                endRefreshAnimationSource={shippingTruck}
              />
            </View>
          )}
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
  return {colors: theme, theme: state.theme};
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
