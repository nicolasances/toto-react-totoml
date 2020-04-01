import TRC from 'toto-react-components';
import * as config from '../Config';
import TotoMLRegistryAPI from '../services/TotoMLRegistryAPI';
import ModelAPI from '../services/ModelAPI';

/**
 * This class is a Singleton that allows other components to check at any time wether a model is training or not.
 */
class TrainingUtil {

    constructor() {
        this.trainings = {}

        // Bindings 
        this.onTrainingStarted = this.onTrainingStarted.bind(this);
        this.onTrainingEnded = this.onTrainingEnded.bind(this);
        this.loadModels = this.loadModels.bind(this);
        this.updateModelTrainingStatus = this.updateModelTrainingStatus.bind(this);

        // Listeners
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingStarted, this.onTrainingStarted)
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.trainingEnded, this.onTrainingEnded)

        // Initialize
        this.loadModels()
    }

    /**
     * Loads the models when this object is created
     */
    loadModels() {

        new TotoMLRegistryAPI().getModels().then((data) => {

            if (!data || !data.models || data.models.length == 0) return;

            for (var i = 0; i < data.models.length; i++) {

                this.updateModelTrainingStatus(data.models[i].name);

            }
        })
    }

    /**
     * Checks if the specified model is training
     * If the model is training, START A POLLER!!
     */
    updateModelTrainingStatus(modelName) {

        new TotoMLRegistryAPI().getModelStatus(modelName).then((data) => {

            if (!data || !data.trainingStatus || data.trainingStatus == 'not-training') {
                // Publish the ending
                TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.trainingEnded, context: { modelName: modelName } });
            }
            else {
                // Publish the start
                TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.trainingStarted, context: { modelName: modelName } });
            }

        })
    }

    /**
     * Checks if a specified model is training
     */
    isModelTraining(modelName) {

        return this.trainings[modelName];

    }

    /**
     * Reacts to the start of the training of a model
     * @param event 
     */
    onTrainingStarted(event) {

        // Save the information that a model is training 
        this.trainings[event.context.modelName] = true;

        // Start the Training poller
        new TrainingPoller(event.context.modelName).start();

    }

    /**
     * Reacts to the ending of a model training
     * @param {event} event the event
     */
    onTrainingEnded(event) {

        // Save the information that a model is not training 
        this.trainings[event.context.modelName] = false;
    }

    /**
     * This method will trigger the retraining of a model
     * @param {string} modelName 
     */
    retrain(modelName) {

        // Trigger the model retraining
        new ModelAPI().retrainModel(modelName).then((data) => {

            // Trigger the event stating that a training has started
            TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.trainingStarted, context: { modelName: modelName } })

        })

    }
}

class TrainingPoller {

    constructor(modelName) {

        this.modelName = modelName;

        // Bindings
        this.check = this.check.bind(this);
        this.start = this.start.bind(this);

    }

    start() {
        this.timer = setInterval(this.check, 10000)
    }

    /**
     * Checks on the TOTO ML Registry API for the end of the training of the model 
     * and then broadcasts that end
     */
    check() {

        new TotoMLRegistryAPI().getModelStatus(this.modelName).then((data) => {

            if (!data || !data.trainingStatus || data.trainingStatus == 'not-training') {

                TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.trainingEnded, context: { modelName: this.modelName } });

                clearInterval(this.timer);

            }

        })

    }


}

module.exports.trainingUtil = new TrainingUtil();