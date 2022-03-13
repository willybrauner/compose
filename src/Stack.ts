import { Component } from "./Component"
import type { TProps } from "./Component"
import debug from "@wbe/debug"
const log = debug("compose:Stack")

export interface IPage {
  $pageRoot: HTMLElement
  pageName: string
  instance: any
  playIn?: () => Promise<void>
  playOut?: (comeFrom?: string, autoRemoveOnComplete?: boolean) => Promise<void>
  remove?: () => void
}

export type TPromiseRef = { reject: () => void }
export type TPages = { [x: string]: new (...rest: any[]) => Component }
export type TCurrentPage = Omit<IPage, "playIn">
export type TNewPage = Omit<IPage, "playOut">
export type TManagePageTransitionParams = {
  currentPage: TCurrentPage
  mountNewPage: () => Promise<TNewPage>
}
type TCache = {
  title: string
  $pageRoot?: HTMLElement
  pageName?: string
  instance?: any
  playIn?
}

const PARSER = new DOMParser()

/**
 * Stack
 * In order to get dynamic page fetching and refreshing without reload,
 * `Stack` extended class is a middleware class between our App root component
 * and `Component` extended class.
 */
export class Stack<Props = TProps> extends Component {
  // DOM attributes
  public static pageContainerAttr = "data-page-transition-container"
  public static pageWrapperAttr = "data-page-transition-wrapper"
  public static pageUrlAttr = "data-page-transition-url"

  // reload if document is fetching
  public forcePageReloadIfDocumentIsFetching: boolean = false
  // force all pages to reload instead the dynamic new document fetching process
  public forcePageReload: boolean = false
  // disable links during transition
  public disableLinksDuringTransitions: boolean = false
  public disableHistoryDuringTransitions: boolean = false

  // Register pages from parent class
  public addPages(): TPages {
    return
  }
  private pages: TPages

  // the current URL to request
  protected currentUrl: string = null
  protected currentPage: IPage
  protected prevPage: IPage
  protected isFirstPage = true

  // page container
  protected $pageContainer: HTMLElement
  protected $pageWrapper: HTMLElement

  // promise ref used in playIn and playOut medthods to keep reject promise
  protected playInPromiseRef: TPromiseRef = { reject: undefined }
  protected playOutPromiseRef: TPromiseRef = { reject: undefined }

  // check if new page document html is in fetching step
  private _fetching: boolean = false
  // check if page is in animate process
  private _pageIsAnimating: boolean = false
  // cache
  private _cache: { [url: string]: TCache }

  constructor($root: HTMLElement, props: Props) {
    // relay
    super($root, props)

    // init
    this.$pageContainer = this.getPageContainer()
    this.$pageWrapper = this.getPageWrapper(this.$pageContainer)
    this.pages = this.addPages()
    this.currentPage = this.getFirstCurrentPage()
    this._cache = {}

    // start patch history
    this.patchHistoryStates()

    // init method from extended Component class
    // IMPORTANT to init Component lifecicle after addding setting this.pages property
    this.init()

    // start page events
    this.start()
  }

  // --------------------------------------------------------------------------- LIFE CICLE

  /**
   * Start
   * @protected
   */
  protected start(): void {
    this.handleHistory()
    this.initHistoryEvent()
    this.listenLinks()
  }

  /**
   * Update
   * @protected
   */
  protected updateLinks(): void {
    this.unlistenLinks()
    this.listenLinks()
  }

  /**
   * Stop
   * @protected
   */
  protected stop(): void {
    this.removeHistoryEvent()
    this.unlistenLinks()
  }

  /**
   * Listen available dynamics links
   * @private
   */
  private listenLinks() {
    const links = this.getLinksWithAttr()
    links.forEach((item: HTMLElement) => {
      item?.addEventListener("click", this.handleLinks)
    })
  }

  /**
   * Stop to listen dynamics links
   * @private
   */
  private unlistenLinks() {
    const links = this.getLinksWithAttr()
    links.forEach((item: HTMLElement) => {
      item?.removeEventListener("click", this.handleLinks)
    })
  }

  /**
   * Initialize events
   * @private
   */
  private initHistoryEvent() {
    ;["pushState", "replaceState", "popstate"].forEach((event) => {
      window.addEventListener(event, this.handleHistory.bind(this))
    })
  }

  /**
   * Remove events
   * @private
   */
  private removeHistoryEvent() {
    ;["pushState", "replaceState", "popstate"].forEach((event) => {
      window.removeEventListener(event, this.handleHistory)
    })
  }

  // --------------------------------------------------------------------------- HANDLERS

  /**
   * Handle links
   * @param event
   */
  private handleLinks = (event): void => {
    if (!event) return
    // get page url attr
    const url = event?.currentTarget?.getAttribute(Stack.pageUrlAttr)
    // if disable transtiions is active, open new page
    if (this.forcePageReload) {
      window.open(url, "_self")
    }
    // prevent to following the link
    event.preventDefault()

    if (this.disableLinksDuringTransitions && this._pageIsAnimating) return

    // push it in history
    window.history.pushState({}, null, url)
  }

  /**
   * Handle history
   * @param event
   */
  private async handleHistory(event?): Promise<void> {
    if (this.disableHistoryDuringTransitions && this._pageIsAnimating) return

    // get URL to request
    const requestUrl = event?.["arguments"]?.[2] || window.location.pathname

    log("handleHistory > requestUrl", requestUrl)
    if (!requestUrl || requestUrl === this.currentUrl) return

    if ((this.forcePageReloadIfDocumentIsFetching && this._fetching) || this.forcePageReload) {
      log("handleHistory > security, force page reload...")
      window.open(requestUrl, "_self")
      return
    }

    // keep new request URL
    this.currentUrl = requestUrl

    // if page is animating
    if (this._pageIsAnimating) {
      // reject current promise playIn playOut
      this.playOutPromiseRef.reject?.()
      this.playInPromiseRef.reject?.()
      this._pageIsAnimating = false

      log(
        "handleHistory > page is animating, reject current transitions promises + remove page wrapper content"
      )
      // remove all page wrapper children
      this.$pageWrapper.querySelectorAll(":scope > *").forEach((el) => el.remove())
      // hack for the first load
      this.isFirstPage && (await new Promise((resolve) => setTimeout(resolve, 1)))
    }

    // Start page transition manager who resolve newPage obj
    try {
      const newPage = await this.pageTransitionsMiddleware({
        currentPage: this.prepareCurrentPage(),
        mountNewPage: () => this.prepareMountNewPage(requestUrl),
      })
      this.isFirstPage = false
      this._pageIsAnimating = false
      this.prevPage = this.currentPage
      this.currentPage = newPage
      this.updateLinks()
    } catch (e) {
      throw new Error("Error on page transition middleware")
    }
  }

  /**
   * Prepare current page
   */
  private prepareCurrentPage(): IPage | null {
    const page = this.currentPage

    // prepare remove dom page
    const _remove = () => {
      page.$pageRoot.remove()
    }

    // prepare playout
    const playOut = (goTo: string, autoRemoveOnComplete = true) => {
      // execute unmounted page method
      page.instance._unmounted()
      // store current playOut (specific anim first, default anim if first doesn't exist)
      const _playOutRef = page.instance._playOutRef.bind(page.instance)
      // return playOut function used by pageTransitons method
      return _playOutRef(goTo, this.playOutPromiseRef)
        .then(() => {
          autoRemoveOnComplete && _remove()
        })
        .catch(() => {})
    }

    // if is first page, return nothing
    if (this.isFirstPage) {
      return null
    }

    return {
      ...page,
      playOut,
      remove: _remove,
    }
  }

  /**
   *  Prepare mount new page
   *  - request new page or use page in cache
   *  - change title
   *  - inject new DOM in current DOM container
   *  - prepare playIn
   * @param requestUrl
   */
  private async prepareMountNewPage(requestUrl: string): Promise<IPage> {
    const { $pageRoot, pageName, instance } = this.currentPage

    // prepare playIn transition for new Page used by pageTransitons method
    const _preparePlayIn = (pageInstance): Promise<any> => {
      const _playInRef = pageInstance._playInRef.bind(pageInstance)
      return _playInRef(pageName, this.playInPromiseRef)?.catch?.(() => {})
    }

    // case of is first page
    if (this.isFirstPage) {
      // prettier-ignore
      this.addInCache(
        requestUrl,
        document.title,
        $pageRoot,
        pageName,
        instance,
        () => _preparePlayIn(instance)
      )

      return {
        $pageRoot,
        pageName,
        instance,
        playIn: () => _preparePlayIn(instance),
      }
    }

    const cache = this._cache?.[requestUrl]

    if (cache) {
      log("Use cache", cache)
      const { title, $pageRoot, pageName, instance, playIn } = cache
      this.addPageInDOM($pageRoot)
      this.updateMetas(title)
      return { $pageRoot, pageName, instance, playIn }
    }

    // fetch new document or use cache
    try {
      const newDocument = await this.fetchNewDocument(requestUrl, new AbortController())
      const $newPageWrapper = this.getPageWrapper(newDocument.body)
      const $newPageRoot = this.getPageRoot($newPageWrapper)
      const newPageName = this.getPageName($newPageRoot)
      const newPageInstance = this.getPageInstance(newPageName, $newPageRoot)

      this.addPageInDOM($newPageRoot)
      this.updateMetas(newDocument.title)

      // prettier-ignore
      this.addInCache(
        requestUrl,
        newDocument.title,
        $newPageRoot,
        newPageName,
        newPageInstance,
        () => _preparePlayIn(newPageInstance)
      )

      return {
        $pageRoot: $newPageRoot,
        pageName: newPageName,
        instance: newPageInstance,
        playIn: () => _preparePlayIn(newPageInstance),
      }
    } catch (e) {
      throw new Error(`Fetch new document failed on url: ${requestUrl}`)
    }
  }

  /**
   * Page transitions middleware
   * Default transition to override from parent component
   * @param currentPage
   * @param mountNewPage
   * @protected
   */
  protected pageTransitionsMiddleware({
    currentPage,
    mountNewPage,
  }: TManagePageTransitionParams): Promise<IPage> {
    return new Promise(async (resolve) => {
      // inject new page in DOM + create page class instance
      try {
        // fetch and get new page
        const newPage = await mountNewPage()

        // prepare playOut and pass automatically goTo newPage name as param
        const preparedCurrentPage = {
          ...currentPage,
          playOut: (goTo: string, autoRemoveOnComplete = true) =>
            currentPage?.playOut(newPage.pageName, autoRemoveOnComplete),
        }

        // called when transition is completed
        const resolver = () => {
          resolve(newPage)
        }

        // change page is animating state (need to be changed after mount new page)
        this._pageIsAnimating = true

        // return page transition function
        return this.pageTransitions(preparedCurrentPage, newPage, resolver)
      } catch (e) {
        log("mountNewPage failed", e)
      }
    })
  }

  /**
   * Page transition
   * @param currentPage
   * @param newPage
   * @param complete
   * @protected
   */
  protected async pageTransitions(
    currentPage: IPage,
    newPage: IPage,
    complete: () => void
  ): Promise<any> {
    await currentPage.playOut()
    await newPage.playIn()
    complete()
  }
  // --------------------------------------------------------------------------- PREPARE PAGE

  /**
   * Get page container HTMLElement
   * @private
   */
  private getPageContainer(): HTMLElement {
    return document.body.querySelector(`*[${Stack.pageContainerAttr}]`)
  }

  /**
   * Get page wrapper HTMLElement
   * @param $node
   * @private
   */
  private getPageWrapper($node: HTMLElement): HTMLElement {
    return $node.querySelector(`*[${Stack.pageWrapperAttr}]`)
  }

  /**
   * Get page root HTMLElement
   * @param $wrapper
   * @private
   */
  private getPageRoot($wrapper: HTMLElement): HTMLElement {
    return $wrapper.children[0] as HTMLElement
  }

  /**
   * Get page name
   * @param $pageRoot
   * @private
   */
  private getPageName($pageRoot: HTMLElement): string {
    for (const page of Object.keys(this.pages)) {
      if (page == $pageRoot.getAttribute(Component.componentAttr)) return page
    }
  }

  /**
   * Get page instance
   * @param pageName
   * @param $pageRoot
   * @private
   */
  private getPageInstance(pageName: string, $pageRoot?: HTMLElement): Component {
    const classComponent = this.pages[pageName]
    return classComponent ? new classComponent($pageRoot, {}, pageName) : null
  }

  /**
   * Get First current page
   * @private
   */
  private getFirstCurrentPage(): IPage {
    const $pageRoot = this.getPageRoot(this.$pageWrapper)
    const pageName = this.getPageName($pageRoot)
    const instance = this.getPageInstance(pageName, $pageRoot)
    const playIn = () => instance._playInRef()
    const playOut = () => instance._playOutRef()
    return { $pageRoot, pageName, instance, playIn, playOut }
  }

  /**
   * Add page in DOM
   * @param $pageRoot
   * @returns void
   */
  private addPageInDOM($pageRoot: HTMLElement): void {
    this.$pageWrapper.appendChild($pageRoot)
  }

  /**
   * Update Metas
   * @param newDocument
   */
  private updateMetas(title: string): void {
    document.title = title
  }

  /**
   * Add current page in cache cache
   */
  private addInCache(
    url: string,
    title: string,
    $pageRoot: HTMLElement,
    pageName: string,
    instance,
    playIn: () => Promise<void>
  ): void {
    this._cache = {
      ...this._cache,
      [url]: { title, $pageRoot, pageName, instance, playIn },
    }
  }

  // --------------------------------------------------------------------------- HELPERS

  /**
   * Get link with with URL ATTR
   */
  private getLinksWithAttr(): HTMLElement[] {
    return [
      // @ts-ignore
      ...this.$pageContainer?.querySelectorAll(`*[${Stack.pageUrlAttr}]`),
    ]
  }

  private parseDOM = (html) =>
    typeof html === "string" ? PARSER.parseFromString(html, "text/html") : html

  /**
   * Fetch new document from specific URL
   * @param url
   * @param controller
   * @protected
   */
  private async fetchNewDocument(url: string, controller: AbortController): Promise<Document> {
    // if document is already fetching, abort the current fetch
    if (this._fetching) {
      controller.abort()
      log("this._fetching = true, abort")
      this._fetching = false
    }

    // change is fetching state
    this._fetching = true

    const response = await fetch(url, {
      signal: controller.signal,
      mode: "same-origin",
      method: "GET",
      credentials: "same-origin",
    })

    if (response.status >= 200 && response.status < 300) {
      const html = await response.text()
      this._fetching = false
      return this.parseDOM(html)
    } else {
      this._fetching = false
      throw new Error("Something went wrong")
    }
  }

  /**
   * While History API does have `popstate` event, the only
   * proper way to listen to changes via `push/replaceState`
   * is to monkey-patch these methods.
   * https://stackoverflow.com/a/4585031
   * https://stackoverflow.com/questions/5129386/how-to-detect-when-history-pushstate-and-history-replacestate-are-used
   */
  private patchHistoryStates(): void {
    if (typeof window.history !== "undefined") {
      for (const type of ["pushState", "replaceState"]) {
        const original = window.history[type]
        window.history[type] = function () {
          const result = original.apply(this, arguments)
          const event = new Event(type)
          event["arguments"] = arguments
          window.dispatchEvent(event)
          return result
        }
      }
    }
  }
}
