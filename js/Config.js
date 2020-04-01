
export const API_URL = 'https://imazdev.it/apis';
export const AUTH = 'Basic c3RvOnRvdG8=';

export const EVENTS = {
  userInfoChanged: 'userInfoChanged',     // User info received from Google
  trainingStarted: 'trainingStarted',     // Triggered when a training of a model has started. Will provide the name of the model as "modelName"
  trainingEnded: 'trainingEnded',         // Triggered when the training of a model has ended. Will provide the name of the model as "modelName"
  promotionStarted: 'promotionStarted',   // A model is being promoted. Will provide the name of the model as "modelName"
  promotionEnded: 'promotionEnded',       // A model has been promoted. Will provide the name of the model as "modelName"
  scoringStarted: 'scoringStarted',       // A model has started the scoring process. Will provide the name of the model as "modelName"
  scoringEnded: 'scoringEnded',           // A model has finished the scoring process. Will provide the name of the model as "modelName"
}
