import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from 'TotoML/js/services/TotoMLRegistryAPI';
import VersionContainer from '../comp/VersionContainer';
import Metrics from '../comp/Metrics';
import ChampionMetricGraph from '../comp/ChampionMetricGraph';

export default class ModelDetailScreen extends Component {

  // Define the Navigation options
  static navigationOptions = ({navigation}) => {

    return {
      headerLeft: null,
      headerTitle: <TRC.TotoTitleBar
                      title={navigation.getParam('model').name}
                      color={TRC.TotoTheme.theme.COLOR_THEME}
                      titleColor={TRC.TotoTheme.theme.COLOR_TEXT}
                      back={true}
                      />, 
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      model: this.props.navigation.getParam('model')
    }

    // Binding 
  }

  componentDidMount() {
    // Load the retrained model
    new TotoMLRegistryAPI().getRetrainedModel(this.props.navigation.getParam('model').name).then((data) => {
      this.setState({
        retrainedModel: data
      })
    })
  }

  componentWillUnmount() {
  }

  render() {

    let retrainedMetrics;
    if (this.state.retrainedModel && this.state.retrainedModel.metrics) retrainedMetrics = (
      <Metrics label='Retrained' metrics={this.state.retrainedModel.metrics} percentages={true} showMetricLabels={false} image={require('TotoML/img/fight.png')} imageColor={TRC.TotoTheme.theme.COLOR_THEME_LIGHT} />
    )

    return (
      <View style={styles.container}>

        <View style={styles.headerArea}>
          <View style={{flex: 1}}></View>
          <View style={{flex: 1, alignItems: 'center'}}><VersionContainer version={this.state.model.version} /></View>
          <View style={{flex: 1}}></View>
        </View>

        <View style={styles.metricsArea}>
          <Metrics label='Champion' metrics={this.state.model.metrics} percentages={true} image={require('TotoML/img/trophy.png')} />
          {retrainedMetrics}
        </View>

        <View style={styles.graphArea}>
          <ChampionMetricGraph modelName={this.state.model.name} />
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: TRC.TotoTheme.theme.COLOR_THEME,
    paddingTop: 86,
  },
  headerArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsArea: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 30,
    paddingVertical: 12,
    backgroundColor: TRC.TotoTheme.theme.COLOR_THEME_DARK
  },
  graphArea: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 24,
  }
});
