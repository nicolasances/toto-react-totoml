import React, { Component } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import moment from 'moment';
import TRC from 'toto-react-components';

export default class ChampionModelInfo extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        championForHumanized = this.props.model ? moment.duration(moment().diff(this.props.model.date)).humanize() : '';

        return (
            <View style={styles.container}>
                <Text style={styles.modelLabel}>Champion for</Text>
                <Image source={require('TotoML/img/trophy.png')} style={styles.modelImage} />
                <Text style={styles.modelValue}>{championForHumanized}</Text>
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
    modelValue: {
      color: TRC.TotoTheme.theme.COLOR_TEXT,
      fontSize: 12,
      textTransform: "uppercase",
    },

})