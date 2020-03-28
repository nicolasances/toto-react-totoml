import moment from 'moment';
import React, { Component } from 'react';
import { Text, View, StyleSheet, Image} from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from '../services/TotoMLRegistryAPI';

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

        return (
            <View style={styles.container}>
                <View style={styles.imgContainer}>
                    <Image style={styles.img} source={require('TotoML/img/fight.png')} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.label}>Last retrained on</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        alignItems: 'flex-start'
    },
    label: {
        fontSize: 6,
        color: TRC.TotoTheme.theme.COLOR_TEXT,
        textTransform: "uppercase"
    },
    date: {
        fontSize: 18,
        color: TRC.TotoTheme.theme.COLOR_TEXT
    }
})