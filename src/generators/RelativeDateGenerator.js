import BaseGenerator from './BaseGenerator';
import { add } from 'date-fns'
class RelativeDateGenerator extends BaseGenerator {
  generate({ session, params }) {
    return add(session.now, params)
  }
}

export default RelativeDateGenerator;
