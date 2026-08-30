export const baseUrl = 'https://pgrewal.co';

export default async function sitemap() {
  // Define the routes you want in the sitemap
  let routes = ['', '/projects', '/live', '/hobbies', '/notes'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0], // current date in ISO format
  }));

  // Return the routes
  return routes;
}
