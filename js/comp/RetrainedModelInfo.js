import React, { Component } from 'react';
import RetrainedDate from './RetrainedDate';
import { View, Text, Image, StyleSheet } from 'react-native';
import TRC from 'toto-react-components';

export default class RetrainedModelInfo extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.modelLabel}>Retrained</Text>
                <Image source={require('TotoML/img/fight.png')} style={styles.modelImage} />
                <RetrainedDate modelName={this.props.modelName} showIcon={false} showLabel={false} />
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

})