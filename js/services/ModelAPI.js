import TotoAPI from './TotoAPI';
import moment from 'moment';
import user from 'TotoML/js/User';

/**
 * API to interact with the models
 */
export default class ModelAPI {

  /**
   * Triggers a retraining of the model
   */
  retrainModel(modelName) {

    // Post the data
    return new TotoAPI().fetch('/model/' + modelName + '/train', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response => response.json()));

  }
}
