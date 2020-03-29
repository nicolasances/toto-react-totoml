import moment from 'moment';
import React, { Component } from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from 'TotoML/js/services/TotoMLRegistryAPI';
import TotoLineChart from 'TotoML/js/totocomp/TotoLineChart';
import * as array from 'd3-array';
import * as config from '../Config';

const lineColors = [
    "#005662", "#cabf45", "#ffffa8", "#cabf45"
]

const d3 = { array };

/**
 * Shows the graph with the historical metrics of the model
 * 
 * Parameters:
 * 
 * - modelName      : the name of the model
 */
export default class ChampionMetricGraph extends Component {

    constructor(props) {
        super(props);

        this.state = {}

        // Bindings
        this.loadMetrics = this.loadMetrics.bind(this);
        this.prepareData = this.prepareData.bind(this);
        this.valueLabelTransform = this.valueLabelTransform.bind(this);
        this.xLabel = this.xLabel.bind(this);
        this.onTrainingEnded = this.onTrainingEnded.bind(this);
        this.onPromotionEnded = this.onPromotionEnded.bind(this);
    }

    componentDidMount() {
        // Load the historical metrics
        this.loadMetrics();

        // Listen to events
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.promotionEnded, this.onPromotionEnded)
    }

    componentWillUnmount() {
        // Remove event listeners
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.promotionEnded, this.onPromotionEnded)
    }

    onTrainingEnded(event) {
        if (event.context.modelName == this.props.modelName) this.loadMetrics();
    }
    onPromotionEnded(event) {
        if (event.context.modelName == this.props.modelName) this.loadMetrics();
    }

    /**
     * Loads the historical metrics
     */
    loadMetrics() {

        new TotoMLRegistryAPI().getChampionHistoricalMetrics(this.props.modelName).then((data) => {

            if (!data && !data.metrics) return;

            this.setState({
                historicalMetrics: data.metrics
            }, () => {
                new TotoMLRegistryAPI().getRetrainedModel(this.props.modelName).then((data) => {

                    this.setState({
                        retrainedModelMetrics: (!data || !data.metrics) ? null : data.metrics
                    }, this.prepareData)
                })
            })
        })
    }

    /**
     * Prepares the data for the line chart visualization
     */
    prepareData() {

        if (!this.state || !this.state.historicalMetrics || this.state.historicalMetrics.length == 0) return;

        let metrics = []

        let days = this.state.historicalMetrics;
        let numDays = this.state.historicalMetrics.length;
        let numMetrics = this.state.historicalMetrics[0].metrics.length;

        let targetMetric = this.props.metricName;

        let metricDays = [];

        // For the selected type of metric, create the data for a single line
        // because the lines are per metric type 
        for (var m = 0; m < numMetrics; m++) {

            if (days[0].metrics[m].name != targetMetric) continue;

            for (var d = 0; d < numDays; d++) {

                metricDays.push({
                    x: d,
                    y: days[d].metrics[m].value * 100
                })
            }
        }

        // Now let's define the line for the retrained model value
        let yLines = []
        if (this.state.retrainedModelMetrics) {

            for (var m = 0; m < this.state.retrainedModelMetrics.length; m++) {

                rmMetric = this.state.retrainedModelMetrics[m];

                if (rmMetric.name != this.props.metricName) continue;

                yLines.push(rmMetric.value * 100)
            }
        }

        let minYValue = d3.array.min(metricDays, (d) => { return d.y })
        let maxYValue = d3.array.max(metricDays, (d) => { return d.y })

        if (yLines.length > 0) {
            if (minYValue > yLines[0]) minYValue = yLines[0];
            if (maxYValue < yLines[0]) maxYValue = yLines[0];
        }

        let delta = maxYValue - minYValue;

        this.setState({
            metrics: metricDays,
            minYValue: minYValue - delta / 5,
            maxYValue: maxYValue + delta / 5,
            yLines: yLines
        })
    }

    /**
     * Creates the label of the value
     * @param {string} value the value
     * @param {int} i the index of the value
     */
    valueLabelTransform(value, i) {

        if (i == this.state.metrics.length - 1) return value.toFixed(2);

        return '';
    }

    /**
     * Formats the x label
     * @param {string} value in this case the value is an index
     */
    xLabel(value) {

        if (!this.state.historicalMetrics || this.state.historicalMetrics.length == 0) return '';

        let date = this.state.historicalMetrics[value].date;

        return moment(date, 'YYYYMMDD').format('DD MMM');
    }

    render() {
        return (
            <View style={styles.container}>

                <TotoLineChart
                    data={this.state.metrics}
                    valueLabelTransform={this.valueLabelTransform}
                    curveCardinal={false}
                    minYValue={this.state.minYValue}
                    maxYValue={this.state.maxYValue}
                    yLines={this.state.yLines}
                    yLinesColor={TRC.TotoTheme.theme.COLOR_THEME}
                    yLinesNumberLocale='en'
                    yLinesLabelColor={TRC.TotoTheme.theme.COLOR_TEXT_LIGHT}
                    yLinesLabelFontSize={10}
                    yLinesMarginHorizontal={12}
                    yLinesDashed={true}
                    yLinesIcons={[require('TotoML/img/fight.png')]}
                    valuePointsBackground={TRC.TotoTheme.theme.COLOR_THEME_DARK}
                    showValuePoints={this.state.metrics && this.state.metrics.length < 10}
                    showFirstAndLastVP={true}
                    xAxisTransform={this.xLabel}
                    xLabelPosition='top'
                    xLabelLines={true}
                />

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        paddingTop: 12,
    },
})