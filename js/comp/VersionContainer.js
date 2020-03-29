import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import TRC from 'toto-react-components';

/**
 * Shows the version of a model
 * 
 * Parameters:
 * - version        :   mandatory, the version of the model to display
 */
export default class VersionContainer extends Component {

    constructor(props) {
        super(props);

        this.state = {}
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.version}>{this.props.version}</Text>
                <Text style={styles.label}>VERSION</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        justifyContent: 'center',
        alignItems: 'center',
        width: 96, 
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        borderColor: TRC.TotoTheme.theme.COLOR_THEME_DARK
    }, 
    version: {
        fontSize: 24,
        color: TRC.TotoTheme.theme.COLOR_TEXT
    }, 
    label: {
        fontSize: 10,
        color: TRC.TotoTheme.theme.COLOR_TEXT
    }
})