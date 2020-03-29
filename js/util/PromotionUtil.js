import TRC from 'toto-react-components';
import * as config from '../Config';
import TotoMLRegistryAPI from '../services/TotoMLRegistryAPI';

/**
 * This class is a Singleton that allows other components to check at any time wether a model is being promoted or not.
 */
class PromotionUtil {

    constructor() {
        this.promotions = {}

        // Bindings 
        this.onPromotionStarted = this.onPromotionStarted.bind(this);
        this.onPromotionEnded = this.onPromotionEnded.bind(this);
        this.loadModels = this.loadModels.bind(this);
        this.updateModelPromotionStatus = this.updateModelPromotionStatus.bind(this);

        // Listeners
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.promotionStarted, this.onPromotionStarted)
        TRC.TotoEventBus.bus.subscribeToEvent(config.EVENTS.promotionEnded, this.onPromotionEnded)

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

                this.updateModelPromotionStatus(data.models[i].name);

            }
        })
    }

    /**
     * Checks if the specified model is being promoted
     * If the model is being promoted, START A POLLER!!
     */
    updateModelPromotionStatus(modelName) {

        new TotoMLRegistryAPI().getModelStatus(modelName).then((data) => {

            if (!data || !data.promotionStatus || data.promotionStatus == 'not-promoting') {
                // Publish the ending
                TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.promotionEnded, context: { modelName: modelName } });
            }
            else {
                // Publish the start
                TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.promotionStarted, context: { modelName: modelName } });
            }

        })
    }

    /**
     * Checks if a specified model is training
     */
    isModelPromoting(modelName) {

        return this.promotions[modelName];

    }

    /**
     * Reacts to the start of the promotion of a model
     * @param event 
     */
    onPromotionStarted(event) {

        // Save the information that a model is promotion 
        this.promotions[event.context.modelName] = true;

        // Start the Promotion poller
        new PromotionPoller(event.context.modelName).start();

    }

    /**
     * Reacts to the ending of a model promotion
     * @param {event} event the event
     */
    onPromotionEnded(event) {

        // Save the information that a model is not being promoted 
        this.promotions[event.context.modelName] = false;
    }

    /**
     * This method will trigger the promotion of a model
     * @param {string} modelName 
     */
    promote(modelName) {

        // Trigger the model retraining
        new TotoMLRegistryAPI().promoteModel(modelName).then((data) => {

            // Publish an event 
            TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.promotionStarted, context: { modelName: modelName } })

        })

    }
}

class PromotionPoller {

    constructor(modelName) {

        this.modelName = modelName;

        // Bindings
        this.check = this.check.bind(this);
        this.start = this.start.bind(this);

    }

    start() {
        this.timer = setInterval(this.check, 1000)
    }

    /**
     * Checks on the TOTO ML Registry API for the end of the training of the model 
     * and then broadcasts that end
     */
    check() {

        new TotoMLRegistryAPI().getModelStatus(this.modelName).then((data) => {

            if (!data || !data.promotionStatus || data.promotionStatus == 'not-promoting') {

                TRC.TotoEventBus.bus.publishEvent({ name: config.EVENTS.promotionEnded, context: { modelName: this.modelName } });

                clearInterval(this.timer);

            }

        })

    }


}

module.exports.promotionUtil = new PromotionUtil();