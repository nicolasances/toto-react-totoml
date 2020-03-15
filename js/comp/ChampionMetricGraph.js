import React, { Component } from 'react';
import { Text, View, StyleSheet, Image} from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from 'TotoML/js/services/TotoMLRegistryAPI';
import TotoLineChart from 'TotoML/js/totocomp/TotoLineChart';
import * as array from 'd3-array';

const lineColors = [
    "#005662", "#cabf45", "#ffffa8", "#cabf45"
]

const d3 = {array};

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
    }

    componentDidMount() {
        // Load the historical metrics
        this.loadMetrics();
    }

    /**
     * Loads the historical metrics
     */
    loadMetrics() {

        new TotoMLRegistryAPI().getChampionHistoricalMetrics(this.props.modelName).then((data) => {
            this.prepareData(data);
        })
    }

    /**
     * Prepares the data for the line chart visualization
     */
    prepareData(data) {

        if (!data || !data.metrics || data.metrics.length == 0) return;

        metrics = []

        days = data.metrics;
        numDays = data.metrics.length;
        numMetrics = data.metrics[0].metrics.length;

        // For each type of metric, create the data for a single line
        // because the lines are per metric type 
        for (var m = 0; m < numMetrics; m++) {

            metricDays = []

            for (var d = 0; d < numDays; d++) {

                metricDays.push({
                    x: d, 
                    y: data.metrics[d].metrics[m].value * 100
                })

            }

            metrics.push(metricDays);
        }


        // Define the minimum y value for the visualization: 
        // We'll define the minimum y as the actual min value found in the array, minus the delta between the max and the min (capped to 0)
        minYMetrics = d3.array.min(metrics, (d) => {return d3.array.min(d, (di) => {return di.y})});
        minYMetrics -= d3.array.max(metrics, (d) => {return d3.array.max(d, (di) => {return di.y})}) - minYMetrics;
        if (minYMetrics < 0) minYMetrics = 0;

        // Define the colors of each line
        colors = []
        for (var m = 0; m < metrics.length; m++) {
            if (m < lineColors.length) colors.push(lineColors[m]);
            else colors.push(lineColors[0]);
        }

        this.setState({
            metrics: metrics, 
            minYMetrics: minYMetrics,
            lineColors: colors
        })
    }

    /**
     * Creates the label of the value
     * @param {string} value the value
     * @param {int} i the index of the value
     */
    valueLabelTransform(value, i) {

        let superMin = d3.array.min(metrics, (d) => {return d3.array.min(d, (di) => {return di.y})});
        let superMax = d3.array.max(metrics, (d) => {return d3.array.max(d, (di) => {return di.y})});

        if (value == superMin || value == superMax) {
            return value.toFixed(2);
        }

        return '';
    }

    render() {
        return (
            <View style={styles.container}>

                <TotoLineChart 
                    dataMultiLines={this.state.metrics}
                    minYValue={this.state.minYMetrics}
                    valueLabelTransform={this.valueLabelTransform}
                    curveCardinal={false}
                    multiLinesColors={this.state.lineColors}
                    />
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        paddingTop: 32
    },
})