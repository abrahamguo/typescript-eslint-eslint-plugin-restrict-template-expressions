import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';

export interface ImportDefaultSpecifier extends BaseNode {
  local: Identifier;
  type: AST_NODE_TYPES.ImportDefaultSpecifier;
}
