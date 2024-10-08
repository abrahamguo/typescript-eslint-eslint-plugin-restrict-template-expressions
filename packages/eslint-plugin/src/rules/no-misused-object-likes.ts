import console from 'node:console';

import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getParserServices,
  getStaticMemberAccessValue,
} from '../util';

const METHODS = ['assign', 'entries', 'hasOwn', 'keys', 'values'];

export default createRule({
  name: 'no-misused-object-likes',
  defaultOptions: [],
  meta: {
    type: 'problem',
    docs: {
      description: `Disallow using \`Object.{${METHODS.join(`|`)}}(...)\` and the \`in\` operator on Map/Set objects`,
      requiresTypeChecking: true,
    },
    messages: {
      misusedObjectLike:
        "Don't use {{used}} on {{objectClass}} objects — it will not properly check the contents.",
    },
    schema: [],
  },

  create(context) {
    const checkClassAndReport = (node: TSESTree.Node, used: string): void => {
      const objectClass = getParserServices(context)
        .getTypeAtLocation(node)
        .getSymbol()?.name;
      if (objectClass && /^(Readonly|Weak)?(Map|Set)$/.test(objectClass)) {
        context.report({
          node,
          messageId: 'misusedObjectLike',
          data: { used, objectClass },
        });
      }
    };
    return {
      BinaryExpression(node): void {
        if (node.operator === 'in') {
          checkClassAndReport(node.right, 'the `in` operator');
        }
      },
      CallExpression(node): void {
        const { arguments: args, callee } = node;
        if (
          args.length !== 1 ||
          callee.type !== AST_NODE_TYPES.MemberExpression
        ) {
          return;
        }
        const { object } = callee;
        if (
          object.type !== AST_NODE_TYPES.Identifier ||
          object.name !== 'Object'
        ) {
          return;
        }
        const method = getStaticMemberAccessValue(callee, context);
        if (typeof method === 'string' && METHODS.includes(method)) {
          checkClassAndReport(args[0], `\`Object.${method}()\``);
        }
      },
    };
  },
});