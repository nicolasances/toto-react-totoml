
export const API_URL = 'https://imazdev.it/apis';
export const AUTH = 'Basic c3RvOnRvdG8=';

export const EVENTS = {
  userInfoChanged: 'userInfoChanged', // User info received from Google
  trainingStarted: 'trainingStarted', // Triggered when a training of a model has started. Will provide the name of the model as "modelName"
  trainingEnded: 'trainingEnded',     // Triggered when the training of a model has ended. Will provide the name of the model as "modelName"
  modelPromoted: 'modelPromoted',     // A model has been promoted. Will provide the name of the model as "modelName"
}
