# TOTO ML App 

This is an app that provides access to the Toto ML functionalities. 

## Model Registry
The app provides access to the Toto ML Registry functionalities. 

Key functionalities provided by the app, with regards to Registry:
* **List of Models**: provides a list of the models registered on Registry

* **Metrics history**: provides a visualization of the model's exposed metrics over time. 

* **Comparison with retrained model**: for each metric, a comparison with the same metric of the last Retrained Model is provided, so that the user can always compare the historical behaviour of the Champion Model's metrics with the current value of the metric of the Retrained Model and **keep an eye** if that difference is **maintained over time**, because that could push the user to request a **promotion** of the Retrained Model.

* **Key actions on the Model**: key actions that can be performed on the Model are: 
    * **Promote** the Retrained Model to replace the Champion Model
    * **Retrain** the model. This will force a retraining of the model. Note that that doesn't replace normal scheduled retraining (if scheduled)

* **Last Retraining & Scoring**: when was the model last retrained?  when was the model last scored?

* **Detailed view of the Model**: the detailed view could provide all the detailed information on the Champion Model and the Retrained Model.

* **Description of the model**: user description of the model, can be added by the user through the app.

## Future ideas:
* Tracking **metrics on the retraining process**: how long did the training take? How is that measurement changing over time? 