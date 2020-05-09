import BaseGenerator from './BaseGenerator';

class FunctionGenerator extends BaseGenerator {

  generate({ params: fn }) {
    return fn(this.chance);
  }
}

export default FunctionGenerator;
