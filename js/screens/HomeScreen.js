import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from 'TotoML/js/services/TotoMLRegistryAPI';
import TotoFlatList from 'TotoML/js/totocomp/TotoFlatList';

export default class HomeScreen extends Component {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {

    return {
      headerLeft: null,
      headerTitle: <TRC.TotoTitleBar
                      title='Toto ML Models'
                      color={TRC.TotoTheme.theme.COLOR_THEME}
                      titleColor={TRC.TotoTheme.theme.COLOR_TEXT}
                      />, 
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      models: null
    }

    // Binding 
    this.modelDataExtractor = this.modelDataExtractor.bind(this);
    this.loadModels = this.loadModels.bind(this);
    this.onModelPress = this.onModelPress.bind(this);
  }

  componentDidMount() {
    // Load the data
    this.loadModels()
  }

  componentWillUnmount() {
  }

  /**
   * Load the models from Toto ML Registry
   */
  loadModels() {

    new TotoMLRegistryAPI().getModels().then((data) => {

      this.setState({
        models: data.models
      })
    })

  }

  /**
   * When a model is pressed in the list
   */
  onModelPress(item) {

    this.props.navigation.navigate('ModelDetail', {modelName: item.item.name})

  }

  /**
   * Extracts the data for the TotoFlatList
   */
  modelDataExtractor(item) {

    return {
      title: item.item.name,
      avatar: {
        type: 'number', 
        value: item.item.version
      }, 
      leftSideValue: {
        type: 'date',
        value: item.item.date
      }
    }

  }

  render() {

    return (
      <View style={styles.container}>

        <TotoFlatList 
          data={this.state.models}
          dataExtractor={this.modelDataExtractor}
          onItemPress={this.onModelPress}
          />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: TRC.TotoTheme.theme.COLOR_THEME,
    paddingTop: 86,
  },
});
