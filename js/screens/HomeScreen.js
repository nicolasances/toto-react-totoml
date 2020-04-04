import moment from 'moment';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from 'TotoML/js/services/TotoMLRegistryAPI';
import TotoFlatList from 'TotoML/js/totocomp/TotoFlatList';

export default class HomeScreen extends Component {

  // Define the Navigation options
  static navigationOptions = ({ navigation }) => {

    return {
      headerLeft: null,
      headerTitle: <TRC.TotoTitleBar
        title='Model Registry'
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

    this.props.navigation.navigate('ModelDetail', { modelName: item.item.name })

  }

  /**
   * Extracts the data for the TotoFlatList
   */
  modelDataExtractor(item) {

    let championDays = moment.duration(moment().diff(item.item.date)).days();

    let rightSideImageStack;
    if (item.item.deltas) {

      // Check who is winning: the champion of the retrained
      let champWins = 0;
      let retrainedWins = 0;
      for (var i = 0; i < item.item.deltas.length; i++) {

        let delta = item.item.deltas[i];

        if (delta.delta > 0) retrainedWins++;
        else champWins++;
      }

      let normalSize = 24;
      let smallSize = 12;

      rightSideImageStack = [
        { image: require('TotoML/img/fight.png'), size: champWins >= retrainedWins ? smallSize : normalSize },
        { image: require('TotoML/img/trophy.png'), size: champWins >= retrainedWins ? normalSize : smallSize },
      ]
    }

    return {
      title: item.item.name,
      avatar: {
        type: 'number',
        value: item.item.version
      },
      leftSideValue: {
        type: 'duration',
        value: championDays,
        unit: 'days'
      },
      rightSideImageStack: rightSideImageStack
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
