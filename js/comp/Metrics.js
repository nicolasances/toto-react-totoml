import React, { Component } from 'react';
import { Text, View, StyleSheet, Image} from 'react-native';
import TRC from 'toto-react-components';

/**
 * Shows a model's metrics
 * 
 * Parameters: 
 * 
 * - label              : mandatory, the label to put in front of the metrics
 * 
 * - metrics            : mandatory, an array [] of metric objects
 *                        each metric is {
 *                          name    : name of the metric
 *                          value   : value of the metrics
 *                        }
 * 
 * - image              : mandatory, the image to represent the metrics (e.g. champion image, etc...)
 * 
 * - imageColor         : optional (default: accent), the color of the image 
 * 
 * - percentages        : optional (default: false), specifies if the metrics are percentages => will multiply by 100
 * 
 * - showMetricLabels   : optioanl (default: true), specifies whether to show the metrics labels
 */
export default class Metrics extends Component {

    constructor(props) {
        super(props);

        this.state = {}
    }

    render() {

        let metricsComponents = [];
        if (this.props.metrics) {

            for (var i = 0; i < this.props.metrics.length; i++) {

                let metric = this.props.metrics[i];
                let key = Math.floor(Math.random() * 100) + '-' + metric.name;

                let value = metric.value;
                if (this.props.percentages) value = (value * 100).toFixed(2)

                let label;
                if (this.props.showMetricLabels == null || this.props.showMetricLabels) label = (
                    <Text style={styles.metricLabel}>{metric.name}</Text>
                )

                let metricComp = (
                    <View style={styles.metricContainer} key={key}>
                        {label}
                        <View style={styles.metricValueContainer}>
                            <Text style={styles.metricValue}>{value}</Text>
                        </View>
                    </View>
                )
                
                metricsComponents.push(metricComp);
            }
        }

        let imageColor = {tintColor: TRC.TotoTheme.theme.COLOR_ACCENT_LIGHT}
        if (this.props.imageColor) imageColor = {tintColor: this.props.imageColor};
        
        return (
            <View style={styles.container}>
                <View style={styles.labelContainer}>
                    <Image source={this.props.image} style={[styles.labelImg, imageColor]} />
                </View>
                <View style={styles.metricsContainer}>
                    {metricsComponents}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        marginVertical: 8,
    },
    labelContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 48,
    },
    labelImg: {
        width: 24, 
        height: 24,
    },
    metricsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metricContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 8,
        color: TRC.TotoTheme.theme.COLOR_TEXT_LIGHT,
        marginBottom: 6,
    }, 
    metricValueContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 16,
        color: TRC.TotoTheme.theme.COLOR_TEXT_LIGHT,
    },
})