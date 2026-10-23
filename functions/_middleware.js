export async function onRequest(context) {
  const response = await context.next()

  if (response.status !== 404) {
    return response
  }

  const accept = context.request.headers.get('accept') || ''
  if (!accept.includes('text/html')) {
    return response
  }

  const url = new URL(context.request.url)
  const notFoundRequest = new Request(new URL('/404.html', url.origin), context.request)
  const notFoundResponse = await context.env.ASSETS.fetch(notFoundRequest)
  const headers = new Headers(notFoundResponse.headers)

  headers.set('X-Robots-Tag', 'noindex, follow')

  return new Response(notFoundResponse.body, {
    status: 404,
    headers,
  })
}
