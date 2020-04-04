import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import TRC from 'toto-react-components';
import TotoMLRegistryAPI from '../services/TotoMLRegistryAPI';
import * as config from '../Config';

export default class ModelDescription extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,
            newDescription: ''
        }

        this.loadModel = this.loadModel.bind(this);
        this.saveDescription = this.saveDescription.bind(this);
        this.onModelMetadataUpdated = this.onModelMetadataUpdated.bind(this);
    }

    componentDidMount() {
        this.loadModel();

        // Bindings
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.modelMetadataUpdated, this.onModelMetadataUpdated);
    }
    
    componentWillUnmount() {
        TRC.TotoEventBus.bus.unsubscribeToEvent(config.EVENTS.modelMetadataUpdated, this.onModelMetadataUpdated);
    }

    onModelMetadataUpdated(event) {
        if (event.context.modelName == this.props.modelName) this.loadModel();
    }

    loadModel() {
        new TotoMLRegistryAPI().getModel(this.props.modelName).then((data) => {
            this.setState({
                description: data.description
            })
        })
    }

    /**
     * Saves the description
     */
    saveDescription() {

        this.setState({ modalVisible: false })

        new TotoMLRegistryAPI().putModel(this.props.modelName, {description: this.state.newDescription}).then((data) => {
            
            // Notify that the description has been changed
            TRC.TotoEventBus.bus.publishEvent({name: config.EVENTS.modelMetadataUpdated, context: {modelName: this.props.modelName}});
        })

    }

    render() {

        // Empty description label
        let emptyLabel;
        if (!this.state.description) emptyLabel = (
            <Text style={styles.emptyLabel}>No description available for this model. Click on the text to add one!</Text>
        )

        // Description
        let descText;
        if (this.state.description) descText = (
            <Text style={styles.descriptionText}>{ this.state.description }</Text>
        )

        return (
            <TouchableOpacity style={styles.container} onPress={ () =>  { this.setState({ modalVisible: true }) } }>
                {emptyLabel}
                {descText}

                <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalDescContainer}>
                            <TextInput autoFocus={true} multiline={true} style={styles.textInput} placeholder="Insert the description here" onChangeText={ (text) => {this.setState({ newDescription: text })} }/>
                        </View>
                        <View style={styles.buttonsContainer}>
                            <TRC.TotoIconButton image={require('TotoML/img/tick.png')} onPress={ this.saveDescription } />
                            <TRC.TotoIconButton image={require('TotoML/img/cross.png')} onPress={() => { this.setState({ modalVisible: false }) }} />
                        </View>
                    </View>
                </Modal>
            </TouchableOpacity>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    emptyLabel: {
        color: TRC.TotoTheme.theme.COLOR_TEXT,
        opacity: 0.6,
        fontSize: 12,
        textAlign: 'center',
    },
    descriptionText: {
        color: TRC.TotoTheme.theme.COLOR_TEXT,
        fontSize: 12,
        textAlign: 'center',
    },

    modalContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: TRC.TotoTheme.theme.COLOR_THEME_DARK,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 64,
    },
    buttonsContainer: {
      marginBottom: 24,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    modalDescContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    textInput: {
        fontSize: 20,
        color: TRC.TotoTheme.theme.COLOR_TEXT, 
    }

})