const parser = new DOMParser()
let IS_FETCHING = false

/**
 * Fetch new document from specific URL
 * @param pathname
 * @param controller
 */
export async function fetchDOM(
  pathname: string,
  controller: AbortController = new AbortController(),
): Promise<Document> {
  if (IS_FETCHING) {
    controller.abort()
    IS_FETCHING = false
    return
  }
  IS_FETCHING = true
  const response = await fetch(pathname, {
    signal: controller.signal,
    method: "GET",
  })
  if (response.status >= 200 && response.status < 300) {
    const html = await response.text()
    IS_FETCHING = false
    return typeof html === "string" ? parser.parseFromString(html, "text/html") : html
  }
  IS_FETCHING = false
}
