import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import Header from '../common/Header';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {ScrollView} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../global/config';
import {connect} from 'react-redux';
import {getThemeColors} from '../../global/themes';
import NoNotifications from '../common/notifications.json';
import LottieView from 'lottie-react-native';

class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unitList: {},
      contentLoading: true,
      refreshing: false,
    };
  }

  async componentDidMount() {
    this.unitList();
  }

  unitList = () => {
    console.log(`${API_URL}unitList`);
    fetch(`${API_URL}unitList`)
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        this.setState({
          refreshing: false,
          contentLoading: false,
          unitList: response.units,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({contentLoading: false, refreshing: false});
      });
  };

  render() {
    const {colors} = this.props;

    const ContentLoader = () => {
      const array = [0, 1, 2, 3, 4, 5, 6, 7];
      return (
        <View style={{flex: 1, backgroundColor: colors.backgroundColor}}>
          <SkeletonPlaceholder backgroundColor={colors.cardColor}>
            {array.map((item) => (
              <View style={{height: 90, marginBottom: 5}} key={item} />
            ))}
          </SkeletonPlaceholder>
        </View>
      );
    };

    return (
      <>
        <Header title="Unit List" back={true} />
        {this.state.contentLoading ? (
          <ContentLoader />
        ) : (
          <View style={styles.container(colors.secondaryColor)}>
            {Object.keys(this.state.unitList).length > 0 ? (
              <FlatList
                data={Object.keys(this.state.unitList)}
                onRefresh={() => {
                  this.setState(
                    {
                      refreshing: true,
                      page: 0,
                    },
                    () => {
                      this.unitList();
                    },
                  );
                }}
                refreshing={this.state.refreshing}
                keyExtractor={(_, i) => i}
                style={{paddingHorizontal: 5}}
                onEndReachedThreshold={10}
                renderItem={({item}) => {
                  return (
                    <View
                      style={styles.notificationContainer(colors.borderColor)}>
                      <Text style={styles.name(colors.textColor)}>
                        {this.state.unitList[item]}
                      </Text>
                    </View>
                  );
                }}
              />
            ) : (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}>
                <>
                  <LottieView
                    source={NoNotifications}
                    autoPlay
                    loop
                    style={{
                      marginBottom: 20,
                      height: 200,
                      paddingLeft: 20,
                    }}
                  />
                </>
                <Text style={{color: colors.textLight, fontSize: 17}}>
                  No Units Found
                </Text>
              </View>
            )}
          </View>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme);
  return {colors: theme};
};

export default connect(mapStateToProps)(Notifications);

const styles = StyleSheet.create({
  container: (bgColor) => ({
    flex: 1,
    backgroundColor: bgColor,
  }),
  notificationContainer: (color) => ({
    borderBottomWidth: 1,
    borderBottomColor: color,
    padding: 5,
  }),
  name: (color) => ({
    fontSize: 16,
    color: color,
    textAlign: 'center',
  }),
});
