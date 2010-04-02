/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require('sys');
var http = require('http');
var fs = require('fs');

var application_directory = process.cwd() + "/";

require('./util');

require("./StringToolkit");

require("./Config");

/**
 * The global configuration object.
 * 
 * @type Config
 */
config = new Config();

try {
    require(application_directory + "config");
} catch (e) {
    /*
     * It's a pitty, we don't have a config file :(.
     */
}

require("./Options");
require("./Logging");

require("./BootstrapManager");

/**
 * The global bootstrap manager
 * 
 * @type BootstrapManager
 */
bootstrap_manager = new BootstrapManager();

require("./ContextToolkit");
require("./Context");


require("./DatabaseConnection");
require("./DbslayerDatabaseConnection");

require("./MemoryStorage");
require("./PostgresStorage");
require("./DbslayerStorage");
require("./StorageManager");

/**
 * The global storage manager.
 * 
 * @type StorageManager
 */
storage_manager = new StorageManager();

require("./SessionManager");

require("./StaticFilesManager");
static_files_manager = new StaticFilesManager();

require("./Controller");
require("./ControllerManager");

/**
 * The global controller manager.
 * 
 * @type ControllerManager
 */
controller_manager = new ControllerManager();

require("./JsView");
require("./EjsView");
require("./ViewManager");

/**
 * The global view manager.
 * 
 * @type ViewManager
 */
view_manager = new ViewManager();

require("./DataMapper");
require("./DataMapperManager");

/**
 * The global data mapper manager.
 * 
 * @type DataMapperManager
 */
data_mapper_manager = new DataMapperManager();

if (!config.get('core', {}).disable_core_data_mappers) {
    require("./core-data-mappers");
}

require("./Validator");
require("./ValidatorManager");

/**
 * The global validator manager.
 * 
 * @type ValidatorManager
 */
validator_manager = new ValidatorManager();

require("./Validation");

if (!config.get('core', {}).disable_core_validators) {
    require("./core-validators");
}
var module_names = [];

try {
    module_names = fs.readdirSync(application_directory + "modules");
} catch (e) {
    /*
     * We can't read the modules directory, cause there is none :(
     */
}

/*
 * Find all /lib, modulename/lib folders and append them to the require path.
 */
var lib_folders = [application_directory + "lib"];
for ( var m = 0; m < module_names.length; m++) {
    lib_folders.push(application_directory + "modules/" + module_names[m] + "/lib");
}

for ( var f = 0; f < lib_folders.length; f++) {
    var lib_folder_exists = false;
    try {
        var lib_folder_stats = fs.statSync(lib_folders[f]);
        if (lib_folder_stats.isDirectory()) {
            Logging.prototype.info("index: Adding "+lib_folders[f]+" as lib.");
            require.paths.push(lib_folders[f]);
            lib_folder_exists = true;
        }
    } catch (e) {
        /*
         * Folder does not exist!
         */
    }
    if (lib_folder_exists) {
        var lib_index_file_exists = false;
        try {
            index_js_stats = fs.statSync(lib_folders[f] + "/index.js");
            lib_index_file_exists = true;
        } catch (e) {
            /*
             * Index file does not exist!
             */
        }
        
        if (lib_index_file_exists) {
            Logging.prototype.info("index: Loading "+lib_folders[f]+"/index.js.");
            require(lib_folders[f] + "/index");
        }
    }
}

/*
 * Load the static folder, if the core has one.
 */
try {
    static_folder_stats = fs.statSync(application_directory + "static");
    static_files_manager.addFolder(application_directory + "static/");
} catch (e) {
    /*
    * Folder does not exist!
    */
}

/**
 * The global session manager.
 * 
 * @type SessionManager
 */
session_manager = new SessionManager(config.get("session", {}));

/*
 * Load controllers and views
 */
controller_manager.loadControllers(application_directory);
view_manager.loadViews(application_directory);

/*
 * For each module, load what needs to be loaded.
 */
for ( var i = 0; i < module_names.length; i++) {
    var module_name = module_names[i];
    var module_folder = application_directory + "modules/" + module_name + "/";
    
    controller_manager.loadControllers(module_folder, module_name);
    view_manager.loadViews(module_folder, module_name);
    
    try {
        module_static_folder_stats = fs.statSync(module_folder + "static/");
        static_files_manager.addFolder(module_folder + "static/");
    } catch (e) {
        /*
        * Folder does not exist!
        */
    }
    
}

require("./BaseApplication");
require("./ServerApplication");
require("./ConsoleApplication");
require("./TestApplication");
