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
import MIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import {connect} from 'react-redux';
import {getThemeColors} from '../../global/themes';

class Load extends Component {
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
    const {colors, dataItem} = this.props;

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
                      this.props.onMenuPress(dataItem.id);
                      this._menu.hide();
                    }}>
                    <Text style={{color: colors.textColor}}>Edit</Text>
                  </MenuItem>
                </Menu>
              </View>
            </View>
            <Text
              style={{
                color: colors.cardTextColor,
                fontSize: 20,
                fontWeight: 'bold',
              }}>
              {dataItem.model.name}
            </Text>
          </View>

          {this.state.expanded && (
            <View style={styles.childCard(colors.cardColor)}>
              {/* <View style={{flexDirection: 'row'}}> */}
              {/* <Text style={styles.textStyle}>Model : {dataItem.model.name}</Text> */}
              <Text style={styles.textStyle}>Unit : {dataItem.ba_no}</Text>
              <Text style={styles.textStyle}>KM : {dataItem.km}</Text>
              <Text style={styles.textStyle}>Type : {dataItem.type.name}</Text>
              <Text style={styles.textStyle}>Class : {dataItem.cl.name}</Text>
              <Text style={styles.textStyle}>Engine : {dataItem.engine}</Text>
              <Text style={styles.textStyle}>Other : {dataItem.other}</Text>

              {/* <View style={{marginLeft: 'auto'}}> */}
              {/* </View> */}
              {/* </View> */}
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

export default connect(mapStateToProps)(Load);

const styles = StyleSheet.create({
  textStyle: {
    color: '#6c6e70',
    fontSize: 16,
    fontWeight: 'bold',
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
  badgeStyle: (bgColor) => ({
    color: '#fff',
    fontSize: 13,
    backgroundColor: bgColor,
    paddingHorizontal: 6,
    paddingVertical: 1.2,
    borderRadius: 8,
    textTransform: 'uppercase',
    elevation: 1.2,
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
