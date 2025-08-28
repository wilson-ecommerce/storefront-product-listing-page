async function getGraphQL(
  query = '',
  variables = {},
  store = '',
  basicToken = '',
  graphqlEndpoint = '',
  method = 'POST',
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
    headers.Authorization = basicToken;
  }

  let response;
  if (method === 'GET') {
    const params = new URLSearchParams({
      query: query.replace(/(?:\r\n|\r|\n|\t|[\s]{4})/g, ' ').replace(/\s\s+/g, ' '),
      variables: JSON.stringify(variables),
    });
    response = await fetch(
      `${endpoint}?${params.toString()}`,
      { headers },
    ).then((res) => res.json());
  } else {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
      credentials: 'include',
    }).then((res) => res.json());
  }

  return response;
}

export { getGraphQL };
