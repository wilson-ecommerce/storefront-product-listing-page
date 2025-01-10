async function getGraphQL(
  query = '',
  variables = {},
  store = '',
  basicToken = '',
  graphqlEndpoint = ''
) {
  const endpoint = graphqlEndpoint || `${window.origin}/graphql`;

  const headers: {
    'Content-Type': string;
    Store: string;
    Authorization?: string;
  } = {
    'Content-Type': 'application/json',
    Store: store,
  };

  if (basicToken) {
    headers.Authorization = `Basic ${basicToken}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  }).then((res) => res.json());

  return response;
}

export { getGraphQL };
