import { GraphQLFormattedError } from 'graphql';

export function formatGraphQLError(error: GraphQLFormattedError) {
  const extensions = error.extensions || {};
  return {
    statusCode: (extensions['statusCode'] as number) || 500,
    message: error.message || 'Internal Server Error',
  };
}
