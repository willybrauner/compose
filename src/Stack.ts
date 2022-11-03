import { Component, COMPONENT_ATTR } from "./Component"
import type { TProps } from "./Component"
import debug from "@wbe/debug"
import { BrowserHistory, HashHistory, MemoryHistory } from "history"
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
const PAGE_CONTAINER_ATTR = "data-page-transition-container"
const PAGE_WRAPPER_ATTR = "data-page-transition-wrapper"
const PAGE_URL_ATTR = "data-page-transition-url"

/**
 * Stack
 * In order to get dynamic page fetching and refreshing without reload,
 * `Stack` extended class is a middleware class between our App root component
 * and `Component` extended class.
 */
export class Stack<GProps = TProps> extends Component {
  /**
   * reload if document is fetching
   */
  public forcePageReloadIfDocumentIsFetching: boolean = false

  /**
   * force all pages to reload instead the dynamic new document fetching process
   */
  public forcePageReload: boolean = false

  /**
   * disable links during transition
   */
  public disableLinksDuringTransitions: boolean = false

  /**
   * disable history during transition
   */
  public disableHistoryDuringTransitions: boolean = false

  /**
   * Register pages from parent class
   * @returns
   */
  public addPages(): TPages {
    return {}
  }
  private pages: TPages

  /**
   *  the current URL to request
   */
  protected currentUrl: string = null

  /**
   * current page {IPage}
   */
  protected currentPage: IPage

  /**
   * previous page {IPage}
   */
  protected prevPage: IPage

  /**
   * is first page state
   */
  protected isFirstPage: boolean = true

  /**
   * page container DOM element
   */
  protected $pageContainer: HTMLElement

  /**
   * page wrapper DOM element
   */
  protected $pageWrapper: HTMLElement

  /**
   * promise ref used in playIn and playOut methods to keep reject promise
   */
  protected playInPromiseRef: TPromiseRef = { reject: undefined }
  protected playOutPromiseRef: TPromiseRef = { reject: undefined }

  /**
   * check if page is in animate process
   */
  protected _pageIsAnimating: boolean = false

  /**
   * check if new page document html is in fetching step
   */
  private _fetching: boolean = false

  /**
   * Page requested cache
   * this cache contains all visited/ requested pages information
   * used instead of re-fetch new Document
   */
  private _cache: { [url: string]: TCache }

  /**
   * History
   */
  protected history: BrowserHistory | HashHistory | MemoryHistory
  protected removeHistory

  /**
   * Construct
   * @param $root
   * @param props
   * @param history
   */
  constructor({
    $root,
    props,
    history,
  }: {
    $root: HTMLElement
    props: GProps
    history: BrowserHistory | HashHistory | MemoryHistory
  }) {
    super($root, props)
    this.history = history

    // init
    this.$pageContainer = Stack.getPageContainer()
    this.$pageWrapper = Stack.getPageWrapper(this.$pageContainer)
    this.pages = this.addPages()
    this.currentPage = this.getFirstCurrentPage()
    this._cache = {}

    // start page events
    this.start()
  }

  // --------------------------------------------------------------------------- LIFE CICLE

  /**
   * Start
   * @protected
   */
  protected start(): void {
    this.handleHistory(window.location.pathname)
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
    links?.forEach((item: HTMLElement) => {
      item?.addEventListener("click", this.handleLinks)
    })
  }

  /**
   * Stop to listen dynamics links
   * @private
   */
  private unlistenLinks() {
    const links = this.getLinksWithAttr()
    links?.forEach((item: HTMLElement) => {
      item?.removeEventListener("click", this.handleLinks)
    })
  }

  /**
   * Initialize events
   * @private
   */
  private initHistoryEvent() {
    this.removeHistory = this.history?.listen(({ location }) => {
      this.handleHistory(location.pathname)
    })
  }

  /**
   * Remove events
   * @private
   */
  private removeHistoryEvent() {
    this.removeHistory()
  }

  // --------------------------------------------------------------------------- HANDLERS

  /**
   * Handle links
   * @param event
   */
  private handleLinks = (event): void => {
    if (!event) return
    // get page url attr
    const url = event?.currentTarget?.getAttribute(PAGE_URL_ATTR)
    // if disable transitions is active, open new page
    if (this.forcePageReload) {
      window.open(url, "_self")
    }
    // prevent to following the link
    event.preventDefault()

    if (this.disableLinksDuringTransitions && this._pageIsAnimating) return

    // push it in history
    this.history.push(url)
  }

  /**
   * Handle history
   * @param pathname
   */
  private handleHistory = async (pathname): Promise<void> => {
    if (this.disableHistoryDuringTransitions && this._pageIsAnimating) return

    // get URL to request
    const requestUrl = pathname

    log("handleHistory > requestUrl", requestUrl)
    if (!requestUrl || requestUrl === this.currentUrl) return

    if (
      (this.forcePageReloadIfDocumentIsFetching && this._fetching) ||
      this.forcePageReload
    ) {
      log("handleHistory > security, force page reload...")
      window.open(requestUrl, "_self")
      return
    }

    // keep new request URL reference
    this.currentUrl = requestUrl

    if (this._pageIsAnimating) {
      log(
        `
        handleHistory > New request while page is animating.
        For security:  
         - Reject PlayOut & PlayIn anim promises;
         - Remove page wrapper content.
         `
      )
      // reject current promise playIn playOut
      this.playOutPromiseRef.reject?.()
      this.playInPromiseRef.reject?.()
      this._pageIsAnimating = false
      // remove all page wrapper children
      this.$pageWrapper.querySelectorAll(":scope > *").forEach((el) => el.remove())
      // hack before process the new transition
      await new Promise((resolve) => setTimeout(resolve, 1))
    }

    // Start page transition manager who resolve newPage obj
    try {
      const newPage = await this.pageTransitionsMiddleware({
        currentPage: this.prepareCurrentPage(),
        mountNewPage: () => this.prepareMountNewPage(requestUrl),
      })
      this.isFirstPage = false
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

    // prepare playOut
    const playOut = (goTo: string, autoRemoveOnComplete = true) => {
      // store current playOut (specific anim first, default anim if first doesn't exist)
      const _playOutRef = page.instance._playOutRef.bind(page.instance)
      // return playOut function used by pageTransitions method
      return _playOutRef(goTo, this.playOutPromiseRef)
        .then(() => {
          // Execute unmounted page method AFTER the playOut transition
          page.instance._unmounted()
          // Remove the page DOM
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

    // prepare playIn transition for new Page used by pageTransitions method
    const preparePlayIn = (pageInstance): Promise<any> => {
      const playInRef = pageInstance._playInRef.bind(pageInstance)
      return playInRef(pageName, this.playInPromiseRef)
        .then(() => {
          this._pageIsAnimating = false
        })
        ?.catch?.(() => {})
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
        () => preparePlayIn(instance)
      )

      return {
        $pageRoot,
        pageName,
        instance,
        playIn: () => preparePlayIn(instance),
      }
    }

    const cache = this._cache?.[requestUrl]
    if (cache) {
      log("Use cache", cache)
      const { title, $pageRoot, pageName, playIn } = cache

      const newPageInstance = this.createPageInstance(pageName, $pageRoot)
      log("Create new page instance from cache informations", newPageInstance)

      this.addPageInDOM($pageRoot)
      Stack.updateMetas(title)

      return { $pageRoot, pageName, instance: newPageInstance, playIn }
    }

    // fetch new document or use cache
    try {
      const newDocument = await this.fetchNewDocument(requestUrl, new AbortController())
      const $newPageWrapper = Stack.getPageWrapper(newDocument.body)
      const $newPageRoot = Stack.getPageRoot($newPageWrapper)
      const newPageName = this.getPageName($newPageRoot)
      const newPageInstance = this.createPageInstance(newPageName, $newPageRoot)

      this.addPageInDOM($newPageRoot)
      Stack.updateMetas(newDocument.title)

      this.addInCache(
        requestUrl,
        newDocument.title,
        $newPageRoot,
        newPageName,
        newPageInstance,
        () => preparePlayIn(newPageInstance)
      )

      return {
        $pageRoot: $newPageRoot,
        pageName: newPageName,
        instance: newPageInstance,
        playIn: () => preparePlayIn(newPageInstance),
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
        // before fetch promise
        await this.beforeFetch()

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

        // HACK to execute pageTransitions on next frame
        // we want to execute pageTransitions after new page instance was made
        // (page instance use the same hack to get his own instance)
        await new Promise((e) => setTimeout(e, 0))

        // return page transition function
        return this.pageTransitions(preparedCurrentPage, newPage, resolver)
      } catch (e) {
        console.error("mountNewPage failed", e)
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

  /**
   * Method to overwrite from parent class
   * @protected
   */
  protected beforeFetch(): Promise<void> {
    return Promise.resolve()
  }
  // --------------------------------------------------------------------------- PREPARE PAGE

  /**
   * Get page container HTMLElement
   * @private
   */
  private static getPageContainer(): HTMLElement {
    return document.body.querySelector(`*[${PAGE_CONTAINER_ATTR}]`)
  }

  /**
   * Get page wrapper HTMLElement
   * @param $node
   * @private
   */
  private static getPageWrapper($node: HTMLElement): HTMLElement {
    return $node.querySelector(`*[${PAGE_WRAPPER_ATTR}]`)
  }

  /**
   * Get page root HTMLElement
   * @param $wrapper
   * @private
   */
  private static getPageRoot($wrapper: HTMLElement): HTMLElement {
    return $wrapper.children[0] as HTMLElement
  }

  /**
   * Get page name
   * @param $pageRoot
   * @private
   */
  private getPageName($pageRoot: HTMLElement): string {
    for (const page of Object.keys(this.pages)) {
      if (page == $pageRoot.getAttribute(COMPONENT_ATTR)) return page
    }
  }

  /**
   * Get page instance
   * @param pageName
   * @param $pageRoot
   * @private
   */
  private createPageInstance(pageName: string, $pageRoot?: HTMLElement): Component {
    log("getPageInstance > pageName:", pageName)
    const classComponent = this.pages[pageName]
    return classComponent ? new classComponent($pageRoot, {}, pageName) : null
  }

  /**
   * Get First current page
   * @private
   */
  private getFirstCurrentPage(): IPage {
    const $pageRoot = Stack.getPageRoot(this.$pageWrapper)
    const pageName = this.getPageName($pageRoot)
    const instance = this.createPageInstance(pageName, $pageRoot)
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
   * @param title
   */
  private static updateMetas(title: string): void {
    document.title = title
  }

  /**
   * Add current page in cache
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
   * Get link with URL ATTR
   */
  private getLinksWithAttr(): HTMLElement[] {
    return Array.from(this.$pageContainer?.querySelectorAll(`*[${PAGE_URL_ATTR}]`))
  }

  private parseDOM = (html) =>
    typeof html === "string" ? PARSER.parseFromString(html, "text/html") : html

  /**
   * Fetch new document from specific URL
   * @param url
   * @param controller
   * @protected
   */
  private async fetchNewDocument(
    url: string,
    controller: AbortController
  ): Promise<Document> {
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
}
