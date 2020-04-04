import React, {Component} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, Image, View} from 'react-native';
import { withNavigation } from 'react-navigation';
import TRC from 'toto-react-components';
import moment from 'moment';

/**
 * Flat List styled for toto.
 * To use this you must provide:
 *  - data                  : the dataset as an [] of objects
 *  - dataExtractor()       : a function that takes the flat list item and extract the following data structure:
 *                            { title :          the title, main text, of this item,
 *                              avatar :         an object describing the avatar:
 *                                              { type: 'number, image'
 *                                                value: (optional) 'a value, in case of type number, an image in case of type image'
 *                                                unit: (optional) 'the unit, in case of type number'
 *                                              }
 *                              sign :          an image to put as a "sign" (e.g. info sign to show that this item has info attached)
 *                                              should be a loaded image, (provided as require(..), so already loaded)
 *                              signSize :      (optional, default 'm'), size of the sign. Could be 'm' (default), 'l', 'xl'
 *                              onSignClick:    an action to be performed when clicking on the sign
 *                                              must be a function(item)
 *                              leftSideValue:  a value to put on the left side of the title, after the avatar (e.g. the date of an expense)
 *                                              should be an object
 *                                              { type: 'date' | 'duration'
 *                                                value: the value. If 'date' => 'YYYYMMDD'
 *                                                unit: the unit (optional). If 'duration' could be 'days' ...
 *                                              }
 *                              rightSideValue: a formatted value to put on the right-most side of the line (e.g. amount in an expenses list), 
 *                              leftSideSign :  an image to put as a "sign" (e.g. info sign to show that this item has info attached)
 *                                              should be a loaded image, (provided as require(..), so already loaded)
 *                            }
 *  - onItemPress()         : a function to be called when the item is pressed
 *  - avatarImageLoader()   : a function(item) that will have to load the avatar image and return a loaded <Image />
 */
export default class TotoFlatList extends Component {

  constructor(props) {
    super(props);
  }

  /**
   * Renders the toto flat list
   */
  render() {

    return (
      <FlatList
        data={this.props.data}
        renderItem={(item) => <Item item={item} avatarImageLoader={this.props.avatarImageLoader} dataExtractor={this.props.dataExtractor} onItemPress={this.props.onItemPress}/>}
        keyExtractor={(item, index) => {return 'toto-flat-list-' + index}}
        />
    )
  }

}

/**
 * Item of the Toto Flat list
 */
class Item extends Component {

  constructor(props) {
    super(props);

    // Initialize the state with the provided item
    this.state = this.props.item;

    // Bind this
    this.onDataChanged = this.onDataChanged.bind(this);
  }

  componentDidMount() {
    // Subscribe to data changed events
    TRC.TotoEventBus.bus.subscribeToEvent('totoListDataChanged', this.onDataChanged);
  }

  componentWillUnmount() {
    // Unsubscribe to data changed events
    TRC.TotoEventBus.bus.unsubscribeToEvent('totoListDataChanged', this.onDataChanged);
  }

  /**
   * React to a data change
   */
  onDataChanged(event) {
    if (this.state.item.id == event.context.item.id) {
      this.setState(event.context);
    }
  }

  render() {

    // The data to render
    var data = this.props.dataExtractor(this.state);

    // Define what avatar has to be rendered
    let avatar;

    // If there's an avatar
    if (data.avatar != null) {

      // If the avatar is a NUMBER
      if (data.avatar.type == 'number') {
        avatar = <Text style={styles.avatarText}>{data.avatar.value.toFixed(0)}</Text>
      }
      // If the avatar is an IMAGE
      else if (data.avatar.type == 'image') {
        // If there's a source:
        if (data.avatar.value) avatar = <Image source={data.avatar.value}  style={{width: 20, height: 20, tintColor: TRC.TotoTheme.theme.COLOR_TEXT}} />
        // If there's a configured image Loader
        else if (this.props.avatarImageLoader) {
          // Load the image
          avatar = this.props.avatarImageLoader(this.state);
        }
      }
      // For any other type of avatar, display nothing
      else {
        avatar = <Text></Text>
      }
    }
    // If there's no avatar, don't display anything
    else {
      avatar = <Text></Text>
    }

    // If there is a sign
    let sign;

    if (data.sign) {
      let signSizeStyle = data.signSize == 'xl' ? {width: 30, height: 30} : data.signSize == 'xl' ? {width: 24, height: 24} : {width: 18, height: 18};

      if (data.onSignClick) sign = (
        <TouchableOpacity style={styles.signContainer} onPress={() => {data.onSignClick(this.state)}}>
          <Image source={data.sign} style={[styles.sign, signSizeStyle]} />
        </TouchableOpacity>
      )
      else sign = (
        <View style={styles.signContainer}>
          <Image source={data.sign} style={[styles.sign, signSizeStyle]} />
        </View>
      )
    }

    // If there is a left sign
    let leftSign;

    if (data.leftSign) {
      let signSizeStyle = {width: 24, height: 24};

      leftSign = (
        <View style={styles.signContainer}>
          <Image source={data.leftSign} style={[styles.sign, signSizeStyle]} />
        </View>
      )
    }

    // Left side value
    let leftSideValue;
    if (data.leftSideValue) {
      if (data.leftSideValue.type == 'date') leftSideValue = (
        <View style={styles.leftSideValueContainer}>
          <Text style={styles.leftDateDay}>{moment(data.leftSideValue.value, 'YYYYMMDD').format('DD')}</Text>
          <Text style={styles.leftDateMonth}>{moment(data.leftSideValue.value, 'YYYYMMDD').format('MMM')}</Text>
        </View>
      )
      else if (data.leftSideValue.type == 'duration') leftSideValue = (
        <View style={styles.leftSideValueContainer}>
          <Text style={styles.leftDateDay}>{ data.leftSideValue.value }</Text>
          <Text style={styles.leftDateDuration}>{ data.leftSideValue.unit }</Text>
        </View>
      )
    }

    // Right side image stack
    let rightSideImageStackContainer; 
    if (data.rightSideImageStack) {

      rightSideImageStack = [];

      for (var i = 0; i < data.rightSideImageStack.length; i++) {

        let size = data.rightSideImageStack[i].size;
        
        let rsi = (
          <Image key={data.title + '-rsi-' + i} source={data.rightSideImageStack[i].image} style={[{width: size, height: size}, styles.rightSideImage]} />
        )

        rightSideImageStack.push(rsi);

      }

      rightSideImageStackContainer = (
        <View style={styles.rightSideImageStackContainer}>
          {rightSideImageStack}
        </View>
      )

    }

    return (
      <TouchableOpacity style={styles.item} onPress={() => {if (this.props.onItemPress) this.props.onItemPress(this.state)}}>

        <View style={styles.avatar}>
          {avatar}
        </View>

        {leftSideValue}

        {leftSign}

        <View style={styles.textContainer}>
          <Text style={{color: TRC.TotoTheme.theme.COLOR_TEXT}}>{data.title}</Text>
        </View>

        <View style={styles.rightSideValueContainer}>
          <Text style={styles.rightSideValue}>{data.rightSideValue}</Text>
        </View>

        {rightSideImageStackContainer}
        {sign}

      </TouchableOpacity>
    )
  }
}

/**
 * Style sheets used for the toto flat list
 */
const styles = StyleSheet.create({

  listContainer: {
    flex: 1
  },
  item: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    marginVertical: 6,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: TRC.TotoTheme.theme.COLOR_TEXT,
    justifyContent: 'center',
    alignItems: 'center',

  },
  avatarText: {
    fontSize: 12,
    color: TRC.TotoTheme.theme.COLOR_TEXT,
  },
  textContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  rightSideValueContainer: {
    justifyContent: 'center',
  },
  rightSideValue: {
    fontSize: 14,
    color: TRC.TotoTheme.theme.COLOR_TEXT
  },
  rightSideImageStackContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightSideImage: {
    tintColor: TRC.TotoTheme.theme.COLOR_TEXT,
    marginHorizontal: 3,
  },
  signContainer: {
    marginLeft: 12,
    justifyContent: 'center'
  },
  sign: {
    tintColor: TRC.TotoTheme.theme.COLOR_ACCENT_LIGHT
  },
  leftSideValueContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftDateDay: {
    fontSize: 16,
    color: TRC.TotoTheme.theme.COLOR_TEXT,
  },
  leftDateMonth: {
    fontSize: 10,
    color: TRC.TotoTheme.theme.COLOR_TEXT,
    textTransform: 'uppercase'
  },
  leftDateDuration: {
    fontSize: 8, 
    color: TRC.TotoTheme.theme.COLOR_TEXT,
    textTransform: 'uppercase'
  },
})
