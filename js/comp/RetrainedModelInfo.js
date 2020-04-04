import moment from 'moment';
import React, { Component } from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from '../services/TotoMLRegistryAPI';
import { trainingUtil } from '../util/TrainingUtil';
import * as config from '../Config';

export default class RetrainedModelInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            training: trainingUtil.isModelTraining(this.props.modelName)
        }

        this.loadRetrainedModel = this.loadRetrainedModel.bind(this);
        this.onTrainingEnded = this.onTrainingEnded.bind(this);
        this.onTrainingStarted = this.onTrainingStarted.bind(this);
        this.onPromotionEnded = this.onPromotionEnded.bind(this);
    }

    componentDidMount() {
        // Load the retrained
        this.loadRetrainedModel()

        // Listen to events
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingStarted, this.onTrainingStarted)
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.promotionEnded, this.onPromotionEnded)
    }

    componentWillUnmount() {
        // Remove event listeners
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.trainingStarted, this.onTrainingStarted)
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.promotionEnded, this.onPromotionEnded)
    }

    /**
     * When the training started for this model
     */
    onTrainingStarted(event) {

        if (event.context.modelName == this.props.modelName) {
            this.setState({
                training: true
            })
        }
    }

    /**
     * When the training ended for this model
     */
    onTrainingEnded(event) {

        if (event.context.modelName == this.props.modelName) {
            this.setState({
                training: false
            })
            this.loadRetrainedModel()
        }
    }

    /**
     * When the promotion has ended, reload
     */
    onPromotionEnded(event) {
        if (event.context.modelName == this.props.modelName) this.loadRetrainedModel();
    }

    loadRetrainedModel() {

        new TotoMLRegistryAPI().getRetrainedModel(this.props.modelName).then((data) => {

            this.setState({
                retrainedModel: data && data.modelName ? data : null
            })
        })
    }

    render() {

        let date = ''
        if (this.state.retrainedModel) date = moment(this.state.retrainedModel.date, 'YYYYMMDD').format('DD MMM YYYY');

        // Humanize the last retrained date
        let humanizedDate = '';
        let dateColor = {};
        let imgColor = {};
        if (this.state.retrainedModel) {

            let retrainedDate;
            if (this.state.retrainedModel.time) retrainedDate = moment(this.state.retrainedModel.date + '' + this.state.retrainedModel.time, 'YYYYMMDDHH:mm');
            else retrainedDate = moment(this.state.retrainedModel.date, 'YYYYMMDD');

            humanizedDate = moment.duration(moment().diff(retrainedDate)).humanize() + ' ago';
        }
        else humanizedDate = 'None';

        // In case the model is training, change some colors
        if (this.state.training) {
            humanizedDate = 'Training now...';
            dateColor = { color: TRC.TotoTheme.theme.COLOR_ACCENT }
            imgColor = { tintColor: TRC.TotoTheme.theme.COLOR_ACCENT }
        }

        return (
            <View style={styles.container}>
                <Text style={styles.modelLabel}>Retrained</Text>
                <Image source={require('TotoML/img/fight.png')} style={[styles.modelImage, imgColor]} />
                <View style={styles.dateContainer}>
                    <Text style={[styles.date, dateColor]}>{humanizedDate}</Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modelImage: {
        width: 32,
        height: 32,
        tintColor: 'rgba(0,0,0,0.5)',
        marginBottom: 6,
    },
    modelLabel: {
        color: TRC.TotoTheme.theme.COLOR_TEXT,
        fontSize: 12,
        textTransform: "uppercase",
        marginBottom: 6,
    },

    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    date: {
        fontSize: 12,
        color: TRC.TotoTheme.theme.COLOR_TEXT,
        alignItems: 'center',
        textTransform: "uppercase",
        textAlign: 'center'
    }

})