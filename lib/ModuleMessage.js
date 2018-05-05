'use babel';

export const ModuleMessage = {

  ACTION_FAILED : "Unable to perform action, please see full exception below.",

  ERROR_INVALID_VLT : "Vault base is not configured. Please configure vault base to use Vlt Atom",

  ERROR_INVALID_PATH : "Not a valid local jcr content path to pull from server.",

  ERROR_INVALID_PATH_PUSH : "Not a valid path to push to crx server.",

  PULL_SUCCESS : "Successfully Pulled from server",

  PULL_FAILED : "Error while pulling from server",

  PUSH_SUCCESS : "Successfully Pushed to server",

  PUSH_FAILED : "Error while pushing to server",

  CHECKOUT_PROCESS : "Initiating sync operation from crx!",

  CHECKOUT_SUCCESS : "Successfully Synced working copy with crx",

  CHECKOUT_ERROR : "Unable to checkout from crx server. Please see detailed error below.",

  INFO_EXEC_INIT : "Initiating vlt operation...",

  ADD_SUCCESS : "Successfully added under vault control",

  ADD_FAILED : "Error while adding file/directory under vault control",

  STATS_CHECK : "Evaluating changes......",
  STATS_NO_CHANGE : "Not changes found in working copy..",
  STATS_ERROR : "Unable to evaluate local changes."

}
