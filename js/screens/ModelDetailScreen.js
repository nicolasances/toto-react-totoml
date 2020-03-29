import moment from 'moment';
import React, {Component} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from 'TotoML/js/services/TotoMLRegistryAPI';
import VersionContainer from '../comp/VersionContainer';
import Metrics from '../comp/Metrics';
import ChampionMetricGraph from '../comp/ChampionMetricGraph';
import RetrainedDate from '../comp/RetrainedDate';
import Swiper from 'react-native-swiper';
import { blob } from 'd3';

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

    championForHumanized = moment.duration(moment().diff(model.date)).humanize();

    this.state = {
      model: model,
      championFor: championForHumanized,
      currentPage: 0
    }

    // Binding 
    this.generateMetricsGraphs = this.generateMetricsGraphs.bind(this);
    this.retrainedOutperformsChampion = this.retrainedOutperformsChampion.bind(this);
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
          </View>
        </View>
      )

      metricGraphs.push(metricGraph);
    }

    return metricGraphs;

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

      let pageStyles = [styles.pageButton];
      
      if (this.state.currentPage == i) pageStyles.push(styles.pageSelected);

      let page = (
        <View key={"key-tracker-" + i} style={pageStyles}>
        </View>
      )

      pager.push(page);

    }

    return pager;
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
          <View style={styles.retrainedModelContainer}>
            <Text style={styles.modelLabel}>Retrained</Text>
            <Image source={require('TotoML/img/fight.png')} style={styles.modelImage} />
            <RetrainedDate model={this.state.model} showIcon={false} showLabel={false} />
          </View>
          <View style={styles.versionContainer}>
            <VersionContainer version={this.state.model.version} />
          </View>
          <View style={styles.championModelContainer}>
            <Text style={styles.modelLabel}>Champion for</Text>
            <Image source={require('TotoML/img/trophy.png')} style={styles.modelImage} />
            <Text style={styles.modelValue}>{this.state.championFor}</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <View style={{flex: 1}}>
          </View>
          <View style={styles.retrainModelContainer}>
            <TRC.TotoIconButton image={require('TotoML/img/fight.png')} label="Retrain" />
            <TRC.TotoIconButton image={require('TotoML/img/score.png')} label="Rescore" />
          </View>
          <View style={{flex: 1}}></View>
        </View>

        <View style={styles.promoteContainer}>
          <View style={styles.promoteIconsContainer}>
            <Image source={require('TotoML/img/fight.png')} style={[retrainedSize, {marginRight: 9}, styles.promoteChmpVsRetImg]} />
            <Image source={require('TotoML/img/trophy.png')} style={[championSize, styles.promoteChmpVsRetImg]} />
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            {pager}
          </View>
          <View style={styles.promoteButtonContainer}>
            <TRC.TotoIconButton image={require('TotoML/img/promote.png')} label="Promote" size='ms' />
          </View>
        </View>

        <View style={styles.graphArea}>
          <Swiper style={{}} loop={false} showsPagination={false} onIndexChanged={(i) => {this.setState({currentPage: i})}}>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  versionContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  retrainedModelContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  championModelContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modelLabel: {
    color: TRC.TotoTheme.theme.COLOR_TEXT,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  modelValue: {
    color: TRC.TotoTheme.theme.COLOR_TEXT,
    fontSize: 12,
    textTransform: "uppercase",
  },
  modelImage: {
    width: 32, 
    height: 32,
    tintColor: 'rgba(0,0,0,0.5)',
    marginBottom: 6,
  },
  
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 24,
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
  promoteContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingTop: 20,
    backgroundColor: TRC.TotoTheme.theme.COLOR_THEME_DARK,
  },
  promoteIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 6,
  },
  promoteChmpVsRetImg: {
    tintColor: TRC.TotoTheme.theme.COLOR_THEME_LIGHT,
  },
  promoteButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  pageButton: {
    width: 10, 
    height: 10,
    borderRadius: 5, 
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
    flexDirection: 'row',
    backgroundColor: TRC.TotoTheme.theme.COLOR_THEME_DARK
  },
  graphContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  graphLabelContainer: {
    flexDirection: 'column',
    marginBottom: 24,
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
