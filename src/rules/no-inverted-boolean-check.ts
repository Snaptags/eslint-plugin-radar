/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation,
 * version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 */
// https://jira.sonarsource.com/browse/RSPEC-1940

import { Rule } from "eslint";
import { Node, UnaryExpression } from "estree";
import { isBinaryExpression } from "../utils/nodes";

const MESSAGE = "Use the opposite operator ({{invertedOperator}}) instead.";

const invertedOperators: { [operator: string]: string } = {
  "==": "!=",
  "!=": "==",
  "===": "!==",
  "!==": "===",
  ">": "<=",
  "<": ">=",
  ">=": "<",
  "<=": ">",
};

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Boolean checks should not be inverted",
      category: "Code Smell Detection",
      recommended: true,
      url: "https://github.com/es-joy/eslint-plugin-radar/blob/master/docs/rules/no-inverted-boolean-check.md",
    },
    fixable: "code",
  },
  create(context: Rule.RuleContext) {
    return { UnaryExpression: (node: Node) => visitUnaryExpression(node as UnaryExpression, context) };
  },
};

function visitUnaryExpression(unaryExpression: UnaryExpression, context: Rule.RuleContext) {
  if (unaryExpression.operator === "!" && isBinaryExpression(unaryExpression.argument)) {
    const condition = unaryExpression.argument;
    const invertedOperator = invertedOperators[condition.operator];
    if (invertedOperator) {
      const left = context.getSourceCode().getText(condition.left);
      const right = context.getSourceCode().getText(condition.right);
      context.report({
        message: MESSAGE,
        data: { invertedOperator },
        node: unaryExpression,
        fix: (fixer) => fixer.replaceText(unaryExpression, `${left} ${invertedOperator} ${right}`),
      });
    }
  }
}

export = rule;
