const Model = require('objection').Model;

class Model1 extends Model {
  static getTableName() {
    return 'model1';
  }

  static get relationMappings() {
    return {
      model2: {
        relation: Model.BelongsToOneRelation,
        modelClass: Model2,
        join: {
          from: 'model1.model2_id',
          to: 'model2.id'
        }
      }
    }
  }
}

class Model2 extends Model {
  static getTableName() {
    return 'model2';
  }

  static get relationMappings() {
    return {
      model1s: {
        relation: Model.HasManyRelation,
        modelClass: Model1,
        join: {
          from: 'model2.id',
          to: 'model1.model2_id'
        }
      }
    }
  }
}

class Model3 extends Model {
  static getTableName() {
    return 'model3';
  }

  static get relationMappings() {
    return {
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Model3,
        join: {
          from: 'model3.parent_id',
          to: 'model3.id'
        }
      }
    }
  }
}

class Model4 extends Model {
  static getTableName() {
    return 'model4';
  }

  static get relationMappings() {
    return {
      children: {
        relation: Model.HasManyRelation,
        modelClass: Model4,
        join: {
          from: 'model4.id',
          to: 'model4.parent_id'
        }
      },
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Model4,
        join: {
          from: 'model4.parent_id',
          to: 'model4.id'
        }
      }
    }
  }
}

module.exports = {
  Model1,
  Model2,
  Model3,
  Model4
}