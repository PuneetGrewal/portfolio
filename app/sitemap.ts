export const baseUrl = 'https://portfolio-blog-starter.vercel.app';

export default async function sitemap() {
  // Define the routes you want in the sitemap
  let routes = ['', '/blog'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0], // current date in ISO format
  }));

  // Return the routes
  return routes;
}
