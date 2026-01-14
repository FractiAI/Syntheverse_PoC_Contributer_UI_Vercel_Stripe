/**
 * NSPFRP Protocol ESLint Rules
 * Prevents fractalized self-similar logic errors through linting
 */

module.exports = {
  rules: {
    // Rule: No direct pod_score access
    'no-direct-pod-score-access': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow direct pod_score access. Use extractSovereignScore() instead.',
          category: 'Best Practices',
        },
        fixable: null,
        schema: [],
        messages: {
          forbidden: 'Direct pod_score access violates NSPFRP protocol. Use extractSovereignScore() from @/utils/thalet/ScoreExtractor instead.',
        },
      },
      create(context) {
        return {
          MemberExpression(node) {
            if (
              node.property &&
              node.property.name === 'pod_score' &&
              !context.getFilename().includes('ScoreExtractor') &&
              !context.getFilename().includes('test') &&
              !context.getFilename().includes('spec')
            ) {
              context.report({
                node,
                messageId: 'forbidden',
              });
            }
          },
        };
      },
    },

    // Rule: No inline score extraction
    'no-inline-score-extraction': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow inline atomic_score/score_trace extraction. Use extractSovereignScore() instead.',
          category: 'Best Practices',
        },
        fixable: null,
        schema: [],
        messages: {
          forbidden: 'Inline score extraction violates NSPFRP protocol. Use extractSovereignScore() instead.',
        },
      },
      create(context) {
        return {
          LogicalExpression(node) {
            if (
              node.operator === '??' || node.operator === '||'
            ) {
              const sourceCode = context.getSourceCode();
              const text = sourceCode.getText(node);
              
              if (
                (text.includes('atomic_score') && text.includes('final')) ||
                (text.includes('score_trace') && text.includes('final_score'))
              ) {
                if (
                  !context.getFilename().includes('ScoreExtractor') &&
                  !context.getFilename().includes('test') &&
                  !context.getFilename().includes('spec')
                ) {
                  context.report({
                    node,
                    messageId: 'forbidden',
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};

