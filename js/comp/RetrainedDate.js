import moment from 'moment';
import React, { Component } from 'react';
import { Text, View, StyleSheet, Image} from 'react-native';
import * as config from '../Config';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from '../services/TotoMLRegistryAPI';
import {trainingUtil} from '../util/TrainingUtil';

/**
 * Shows the last retrained date
 * 
 * Parameters
 * - model              : the champion model (object)
 * - showIcon           : (optional, default true). Pass false to hide the icon
 * - showLabel          : (optional, default true). Show or hide the label.
 */
export default class RetrainedDate extends Component {

    constructor(props) {
        super(props);

        this.state = {
            training: trainingUtil.isModelTraining(this.props.model.name)
        }

        this.loadRetrainedModel = this.loadRetrainedModel.bind(this);
        this.onTrainingEnded = this.onTrainingEnded.bind(this);
        this.onTrainingStarted = this.onTrainingStarted.bind(this);

    }

    componentDidMount() {
        // Load the retrained
        this.loadRetrainedModel()

        // Listen to events
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingStarted, this.onTrainingStarted)
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
    }
    
    componentWillUnmount() {
        // Remove event listeners
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.trainingStarted, this.onTrainingStarted)
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
    }

    /**
     * When the training started for this model
     */
    onTrainingStarted(event) {

        if (event.context.modelName == this.props.model.name) {
            this.setState({
                training: true
            })
        }
    } 

    /**
     * When the training ended for this model
     */
    onTrainingEnded(event) {

        if (event.context.modelName == this.props.model.name) {
            this.setState({
                training: false
            })
            this.loadRetrainedModel()
        }
    } 

    loadRetrainedModel() {
        new TotoMLRegistryAPI().getRetrainedModel(this.props.model.name).then((data) => {
            
            if (!data || !data.modelName) return;
            
            this.setState({
                retrainedModel: data
            })
        })
    }

    render() {

        let date = ''
        if (this.state.retrainedModel) date = moment(this.state.retrainedModel.date, 'YYYYMMDD').format('DD MMM YYYY');

        // Humanize the last retrained date
        let humanizedDate = '';
        let dateColor = {}
        if (this.state.retrainedModel) {
            
            let retrainedDate;
            if (this.state.retrainedModel.time) retrainedDate = moment(this.state.retrainedModel.date + '' + this.state.retrainedModel.time, 'YYYYMMDDHH:mm');
            else retrainedDate = moment(this.state.retrainedModel.date, 'YYYYMMDD');
            
            humanizedDate = moment.duration(moment().diff(retrainedDate)).humanize() + ' ago';
        }
        if (this.state.training) {
            humanizedDate = 'Training now...';
            dateColor = {color: TRC.TotoTheme.theme.COLOR_ACCENT}
        }

        let label;
        if (this.props.showLabel == null || this.props.showLabel) label = (
            <Text style={styles.label}>Mdoel retrained</Text>
        )

        // Icon
        let img;
        if (this.props.showIcon == null || this.props.showIcon) img = (
            <View style={styles.imgContainer}>
                <Image style={styles.img} source={require('TotoML/img/fight.png')} />
            </View>
        )

        return (
            <View style={styles.container}>
                {img}
                <View style={styles.textContainer}>
                    {label}
                    <Text style={[styles.date, dateColor]}>{humanizedDate}</Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
        justifyContent: 'flex-start',
    },
    imgContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    img: {
        width: 32,
        height: 32,
        tintColor: TRC.TotoTheme.theme.COLOR_TEXT,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    label: {
        fontSize: 8,
        color: TRC.TotoTheme.theme.COLOR_TEXT,
        textTransform: "uppercase"
    },
    date: {
        fontSize: 12,
        color: TRC.TotoTheme.theme.COLOR_TEXT,
        alignItems: 'center',
        textTransform: "uppercase",
        textAlign: 'center'
    }
})