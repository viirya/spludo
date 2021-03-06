/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The manager for all registered data_mappers.
 * 
 * @extends Logging
 */
DataMapperManager = function() {
    this.data_mappers = {};
};

extend(true, DataMapperManager.prototype, Logging.prototype);

DataMapperManager.prototype.logging_prefix = 'DataMapperManager';

DataMapperManager.prototype.addDataMapper = function(name, data_mapper) {
    this.trace("addDataMapper", arguments);
    this.data_mappers[name] = data_mapper;
};

DataMapperManager.prototype.getDataMapper = function(name) {
    if (this.data_mappers[name]) {
        return this.data_mappers[name];
    }

    throw new Error("DataMapper for name " + name + " not found!");
};

DataMapperManager.prototype.shutdown = function() {
    this.trace("shutdown", arguments);
    for (name in this.data_mappers) {
        /*
         * Check wether this data_mapper has a shutdown method.
         */
        if (typeof this.data_mappers[name].shutdown === "function") {
            try {
                this.data_mappers[name].shutdown();
            } catch (e) {
                this.warn("Exception when trying to shutdown data_mapper " + name);
                this.warn(e);
            }
        }
    }
};
