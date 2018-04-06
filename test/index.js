const assert = require('chai').assert;
const expect = require('chai').expect;
const models = require('./mock-models');
const processResultToJSON = require('../');

describe('objection-to-json', function() {

  it('should return a function', function() {
    expect(processResultToJSON).to.be.a('function');
  });

  it('should accept a model object and return a JSON=JSON-able object', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    const schema = { };
    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
  });

  it('should accept a list of model objects and return a JSON-able array', function() {
    let model1_1 = new models.Model1();
    model1_1.$id(100);
    model1_1.$set({
      name:'model1',
      model2_id:12
    });
    model1_1.$setRelated('model2', new models.Model2());
    let model1_2 = new models.Model1();
    model1_2.$id(101);
    model1_2.$set({
      name:'model1',
      model2_id:13
    });
    model1_2.$setRelated('model2', new models.Model2());
    const schema = { };
    const result = processResultToJSON([model1_1, model1_2], schema, models);

    expect(result).to.be.an('array');
    expect(result).to.have.length(2);
  });

  it('should include all fields by default', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    model1.model2.$id(12);
    model1.model2.$set({name:'model2'});
    const schema = {
      Model1: {},
      Model2: {}
    };

    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      id: 100,
      name: 'model1',
      model2_id: 12,
      model2: {
        id: 12,
        name: 'model2'
      }
    });
  });

  it('should allow all fields to be excluded', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    model1.model2.$id(12);
    model1.model2.$set({name:'model2'});
    const schema = {
      Model1: {
        exclude: ['@all']
      },
      Model2: {
        exclude: ['@all']
      }
    };

    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({});
  });

  it('should include only named fields if any are provided', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    model1.model2.$id(12);
    model1.model2.$set({name:'model2'});
    const schema = {
      Model1: {
        include: ['name', 'model2']
      },
      Model2: {
        include: ['id']
      }
    };

    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      name: 'model1',
      model2: {
        id: 12
      }
    });
  });

  it('should exclude named fields', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    model1.model2.$id(12);
    model1.model2.$set({name:'model2'});
    const schema = {
      Model1: {
        exclude: ['id', 'model2_id']
      },
      Model2: {
        exclude: ['id']
      }
    };

    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      name: 'model1',
      model2: {
        name: 'model2'
      }
    });
  });

  it('should include special fields using generic names @pk, @fk, @all', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    model1.model2.$id(12);
    model1.model2.$set({name:'model2'});
    const schema = {
      Model1: {
        include: ['@fk', 'model2']
      },
      Model2: {
        include: ['@pk']
      }
    };

    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      model2_id: 12,
      model2: {
        id: 12
      }
    });
  });

  it('should exclude special fields using generic names @pk, @fk, @all', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    model1.model2.$id(12);
    model1.model2.$set({name:'model2'});
    const schema = {
      Model1: {
        exclude: ['@fk']
      },
      Model2: {
        exclude: ['@pk']
      }
    };

    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      id: 100,
      name: 'model1',
      model2: {
        name: 'model2'
      }
    });
  });

  it('should exclude fields that are matched in both include and exclude', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    model1.model2.$id(12);
    model1.model2.$set({name:'model2'});
    const schema = {
      Model1: {
        include: ['@all'],
        exclude: ['model2_id']
      },
      Model2: {
        include: ['id', 'name'],
        exclude: ['id']
      }
    };

    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      id: 100,
      name: 'model1',
      model2: {
        name: 'model2'
      }
    });
  });

  it('should exclude null fields if the option excludeKeyIfNull is set', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    model1.model2.$id(12);
    model1.model2.$set({name: null});
    const schema = {
      Model1: { },
      Model2: { },

      options: {
        excludeKeyIfNull: true
      }
    };

    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      id: 100,
      name: 'model1',
      model2_id: 12,
      model2: {
        id: 12
      }
    });
  });

  it('should not exclude null fields if the option excludeKeyIfNull is not set', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    model1.model2.$id(12);
    model1.model2.$set({name: null});
    const schema = {
      Model1: { },
      Model2: { },

      options: { }
    };

    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      id: 100,
      name: 'model1',
      model2_id: 12,
      model2: {
        id: 12,
        name: null
      }
    });
  });

  it('should apply recursively to nested models', function() {
    let model3_1 = new models.Model3();
    model3_1.$id(100);
    model3_1.$set({
      name:'model3_1',
      parent_id:101
    });
    model3_1.$setRelated('parent', new models.Model3());
    model3_1.parent.$id(101);
    model3_1.
      parent.$set({
        name: 'model3_2',
        parent_id:102
      });
    model3_1.parent.$setRelated('parent', new models.Model3());
    model3_1.parent.parent.$id(102);
    model3_1.
      parent.
        parent.$set({
          name: 'model3_3',
          parent_id:null
        });
    model3_1.parent.parent.$setRelated('parent', null);
    
    const schema = {
      Model3: { 
        exclude: ['@fk', '@pk']
      }
    };

    const result = processResultToJSON(model3_1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      name: 'model3_1',
      parent: {
        name: 'model3_2',
        parent: {
          name: 'model3_3',
          parent: null
        }
      }
    });
  });

  it('should apply recursively to nested lists', function() {
    let model4_1 = new models.Model4();
    model4_1.$id(100);
    model4_1.$set({
      name:'model4_1',
      parent_id:102
    });
    model4_1.$setRelated('children', []);
    let model4_2 = new models.Model4();
    model4_2.$id(101);
    model4_2.$set({
      name:'model4_2',
      parent_id:102
    });
    model4_2.$setRelated('children', []);
    let model4_3 = new models.Model4();
    model4_3.$id(102);
    model4_3.$set({
      name:'model4_3',
      parent_id:null
    });
    model4_3.$setRelated('children', [model4_1, model4_2]);
    
    const schema = {
      Model4: { 
        exclude: ['@fk', 'id']
      },

      options: {
        excludeKeyIfNull: true
      }
    };

    const result = processResultToJSON(model4_3, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      name: 'model4_3',
      children: [
        { name: 'model4_1', children: [] },
        { name: 'model4_2', children: [] }
      ]
    });
  });

  it('should allow single include/exclude field names to be passed as simple strings', function() {
    let model1 = new models.Model1();
    model1.$id(100);
    model1.$set({
      name:'model1',
      model2_id:12
    });
    model1.$setRelated('model2', new models.Model2());
    const schema = { 
      Model1: {
        include: '@all',
        exclude: 'id'
      }
    };
    const result = processResultToJSON(model1, schema, models);

    expect(result).to.be.an('object');
    expect(result).to.deep.equal({
      name: 'model1',
      model2_id: 12,
      model2: {}
    });
  });

});