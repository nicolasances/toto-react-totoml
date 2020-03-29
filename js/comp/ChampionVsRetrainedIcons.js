import React, { Component } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from '../services/TotoMLRegistryAPI';
import * as config from '../Config';

export default class ChampionVsRetrainedIcons extends Component {

    constructor(props) {
        super(props);

        this.bigSize = 32;
        this.smallSize = 18;

        this.state = {}

        // Bind
        this.retrainedOutperformsChampion = this.retrainedOutperformsChampion.bind(this);
        this.onTrainingEnded = this.onTrainingEnded.bind(this);
        this.onPromotionEnded = this.onPromotionEnded.bind(this);
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        this.load();

        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.promotionEnded, this.onPromotionEnded)
    }

    componentWillUnmount() {
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.promotionEnded, this.onPromotionEnded)
    }

    onTrainingEnded(event) {
        if (event.context.modelName == this.props.modelName) this.load();
    }
    onPromotionEnded(event) {
        if (event.context.modelName == this.props.modelName) this.load();
    }

    /**
     * Loads the model and the retrained model
     */
    load() {
        let modelName = this.props.modelName;

        new TotoMLRegistryAPI().getModel(modelName).then((data) => {this.setState({model: data})});
        new TotoMLRegistryAPI().getRetrainedModel(modelName).then((data) => {this.setState({retrainedModel: data})});
    }

    /**
     * Checks whether the Retrained Model (if any) outperforms
     * the Champion Model
     * ...which means is better at the most metrics
     */
    retrainedOutperformsChampion(model, retrainedModel) {

        defaultSizes = {championSize: this.smallSize, retrainedSize: this.smallSize}

        if (!retrainedModel || !retrainedModel.metrics || retrainedModel.metrics.length == 0) return defaultSizes;
        if (!model || !model.metrics || model.metrics.length == 0) return defaultSizes;
        
        let retrainedCount = 0;
        let championCount = 0;

        let champion = model;
        let retrained = retrainedModel;

        for (var i = 0; i < champion.metrics.length; i++) {

            if (champion.metrics[i].value >= retrained.metrics[i].value) championCount++;
            else retrainedCount++;

        }

        if (retrainedCount > championCount) {
            return {
                championSize: this.smallSize,
                retrainedSize: this.bigSize
            }
        }
        else {
            return {
                championSize: this.bigSize,
                retrainedSize: this.smallSize
            }
        }

    }
    render() {

        // Check which is stronger: retrained or champion?
        let sizes = this.retrainedOutperformsChampion(this.state.model, this.state.retrainedModel);
        let championSize = { width: sizes.championSize, height: sizes.championSize };
        let retrainedSize = { width: sizes.retrainedSize, height: sizes.retrainedSize };

        return (
            <View style={styles.container}>
                <Image source={require('TotoML/img/fight.png')} style={[retrainedSize, { marginRight: 9 }, styles.promoteChmpVsRetImg]} />
                <Image source={require('TotoML/img/trophy.png')} style={[championSize, styles.promoteChmpVsRetImg]} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    promoteChmpVsRetImg: {
        tintColor: TRC.TotoTheme.theme.COLOR_THEME_LIGHT,
    },

})