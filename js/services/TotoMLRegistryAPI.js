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

}
