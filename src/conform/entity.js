class Entity {
  constructor(id, obj) {
    this.id = id;

    if(typeof(obj) == 'string') {
      this.matches = [obj];
      this.regex = obj;
    }else if(obj instanceof Array) {
      this.matches = obj;
      this.regex = '(' + obj.join('|') + ')';
    }else
      throw 'Unsupported type: ' + typeof(obj) + ' = ' + obj
  }
}

module.exports = Entity
