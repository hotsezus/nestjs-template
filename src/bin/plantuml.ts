import { createConnection } from 'typeorm';
import { Direction, Flags, TypeormUml } from 'typeorm-uml';

import ormConfig from '../config/ormconfig';
import {
  downloadPath,
  plantumlAddress,
  plantumlDiagramFormat,
} from '../config/plantuml';

const flags: Flags = {
  direction: Direction.LR,
  format: plantumlDiagramFormat,
  'plantuml-url': plantumlAddress,
  download: downloadPath,
};
const typeormUml = new TypeormUml();

createConnection(ormConfig as any)
  .then((connection) => {
    return typeormUml.build(connection, flags);
  })
  .catch((e) => {
    process.stderr.write(e);
  });
