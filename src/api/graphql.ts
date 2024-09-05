const graphqlEndpoint = `https://qual-it.ecom.wilson.com/en-us/graphql`;
const basicToken = 'd2lsc29udGVhbXNob3AtZGV2OndpbHMwbnRlYW1zaDBwLUQzVg==';

async function getGraphQL(query = '', variables = {}, store = '') {
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

export { getGraphQL };
