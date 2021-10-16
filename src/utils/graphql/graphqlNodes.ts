import { FieldNode, GraphQLResolveInfo } from 'graphql';
import { SelectionNode } from 'graphql/language/ast';

/** Возвращает узлы набора выделений */
export function getNodes(object?: FieldNode | null) {
  return object?.selectionSet?.selections || null;
}

/** Выполняет поиск узла по названию */
export function findNodeByName(
  nodes?: readonly SelectionNode[] | null,
  name?: string,
) {
  const result = nodes?.find(
    (selNode) => selNode.kind === 'Field' && selNode.name.value === name,
  );
  if (result) {
    return result as FieldNode;
  }
  return null;
}

/** Выполняет рекурсивный поиск узла по пути */
export function getNodeByPath(
  path: string,
  nodes: readonly SelectionNode[] | null,
) {
  const [name, ...fields] = path.split('.');
  if (fields && fields.length) {
    const node = findNodeByName(nodes, name);
    return getNodeByPath(fields.join('.'), getNodes(node));
  }
  return findNodeByName(nodes, name);
}

export interface GetFieldsOptions {
  exclude?: string[];
  include?: string[];
  all?: boolean;
}

function isFieldNode(node: SelectionNode): node is FieldNode {
  return node.kind === 'Field';
}

/** Возвращает список полей узла */
export function getFields(
  nodes: readonly SelectionNode[] | null,
  options: GetFieldsOptions = {},
) {
  let value: readonly FieldNode[] = nodes ? nodes.filter(isFieldNode) : [];
  const { exclude = [], include = [], all = false } = options;

  if (exclude.length > 0) {
    value = value.filter((s) => exclude.indexOf(s.name.value) === -1);
  }

  if (!all) {
    value = value.filter((s) => {
      if (include && include.indexOf(s.name.value) >= 0) {
        return true;
      }
      return s && s.selectionSet === undefined;
    });
  }

  return value.map((s) => s.name.value);
}

/** Возвращает список полей узла */
export function getSubnodeFields(info: GraphQLResolveInfo, name: string) {
  const listNode = findNodeByName(getNodes(info.fieldNodes[0]), name);
  return getFields(getNodes(listNode), { all: true });
}

/** Возвращает список полей узла по пути */
export function getSubnodeFieldsByPath(info: GraphQLResolveInfo, path: string) {
  const listNode = getNodeByPath(path, getNodes(info.fieldNodes[0]));
  return getFields(getNodes(listNode), { all: true });
}
