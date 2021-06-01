import { tryNumber } from '@proscom/ui-utils';
import path from 'path';
import { Format } from 'typeorm-uml';

import { tryEnum } from './tools';

const plantumlHost = process.env.PLANTUML_HOST || 'http://127.0.0.1';
const plantumlPort = tryNumber(process.env.PLANTUML_PORT, 8089);

export const plantumlDiagramFormat = tryEnum(
  process.env.PLANTUML_DIAGRAM_FORMAT,
  Format,
  Format.PNG,
);

export const plantumlAddress = `${plantumlHost}:${plantumlPort}`;

export const downloadPath = path.join(
  process.cwd(),
  `${process.env.PLANTUML_DIAGRAM || 'docs/diagram'}.${plantumlDiagramFormat}`,
);
