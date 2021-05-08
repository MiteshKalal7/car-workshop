import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {globalStyles} from '../../global/styles';
import Ripple from 'react-native-material-ripple';
import Modal from 'react-native-modal';
import {Divider, TouchableRipple} from 'react-native-paper';
import {API_URL} from '../../global/config';

export default class Spareparts extends React.Component {
  constructor(props) {
    super(props);
    // alert('spare = ' + this.props.content);
    this.state = {
      text: '',
      loading: false,
    };
  }

  manageSparePart = () => {
    this.setState({
      loading: true,
    });

    let requestData = JSON.stringify({
      content: this.props.content,
      car_id: this.props.recordId,
    });

    console.log(`${API_URL}addORupdateSpareParts`, requestData);

    fetch(`${API_URL}addORupdateSpareParts`, {
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
        this.setState({
          loading: false,
        });
        if (response.status) {
          this.setState({
            text: '',
          });
          this.props.onClosePress();
          this.props.showSnackbar(response.status_text, true);
          let text = this.props.content;
          if (text === '') {
            text = this.props.content;
          }
          this.props.updateSparePartValue(text, this.props.recordId);
        } else {
          this.props.showSnackbar(response.status_text);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({loading: false});
      });
  };

  render() {
    const {colors} = this.props;

    // if (this.props.content !== this.props.content) {
    //   alert(this.props.content);
    //   console.log('content__ = ' + this.props.content);
    //   this.setState({
    //     text: this.props.content,
    //   });
    // }

    return (
      <Modal isVisible={this.props.visible}>
        <View
          style={{
            // flex: 1,
            backgroundColor: colors.secondaryColor,
            borderRadius: 20,
            justifyContent: 'center',
          }}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.title(colors.textColor)}>
              Manage SpareParts
            </Text>
            <TouchableRipple
              onPress={() => {
                this.props.onClosePress();
              }}
              borderless={true}
              centered={true}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                width: 30 * 1.5,
                height: 30 * 1.5,
                borderRadius: (30 * 1.5) / 2,
                marginLeft: 'auto',
                marginVertical: 5,
                marginRight: 5,
              }}
              rippleColor="rgba(0, 0, 0, .32)">
              <Icon size={30} name="close" color={colors.alertDanger} />
            </TouchableRipple>
          </View>
          <Divider />

          <View
            style={{marginBottom: 20, paddingHorizontal: 15, marginTop: 10}}>
            <TextInput
              multiline={true}
              numberOfLines={4}
              onChangeText={(text) => this.props.changeContent(text)}
              value={this.props.content}
              style={{
                color: colors.textLight,
                opacity: 0.8,
                borderColor: colors.borderColor,
                borderWidth: 1,
                borderRadius: 4,
                textAlignVertical: 'top',
              }}
              placeholderTextColor={colors.textColor}
              placeholder="Enter Spare parts details"
            />

            <Ripple
              style={globalStyles.buttonStyle(colors.primaryColor)}
              disabled={this.state.loading ? true : false}
              onPress={() => {
                this.manageSparePart();
              }}>
              {this.state.loading ? (
                <ActivityIndicator color="#fff" size={26} />
              ) : (
                <Text style={{color: colors.primaryTextColor, fontSize: 20}}>
                  Save
                </Text>
              )}
            </Ripple>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  codeFieldRoot: {
    height: 2,
    marginTop: 30,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: (color) => ({
    paddingVertical: 10,
    color: color,
    fontSize: 25,
    fontWeight: '700',
    textAlignVertical: 'center',
    paddingLeft: 10,
    opacity: 0.8,
  }),
});
