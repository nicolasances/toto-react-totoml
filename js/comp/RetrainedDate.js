import moment from 'moment';
import React, { Component } from 'react';
import { Text, View, StyleSheet, Image} from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from '../services/TotoMLRegistryAPI';

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

        this.state = {}

        this.loadRetrainedModel = this.loadRetrainedModel.bind(this);
    }

    componentDidMount() {
        this.loadRetrainedModel()
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
        if (this.state.retrainedModel) {
            
            let retrainedDate;
            if (this.state.retrainedModel.time) retrainedDate = moment(this.state.retrainedModel.date + '' + this.state.retrainedModel.time, 'YYYYMMDDHH:mm');
            else retrainedDate = moment(this.state.retrainedModel.date, 'YYYYMMDD');
            
            humanizedDate = moment.duration(moment().diff(retrainedDate)).humanize() + ' ago';
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
                    <Text style={styles.date}>{humanizedDate}</Text>
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
        textTransform: "uppercase"
    }
})