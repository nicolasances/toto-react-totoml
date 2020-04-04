import TotoAPI from './TotoAPI';
import moment from 'moment';
import user from 'TotoML/js/User';

/**
 * API to access the Toto ML Registry
 */
export default class TotoMLRegistryAPI {

  /**
   * Get the available models
   */
  getModels() {

    // Post the data
    return new TotoAPI().fetch('/totoml/registry/models', {
      method: 'GET',
    }).then((response => response.json()));

  }

  /**
   * Get the model
   */
  getModel(modelName) {

    // Post the data
    return new TotoAPI().fetch('/totoml/registry/models/' + modelName, {
      method: 'GET',
    }).then((response => response.json()));

  }

  /**
   * Updates the model 
   * @param {str} modelName The name of the model
   * @param {obj} data the data to be updated
   */
  putModel(modelName, data) {

    // Post the data
    return new TotoAPI().fetch('/totoml/registry/models/' + modelName, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((response => response.json()));

  }

  /**
   * Retrieves the last retrained model for the specified champion
   */
  getRetrainedModel(championName) {

    // Post the data
    return new TotoAPI().fetch('/totoml/registry/models/' + championName + '/retrained', {
      method: 'GET',
    }).then((response => response.json()));

  }

  /**
   * Get the historical metrics of the champion
   */
  getChampionHistoricalMetrics(championName) {

    // Post the data
    return new TotoAPI().fetch('/totoml/registry/models/' + championName + '/metrics', {
      method: 'GET',
    }).then((response => response.json()));

  }

  /**
   * Get the status of the model
   */
  getModelStatus(modelName) {

    // Post the data
    return new TotoAPI().fetch('/totoml/registry/models/' + modelName + '/status', {
      method: 'GET',
    }).then((response => response.json()));

  }

  /**
   * Promotes the Retrained Model to Champion!
   */
  promoteModel(modelName) {

    // Post the data
    return new TotoAPI().fetch('/totoml/registry/models/' + modelName + '/retrained/promote', {
      method: 'POST',
    }).then((response => response.json()));

  }

}
