import TRC from 'toto-react-components';
import * as config from '../Config';
import TotoMLRegistryAPI from '../services/TotoMLRegistryAPI';
import ModelAPI from '../services/ModelAPI';

/**
 * This class is a Singleton that allows other components to check at any time wether a model is scoring or not.
 */
class ScoringUtil {

    constructor() {
        this.scorings = {}

        // Bindings 
        this.onScoringStarted = this.onScoringStarted.bind(this);
        this.onScoringEnded = this.onScoringEnded.bind(this);
        this.loadModels = this.loadModels.bind(this);
        this.updateModelScoringStatus = this.updateModelScoringStatus.bind(this);

        // Listeners
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.scoringStarted, this.onScoringStarted)
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.scoringEnded, this.onScoringEnded)

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

                this.updateModelScoringStatus(data.models[i].name);

            }
        })
    }

    /**
     * Checks if the specified model is scoring
     * If the model is scoring, START A POLLER!!
     */
    updateModelScoringStatus(modelName) {

        new TotoMLRegistryAPI().getModelStatus(modelName).then((data) => {

            if (!data || !data.scoringStatus || data.scoringStatus == 'not-scoring') {
                // Publish the ending
                TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.scoringEnded, context: { modelName: modelName } });
            }
            else {
                // Publish the start
                TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.scoringStarted, context: { modelName: modelName } });
            }

        })
    }

    /**
     * Checks if a specified model is scoring
     */
    isModelScoring(modelName) {

        return this.scorings[modelName];

    }

    /**
     * Reacts to the start of the scoring of a model
     * @param event 
     */
    onScoringStarted(event) {

        // Save the information that a model is scoring 
        this.scorings[event.context.modelName] = true;

        // Start the Scoring poller
        new ScoringPoller(event.context.modelName).start();

    }

    /**
     * Reacts to the ending of a model scoring
     * @param {event} event the event
     */
    onScoringEnded(event) {

        // Save the information that a model is not scoring 
        this.scorings[event.context.modelName] = false;
    }

    /**
     * This method will trigger the scoring of a model
     * @param {string} modelName 
     */
    score(modelName) {

        // Trigger the model scoring
        new ModelAPI().scoreModel(modelName);

        // Trigger the event stating that a scoring has started
        TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.scoringStarted, context: { modelName: modelName } })

    }
}

class ScoringPoller {

    constructor(modelName) {

        this.modelName = modelName;

        // Bindings
        this.check = this.check.bind(this);
        this.start = this.start.bind(this);

    }

    start() {
        this.timer = setInterval(this.check, 5000)
    }

    /**
     * Checks on the TOTO ML Registry API for the end of the scoring of the model 
     * and then broadcasts that end
     */
    check() {

        new TotoMLRegistryAPI().getModelStatus(this.modelName).then((data) => {

            if (!data || !data.scoringStatus || data.scoringStatus == 'not-scoring') {

                TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.scoringEnded, context: { modelName: this.modelName } });

                clearInterval(this.timer);

            }

        })

    }


}

module.exports.scoringUtil = new ScoringUtil();