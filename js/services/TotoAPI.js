import React from 'react';
import * as config from '../Config';
import moment from 'moment';

var newCid = function() {

	let ts = moment().format('YYYYMMDDHHmmssSSS');

	let random = (Math.random() * 100000).toFixed(0).padStart(5, '0');

	return ts + '-' + random;

}
/**
 * Wrapper for the fetch() React method that adds the required fields for Toto authentication
 */
export default class TotoAPI {

  fetch(url, options) {

    if (options == null) options = {method: 'GET', headers: {}};
    if (options.headers == null) options.headers = {};

    // Adding standard headers
    options.headers['Accept'] = 'application/json';
    options.headers['Authorization'] = config.AUTH;
    options.headers['x-correlation-id'] = newCid();

    return fetch(config.API_URL + url, options);
  }
}
