import React from 'react';
import {StyleSheet, View, Picker} from 'react-native';
import SegmentedControl from 'rn-segmented-control';
import {useNavigation} from '@react-navigation/native';
import {TextInput, Button} from 'react-native-paper';
import {API_URL} from '../../global/config';

const Segment = (props) => {
  const navigation = useNavigation();
  const [tabIndex, setTabIndex] = React.useState(0);
  const [theme, setTheme] = React.useState('LIGHT');
  const [text, setText] = React.useState('');
  const [type, setType] = React.useState('');
  const [unit, setUnit] = React.useState('');
  const [typeList, setTypeList] = React.useState({});
  const [unitList, setUnitList] = React.useState({});

  React.useEffect(() => {
    setTabIndex(props.index);

    var theme_ = props.theme;

    // alert(theme_)

    if (theme_ !== 'default' && theme_ !== null) {
      // alert("1")
      theme_ = 'DARK';
    } else {
      // alert("2")
      theme_ = 'LIGHT';
    }
    setTheme(theme_);
    // alert(theme)
  });

  React.useEffect(() => {
    getType();
    getUnit();
  }, []);

  const getType = () => {
    fetch(`${API_URL}getType`)
      .then((res) => res.json())
      .then(({data}) => {
        setTypeList(data);
      })
      .catch((e) => {
        console.log('modelList' + e);
      });
  };

  const getUnit = () => {
    fetch(`${API_URL}getUnit`)
      .then((res) => res.json())
      .then(({data}) => {
        setUnitList(data);
      })
      .catch((e) => {
        console.log('getUnit : ' + e);
      });
  };

  const handleTabsChange = (index) => {
    setTabIndex(index);
    if (index === 0) {
      navigation.navigate('Dashboard');
    } else {
      navigation.navigate('Maintenance');
    }
  };
  return (
    <View style={styles.container}>
      <SegmentedControl
        tabs={['Home', 'Maint Load']}
        paddingVertical={10}
        containerStyle={{
          marginVertical: 5,
        }}
        currentIndex={tabIndex}
        onChange={handleTabsChange}
        theme={theme}
      />

      <View style={{flexDirection: 'row'}}>
        <View style={{width: '50%'}}>
          <Picker
            selectedValue={type}
            style={{
              height: 50,
              color: props.colors.textColor,

              flex: 1,
            }}
            onValueChange={(itemValue) => {
              setType(itemValue);
            }}>
            <Picker.Item label="Select Car Type" value="" />

            {typeList &&
              Object.keys(typeList).map((key) => {
                return <Picker.Item label={typeList[key]} value={key} />;
              })}
          </Picker>
        </View>
        <View style={{width: '50%'}}>
          <Picker
            selectedValue={unit}
            style={{
              height: 50,
              color: props.colors.textColor,

              flex: 1,
            }}
            onValueChange={(itemValue) => {
              setUnit(itemValue);
            }}>
            <Picker.Item label="Select Unit" value="" />

            {unitList &&
              Object.keys(unitList).map((key) => {
                return <Picker.Item label={unitList[key]} value={key} />;
              })}
          </Picker>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <TextInput
          label="BA No"
          value={text}
          style={{
            width: '60%',
            marginVertical: 10,
            fontSize: 15,
            backgroundColor: 'transparent',
            marginTop: 0,
            left: -5,
          }}
          keyboardType="number-pad"
          theme={{
            colors: {
              primary: props.colors.primaryColor,
              placeholder: props.colors.textLight,
              text: props.colors.textColor,
            },
          }}
          onChangeText={(text) => setText(text)}
        />

        <Button
          icon="magnify"
          mode="contained"
          style={{
            marginLeft: 20,
            backgroundColor: props.colors.primaryColor,
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
          onPress={() =>
            navigation.navigate('Search', {
              screen: 'Index',
              baNo: text,
              type: type,
              unit: unit,
              title: 'Filter Records',
            })
          }>
          Search
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  textStyle: {
    fontSize: 24,
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default Segment;
