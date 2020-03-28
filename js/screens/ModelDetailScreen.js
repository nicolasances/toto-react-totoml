import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from 'TotoML/js/services/TotoMLRegistryAPI';
import VersionContainer from '../comp/VersionContainer';
import Metrics from '../comp/Metrics';
import ChampionMetricGraph from '../comp/ChampionMetricGraph';
import RetrainedDate from '../comp/RetrainedDate';
import Swiper from 'react-native-swiper';

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
    this.generateMetricsGraphs = this.generateMetricsGraphs.bind(this);
  }

  componentDidMount() {
    // Load the retrained model
    new TotoMLRegistryAPI().getRetrainedModel(this.props.navigation.getParam('model').name).then((data) => {
      this.setState({
        retrainedModel: data
      })
    })
  }

  /**
   * Generate the graphs with the metrics and the comparison 
   * between champion metric and retrained metric
   */
  generateMetricsGraphs() {

    if (!this.state.model.metrics) return;

    let metricGraphs = []

    for (var i = 0; i < this.state.model.metrics.length; i++) {
      
      let metricGraph = (
        <View key={'metricgraph-' + i} style={styles.graphContainer}>
          <ChampionMetricGraph modelName={this.state.model.name} metricName={this.state.model.metrics[i].name}/>
          <View style={styles.graphLabelContainer}>
            <Text style={styles.graphMetricName}>{this.state.model.metrics[i].name}</Text>
            <Text style={styles.graphMetricValue}>Current value: {this.state.model.metrics[i].value}</Text>
          </View>
        </View>
      )

      metricGraphs.push(metricGraph);
    }

    return metricGraphs;

  }

  render() {

    // Generate 1 metric graph for each metric
    let metricGraphs = this.generateMetricsGraphs()

    return (
      <View style={styles.container}>

        <View style={styles.headerArea}>
          <View style={{alignItems: 'flex-start', paddingLeft: 24}}><VersionContainer version={this.state.model.version} /></View>
          <View style={{flex: 1}}>
            <View style={styles.retrainedDateContainer}><RetrainedDate model={this.state.model} /></View>
          </View>
        </View>

        <View style={styles.buttonsArea}>
          <View style={{flex: 1}}></View>
          <View style={styles.buttonsContainer}>
            <TRC.TotoIconButton image={require('TotoML/img/fight.png')} label="Retrain" />
            <TRC.TotoIconButton image={require('TotoML/img/trophy.png')} label="Promote"/>
          </View>
          <View style={{flex: 1}}></View>
        </View>

        <View style={styles.graphArea}>
          <Swiper style={{}} showsPagination={false}>
              {metricGraphs}
          </Swiper>
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
  buttonsArea: {
    flexDirection: 'row',
    marginTop: 32,
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  graphArea: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: TRC.TotoTheme.theme.COLOR_THEME_DARK
  },
  retrainedDateContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 24
  },
  graphContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  graphLabelContainer: {
    flexDirection: 'column',
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  graphMetricName: {
    fontSize: 16,
    color: TRC.TotoTheme.theme.COLOR_TEXT,
    textTransform: "uppercase"
  },
  graphMetricValue: {
    fontSize: 10,
    color: TRC.TotoTheme.theme.COLOR_TEXT,
    textTransform: "capitalize",
    marginTop: 3
  }
});
