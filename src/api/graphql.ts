async function getGraphQL(
  query = '',
  variables = {},
  store = '',
  basicToken = '',
  graphqlEndpoint = ''
) {
  if (basicToken && graphqlEndpoint) {
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Store: store,
        Authorization: `Basic ${basicToken}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    }).then((res) => res.json());

    return response;
  }

  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Store: store },
    body: JSON.stringify({
      query,
      variables,
    }),
  }).then((res) => res.json());

  return response;
}

export { getGraphQL };
