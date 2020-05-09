import BaseGenerator from './BaseGenerator';

class ChanceGenerator extends BaseGenerator {

  generate({ params }) {
    const generator = this.chance[params.method];
    if (!generator) throw new Error(`The installed version of Chance does not have the '${params.method}' generator`);
    return this.chance[params.method](params.params);
  }
}

export default ChanceGenerator;
