import React, {Component} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import TRC from 'toto-react-components';
import * as config from '../Config';
import TotoMLRegistryAPI from 'TotoML/js/services/TotoMLRegistryAPI';
import VersionContainer from '../comp/VersionContainer';
import ChampionMetricGraph from '../comp/ChampionMetricGraph';
import RetrainedModelInfo from '../comp/RetrainedModelInfo';
import ChampionModelInfo from '../comp/ChampionModelInfo';
import Swiper from 'react-native-swiper';
import {trainingUtil} from '../util/TrainingUtil';

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
                      rightButton={{
                        image: require('TotoML/img/settings.png')
                      }}
                      />, 
    }
  }

  constructor(props) {
    super(props);

    model = this.props.navigation.getParam('model');

    this.state = {
      model: model,
      currentPage: 0, 
      training: trainingUtil.isModelTraining(model.name)
    }

    // Binding 
    this.generateMetricsGraphs = this.generateMetricsGraphs.bind(this);
    this.retrainedOutperformsChampion = this.retrainedOutperformsChampion.bind(this);
    this.retrain = this.retrain.bind(this);
    this.onTrainingEnded = this.onTrainingEnded.bind(this);
    this.onTrainingStarted = this.onTrainingStarted.bind(this);
    this.onModelPromoted = this.onModelPromoted.bind(this);
    this.promote = this.promote.bind(this);
    this.reloadModel = this.reloadModel.bind(this);
  }

  componentDidMount() {
    // Load the retrained model
    new TotoMLRegistryAPI().getRetrainedModel(this.props.navigation.getParam('model').name).then((data) => {
      this.setState({
        retrainedModel: data
      })
    })

    // Listen to events
    TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingStarted, this.onTrainingStarted)
    TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
    TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.modelPromoted, this.onModelPromoted)
  }
    
  componentWillUnmount() {
      // Remove event listeners
      TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.trainingStarted, this.onTrainingStarted)
      TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
      TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.modelPromoted, this.onModelPromoted)
  }

  onTrainingEnded(event) {
    if (event.context.modelName == this.state.model.name) this.setState({training: false});
  }
  onTrainingStarted(event) {
    if (event.context.modelName == this.state.model.name) this.setState({training: true});
  }
  onModelPromoted(event) {
    if (event.context.modelName == this.state.model.name) this.reloadModel();
  }
  
  /**
   * Reloads the model
   */
  reloadModel() {
    new TotoMLRegistryAPI().getModel(this.state.model.name).then((data) => {
      this.setState({model: data})
    })
  }

  /**
   * Retrraing the Champion Model
   */
  retrain() {
    trainingUtil.retrain(this.state.model.name);
  }

  /**
   * Promotes the model
   */
  promote() {
    
    new TotoMLRegistryAPI().promoteModel(this.state.model.name).then((data) => {
      
      // Publish an event 
      TRC.TotoEventBus.bus.publishEvent({name: config.EVENTS.modelPromoted, context: {modelName: this.state.model.name}})
      
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
        </View>
      )

      metricGraphs.push(metricGraph);
    }

    return (
      <Swiper style={{}} loop={false} showsPagination={false} onIndexChanged={(i) => {this.setState({currentPage: i})}}>
        {metricGraphs}
      </Swiper>
    );

  }

  /**
   * Checks whether the Retrained Model (if any) outperforms
   * the Champion Model
   * ...which means is better at the most metrics
   */
  retrainedOutperformsChampion() {

    if (!this.state.retrainedModel || !this.state.retrainedModel.metrics || this.state.retrainedModel.metrics.length == 0) return false;
    if (!this.state.model.metrics || this.state.model.metrics.length == 0) return false;

    let retrainedCount = 0; 
    let championCount = 0;

    let champion = this.state.model;
    let retrained = this.state.retrainedModel;

    for (var i = 0; i < champion.metrics.length; i++) {

      if (champion.metrics[i].value >= retrained.metrics[i].value) championCount++;
      else retrainedCount++;

    }

    return retrainedCount > championCount;

  }

  /**
   * Tracker for the paging of the metrics (swiper)
   */
  buildPager() {
    
    if (!this.state.model.metrics || this.state.model.metrics.length == 0) return;

    let pager = []; 
    for (var i = 0; i < this.state.model.metrics.length; i++) {

      // Styles
      let pageStyles = [styles.pageButton];
      if (this.state.currentPage == i) pageStyles.push(styles.pageSelected);

      let page = (
        <View key={"key-tracker-" + i} style={pageStyles}>
        </View>
      )

      pager.push(page);
    }

    return (
      <View style={styles.pagerContainer}>
        {pager}
      </View>
    );
  }

  render() {

    // Generate 1 metric graph for each metric
    let metricGraphs = this.generateMetricsGraphs()

    // Check which is stronger: retrained or champion?
    let championSize = {width: 32, height: 32};
    let retrainedSize = {width: 32, height: 32};
    if (this.retrainedOutperformsChampion()) championSize = {width: 18, height: 18};
    else retrainedSize = {width: 18, height: 18};

    // Tracker for the pages
    let pager = this.buildPager();

    return (
      <View style={styles.container}>

        <View style={styles.headerArea}>
          <View style={{flex: 1}}>
            <RetrainedModelInfo model={this.state.model} />
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <VersionContainer version={this.state.model.version} />
          </View>
          <View style={{flex: 1}}>
            <ChampionModelInfo model={this.state.model} />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <View style={{flex: 1}}>
          </View>
          <View style={styles.retrainModelContainer}>
            <TRC.TotoIconButton image={require('TotoML/img/fight.png')} label="Retrain" onPress={this.retrain} disabled={this.state.training}  />
            <TRC.TotoIconButton image={require('TotoML/img/score.png')} label="Rescore" />
          </View>
          <View style={{flex: 1}}></View>
        </View>

        <View style={styles.graphArea}>
          
          {metricGraphs}

          <View style={styles.graphBottomContainer}>
            <View style={styles.promoteIconsContainer}>
              <Image source={require('TotoML/img/fight.png')} style={[retrainedSize, {marginRight: 9}, styles.promoteChmpVsRetImg]} />
              <Image source={require('TotoML/img/trophy.png')} style={[championSize, styles.promoteChmpVsRetImg]} />
            </View>
            <View style={styles.graphLabelContainer}>
              <Text style={styles.graphMetricName}>{this.state.model.metrics[this.state.currentPage].name}</Text>
              {pager}
            </View>
            <View style={styles.promoteButtonContainer}>
              <TRC.TotoIconButton image={require('TotoML/img/promote.png')} size='ms' onPress={this.promote} />
            </View>
          </View>

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
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 24,
    marginBottom: 24,
  },
  retrainModelContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /*
   * PROMOTE CONTAINER
   */
  promoteIconsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoteChmpVsRetImg: {
    tintColor: TRC.TotoTheme.theme.COLOR_THEME_LIGHT,
  },
  promoteButtonContainer: {
    flex: 1, 
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  pagerContainer: {
    flexDirection: 'row',
    marginTop: 6
  },
  pageButton: {
    width: 8, 
    height: 8,
    borderRadius: 4, 
    marginHorizontal: 3,
    opacity: 0.5,
    backgroundColor: TRC.TotoTheme.theme.COLOR_THEME
  },
  pageSelected: {
    backgroundColor: TRC.TotoTheme.theme.COLOR_ACCENT,
    opacity: 0.8,
  },

  /*
   * GRAPH AREA
   */
  graphArea: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: TRC.TotoTheme.theme.COLOR_THEME_DARK
  },
  graphContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  graphBottomContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  graphLabelContainer: {
    flex: 1, 
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphMetricName: {
    fontSize: 16,
    color: TRC.TotoTheme.theme.COLOR_TEXT,
    textTransform: "uppercase"
  },
});
