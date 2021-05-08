import React, {Component} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
} from 'react-native';
// import {TouchableRipple} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
// import MIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import {connect} from 'react-redux';
import {getThemeColors} from '../../global/themes';

class ListCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      expanded: false,
    };

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  getBackgroundColor = (color) => {
    if (color === 'success') {
      return '#5cb85c';
    } else if (color === 'danger') {
      return '#d9534f';
    } else if (color === 'primary') {
      return '#0275d8';
    } else if (color === 'warning') {
      return '#f0ad4e';
    } else if (color === 'info') {
      return '#5bc0de';
    } else if (color === 'dark') {
      return '#23272B';
    } else {
      return color;
    }
  };

  _menu = null;

  setMenuRef = (ref) => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
  };

  render() {
    const {colors, dataItem, currency} = this.props;

    // console.log(currency);

    return (
      <>
        <View
          style={[
            this.props.style,
            {
              marginVertical: 5,
              borderWidth: 1,
              borderColor: '#999999',
              elevation: 2,
              borderRadius: 15,
              // marginHorizontal: 15,
              backgroundColor: colors.cardColor,
            },
          ]}>
          <View
            style={this.state.expanded ? styles.cardExpand : styles.cardNormal}>
            <View style={{flexDirection: 'row', marginBottom: 5}}>
              <Text style={[styles.textStyle]}>BA No. : </Text>
              <TouchableOpacity
                style={{
                  marginBottom: 'auto',
                }}
                onPress={() =>
                  this.props.navigate('Details', {
                    id: dataItem.id,
                    screen: 'Dashboard',
                  })
                }>
                <Text
                  style={[
                    styles.textStyle,
                    {
                      color: '#78A3E8',
                    },
                  ]}>
                  {dataItem.ba_no}
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  marginLeft: 'auto',
                  flexDirection: 'row',
                  // zIndex: 99999,
                }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 5,
                    paddingBottom: 5,
                  }}
                  onPress={() => {
                    this.toggleExpand();
                  }}>
                  <Icon size={22} name="info" color="#a4b5c5" />
                </TouchableOpacity>

                {dataItem.action && dataItem.action.length > 0 && (
                  <>
                    <Menu
                      ref={this.setMenuRef}
                      style={{backgroundColor: colors.secondaryColor}}
                      button={
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 5,
                            paddingBottom: 5,
                          }}
                          onPress={() => {
                            this._menu.show();
                          }}>
                          <MaterialCommunityIcons
                            size={22}
                            name="dots-vertical"
                            color="#a4b5c5"
                          />
                        </TouchableOpacity>
                      }>
                      <MenuItem
                        onPress={() => {
                          this.props.onMenuPress('edit');
                          this._menu.hide();
                        }}>
                        <Text style={{color: colors.textColor}}>Edit</Text>
                      </MenuItem>
                      <MenuItem
                        onPress={() => {
                          // alert(dataItem.spare.content);
                          let content =
                            dataItem.spare !== null
                              ? dataItem.spare.content
                              : '';

                          this.props.onMenuPress('add_sparepart', content);
                          this._menu.hide();
                        }}>
                        <Text style={{color: colors.textColor}}>
                          Add Sparepart
                        </Text>
                      </MenuItem>
                      {Object.keys(dataItem.action).map((key) => {
                        return (
                          <>
                            <MenuItem
                              onPress={() => {
                                this.props.onMenuPress(
                                  Object.keys(dataItem.action[key])[0],
                                );
                                this._menu.hide();
                              }}
                              key={key}>
                              <Text style={{color: colors.textColor}}>
                                {Object.values(dataItem.action[key])[0]}
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
            <Text
              style={{
                color: this.state.expanded ? '#fff' : colors.cardTextColor,
                fontSize: 20,
                fontWeight: 'bold',
              }}>
              {dataItem.model.text}
            </Text>
          </View>
          {this.state.expanded && (
            <View style={styles.childCard(colors.cardColor)}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.textStyle}>
                  Unit : {dataItem.unit.text}
                </Text>

                <View style={{marginLeft: 'auto'}}>
                  <Text style={styles.textStyle}>KM : {dataItem.km}</Text>
                </View>
              </View>
              <Text style={[styles.textStyle]}>
                W.O.N. : {dataItem.work_order_no}
              </Text>
              <Text style={[styles.textStyle]}>
                In Date : {dataItem.inTime.date} {dataItem.inTime.time}
              </Text>
              <Text style={styles.textStyle}>Problem : {dataItem.problem}</Text>

              {dataItem.note !== '' && (
                <Text style={styles.textStyle}>Note : {dataItem.note}</Text>
              )}

              <Text style={styles.textStyle}>
                Status : {dataItem.status.text}
              </Text>
            </View>
          )}
        </View>
      </>
    );
  }

  toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({expanded: !this.state.expanded});
  };
}

const mapStateToProps = (state) => {
  var theme = getThemeColors(state.theme);
  return {colors: theme};
};

export default connect(mapStateToProps)(ListCard);

const styles = StyleSheet.create({
  textStyle: {
    color: '#a4b5c5',
    fontSize: 16,
  },
  textBlack: (color) => ({
    color: color,
    fontSize: 16,
    opacity: 0.6,
  }),
  textWhite: (cardTextColor) => ({
    color: cardTextColor,
    fontSize: 16,
    opacity: 0.8,
  }),
  cardNormal: {
    // backgroundColor: bgColor,
    padding: 10,
    // borderRadius: 15,
  },
  childCard: (bgColor) => ({
    backgroundColor: bgColor,
    padding: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  }),
  cardExpand: {
    backgroundColor: '#014CA7',
    padding: 10,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
});
