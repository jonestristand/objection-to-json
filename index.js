'use strict';
const Model = require('objection').Model;
const flatten = require('array-flatten');
const _ = require('lodash');


const standardizeSchema = (schema) => {
  // Replace single strings (e.g. '@all') with single-element arrays (e.g. ['@all'])
  let stdized = Object.keys(schema).reduce((newSchema, key) => {
    newSchema[key] = {};
    if (schema[key].include) {
      newSchema[key].include = flatten([schema[key].include]);
    }
    if (schema[key].exclude) {
      newSchema[key].exclude = flatten([schema[key].exclude]);
    }
    return newSchema;
  }, {});

  stdized.options = _.defaults(schema.options, {
    excludeKeyIfNull: false
  })

  return stdized;
};

// Checks if a key is found in the array matches, given an objection.js model. 
// Expands @all, @fk, @pk
const keyMatches = (key, matches, model) => {
  const filledMatches = flatten(
    matches.map(matchKey => {
      if (matchKey === '@pk') {
        return model.idColumn;
      }
      else if (matchKey === '@fk') {
        const relationMap = model.relationMappings;
        return Object.keys(relationMap).reduce((fkList, key) => {
          if (relationMap[key].relation === Model.BelongsToOneRelation) {
            const fk = relationMap[key].join.from;
            // Cut the field name off of the table name
            fkList.push(fk.slice(fk.lastIndexOf('.') + 1)); 
          }
          return fkList;
        }, []);
      }
      else if (matchKey === '@all') {
        return key;
      }
      else {
        return matchKey;
      }
    }
  ));

  return filledMatches.includes(key);
};

const processModel = (model, schema, models) => {
  if (model.constructor.name in schema) {
    // Schema exists for this object, start dealing with it

    return Object.keys(model).reduce((newModel, key) => {
      let inc = true, exc = false;
      if (schema[model.constructor.name].include)
        inc = keyMatches(key, schema[model.constructor.name].include, models[model.constructor.name]);
      if (schema[model.constructor.name].exclude)
        exc = keyMatches(key, schema[model.constructor.name].exclude, models[model.constructor.name]);

      // Check if the key is included, or if '@all' is included
      if (inc && !exc) {

        if (model[key] instanceof Model) { // This is a model, recurse through it
          newModel[key] = processModel(model[key], schema, models);
        } else if (model[key] instanceof Array) { // This is an array, use the list processor
          newModel[key] = processList(model[key], schema, models);
        } else { // Simply a key, return it as it is included
          if (!(schema.options.excludeKeyIfNull && model[key] === null))
            newModel[key] = model[key];
        }
      
      }
      return newModel;
    }, {});

  }
  else {
    // No specific schema, return the whole thing.
    return model;
  }
}

const processList = (list, schema, models) => {
  return list.map( (item) => { return processModel(item, schema, models) } );
};

const processResultToJSON = (result, schema, models) => {
  const fixedSchema = standardizeSchema(schema);

  if (result instanceof Array)
    return processList(result, fixedSchema, models);
  else return processModel(result, fixedSchema, models);
}

module.exports = processResultToJSON;