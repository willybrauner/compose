import { Component, TNewComponent } from "./Component";

export type TPageList = { [x: string]: TNewComponent<any, any> };

/**
 * default transitions used instead specific page transitions methods
 * They can be implemented on parent Class
 */
export interface IDefaultPageTransitions {
  defaultPlayIn({ $root, goFrom }: { $root: HTMLElement; goFrom?: string }): Promise<void>;
  defaultPlayOut({ $root, goTo }: { $root: HTMLElement; goTo?: string }): Promise<void>;
}

export interface IPage {
  $pageRoot: HTMLElement;
  pageName: string;
  instance: any;
  playIn?: () => Promise<void>;
  playOut?: (goFrom?: string, autoUnmountOnComplete?: boolean) => Promise<void>;
  unmount?: () => void;
}

export type TCurrentPage = Omit<IPage, "playIn">;
export type TNewPage = Omit<IPage, "playOut">;
export type TManagePageTransitionParams = {
  currentPage: TCurrentPage;
  mountNewPage: () => Promise<TNewPage>;
};

/**
 * Stack
 * In order to get dynamic page fetching and refreshing without reload,
 * `Stack` extended class is a middleware class between our App root component
 * and `Component` extended class.
 */
export class Stack extends Component {
  public static pageContainerAttr = "data-page-transition-container";
  public static pageWrapperAttr = "data-page-transition-wrapper";
  public static pageUrlAttr = "data-page-transition-url";

  public $pageContainer: HTMLElement;
  public $pageWrapper: HTMLElement;
  public pageIsAnimating: boolean = false;
  public disableTranstitions:boolean = false;

  protected currentUrl: string = null;
  protected currentPage: IPage;
  protected prevPage: IPage;
  protected isFirstPage = true;

  // Register pages from parent class
  protected _pageList: TPageList;
  protected pages(): TPageList {
    return {};
  }

  constructor($root, props) {
    super($root, props);
    this.$pageContainer = this.getPageContainer() || $root;
    this.$pageWrapper = this.getPageWrapper(this.$pageContainer);
    this._pageList = this.pages();
    this.currentPage = this.getFirstCurrentPage();
    // start patch history
    this.patchHistoryStates();
    // start page events
    this.start();
  }

  // --------------------------------------------------------------------------- LIFE CICLE

  /**
   * Start
   * @protected
   */
  protected start(): void {
    this.initEvents();
    this.handleHistory();
  }

  /**
   * Update
   * @protected
   */
  protected update(): void {
    this.removeEvents();
    this.initEvents();
  }

  /**
   * Stop
   * @protected
   */
  protected stop(): void {
    this.removeEvents();
  }

  /**
   * Initialize events
   * @private
   */
  private initEvents() {
    const links = this.getLinksWithAttr();
    links.forEach((item: HTMLElement) => {
      item?.addEventListener("click", this.handleLinks.bind(this));
    });
    ["pushState", "replaceState", "popstate"].forEach((event) => {
      window.addEventListener(event, this.handleHistory.bind(this));
    });
  }

  /**
   * Remove events
   * @private
   */
  private removeEvents() {
    const links = this.getLinksWithAttr();
    links.forEach((item: HTMLElement) => {
      item?.removeEventListener("click", this.handleLinks);
    });
    ["pushState", "replaceState", "popstate"].forEach((event) => {
      window.removeEventListener(event, this.handleHistory);
    });
  }

  // --------------------------------------------------------------------------- HANDLERS

  /**
   * Handle links
   * @param event
   */
  private handleLinks(event): void {

    if (!event || this.disableTranstitions) return;
    event.preventDefault();

    if (this.pageIsAnimating) return;
    const url = event?.currentTarget?.getAttribute(Stack.pageUrlAttr);
    window.history.pushState({}, null, url);
  }

  /**
   * Handle history
   * @param event
   */
  private async handleHistory(event?): Promise<void> {
    if (this.pageIsAnimating) return;

    // get URL to request
    // const pathname = window.location.pathname;
    // const firstUrl =
    //   pathname[0] === "/" && pathname !== "/"
    //     ? pathname.slice(1, pathname.length)
    //     : pathname;

    const requestUrl = event?.["arguments"]?.[2] || window.location.href;

    if (!requestUrl || requestUrl === this.currentUrl) return;
    this.currentUrl = requestUrl;
    this.pageIsAnimating = true;

    // Start page transition manager who resolve newPage obj
    try {
      const newPage = await this.pageTransitionsMiddleware({
        currentPage: this.prepareCurrentPage(),
        mountNewPage: () => this.mountNewPage(requestUrl),
      });
      this.prevPage = this.currentPage;
      this.currentPage = newPage;
      this.pageIsAnimating = false;
      this.isFirstPage = false;
    } catch (e) {
      console.warn("error on page transition...", e);
    }
  }

  /**
   * Prepare current page
   */
  private prepareCurrentPage(): IPage | null {
    const page = this.currentPage;

    // prepare unmount
    const unmount = () => {
      page.$pageRoot.remove();
    };

    // prepare playout
    const playOut = (goTo: string, autoUnmountOnComplete = true) => {
      page.instance._unmounted();
      const playOut =
        page.instance?.playOut?.bind(page.instance) || this.constructor.prototype?.defaultPlayOut;

      // case there is no available playOut method
      if (!playOut) {
        return Promise.resolve().then(() => unmount());
      }

      return playOut({ $root: page.$pageRoot, goTo }).then(() => {
        autoUnmountOnComplete && unmount();
      });
    };

    if (this.isFirstPage) {
      return null;
    }

    return {
      ...page,
      playOut,
      unmount,
    };
  }

  /**
   *  Prepare mount new page
   *  - request new page
   *  - change title
   *  - inject new DOM in current DOM container
   *  - prepare playIn
   * @param requestUrl
   */
  private async mountNewPage(requestUrl: string): Promise<IPage> {
    // prepare playIn transition for new Page
    const preparePlayIn = (pageInstance): Promise<any> => {
      const playIn =
        pageInstance.playIn?.bind(pageInstance) || this.constructor.prototype?.defaultPlayIn;

      // case there is no available playIn method
      if (!playIn) {
        return Promise.resolve();
      }

      return playIn({ $root: pageInstance.$root, goFrom: this.currentPage.pageName });
    };

    // case of is first page
    if (this.isFirstPage) {
      const page = this.currentPage;

      return {
        $pageRoot: page.$pageRoot,
        pageName: page.pageName,
        instance: page.instance,
        playIn: () => preparePlayIn(page.instance),
      };
    }

    // fetch new page document
    const newDocument = await this.fetchNewDocument(requestUrl);

    // change page title
    document.title = newDocument.title;

    // inject new page content in pages Container
    const newPageWrapper = this.getPageWrapper(newDocument.body);
    const newPageRoot = this.getPageRoot(newPageWrapper);
    this.$pageWrapper.appendChild(newPageRoot);

    //  instance the page after append it in DOM
    const newPageName = this.getPageName(newPageRoot);
    const newPageInstance = this.getPageInstance(newPageName, newPageRoot);

    // update local stack events (history)
    this.update();

    return {
      $pageRoot: newPageRoot,
      pageName: newPageName,
      instance: newPageInstance,
      playIn: () => preparePlayIn(newPageInstance),
    };
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
      const newPage = await mountNewPage();
       newPage.$pageRoot.style.visibility = "hidden";

      // allow to prepare playOut and pass automatically newPage name
      const preparedCurrentPage = {
        ...currentPage,
        playOut: (goTo: string, autoUnmountOnComplete = true) =>
          currentPage?.playOut(newPage.pageName, autoUnmountOnComplete),
      };

      // called when transition is completed
      const resolver = () => {
        newPage.$pageRoot.style.visibility = "visible";
        resolve(newPage);
      };

      return this.pageTransitions(preparedCurrentPage, newPage, resolver);
    });
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
    await currentPage.playOut();
    await newPage.playIn();
    complete();
  }
  // --------------------------------------------------------------------------- PREPARE PAGE

  /**
   * Get page container HTMLElement
   * @param $node
   * @private
   */
  private getPageContainer($node: HTMLElement = document.body): HTMLElement {
    return $node.querySelector(`*[${Stack.pageContainerAttr}]`);
  }

  /**
   * Get page wrapper HTMLElement
   * @param $node
   * @private
   */
  private getPageWrapper($node: HTMLElement): HTMLElement {
    return $node.querySelector(`*[${Stack.pageWrapperAttr}]`);
  }

  /**
   * Get page root HTMLElement
   * @param $wrapper
   * @private
   */
  private getPageRoot($wrapper: HTMLElement): HTMLElement {
    return $wrapper.children[$wrapper.children?.length - 1 || 0] as HTMLElement;
  }

  /**
   * Get page name
   * @param $pageRoot
   * @private
   */
  private getPageName($pageRoot: HTMLElement): string {
    for (const page of Object.keys(this._pageList)) {
      if (page == $pageRoot.getAttribute(Component.componentAttr)) return page;
    }
  }

  /**
   * Get page instance
   * @param pageName
   * @param $pageRoot
   * @private
   */
  private getPageInstance(pageName: string, $pageRoot?: HTMLElement): Component {
    const classComponent = this._pageList[pageName];
    return classComponent ? new classComponent($pageRoot, {}, pageName) : null;
  }

  /**
   * Get First current page
   * @private
   */
  private getFirstCurrentPage(): IPage {
    const $pageRoot = this.getPageRoot(this.$pageWrapper);
    const pageName = this.getPageName($pageRoot);
    const instance = this.getPageInstance(pageName, $pageRoot);
    const playIn = () => instance?.["playIn"]($pageRoot);
    const playOut = () => instance?.["playOut"]($pageRoot);
    return { $pageRoot, pageName, instance, playIn, playOut };
  }

  // --------------------------------------------------------------------------- HELPERS

  /**
   * Get link with with URL ATTR
   */
  private getLinksWithAttr(): HTMLElement[] {
    return [
      // @ts-ignore
      ...this.$pageContainer?.querySelectorAll(`*[${Stack.pageUrlAttr}]`),
    ];
  }

  /**
   * Fetch new document from specific URL
   * @param url
   * @protected
   */
  private async fetchNewDocument(url: string) {
    try {
      const data = await fetch(url);
      const html = await data.text();
      const parser = new DOMParser();
      return parser.parseFromString(html, "text/html");
    } catch (e) {
      throw new Error("Fetch new document failed");
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
        const original = window.history[type];
        window.history[type] = function () {
          const result = original.apply(this, arguments);
          const event = new Event(type);
          event["arguments"] = arguments;
          window.dispatchEvent(event);
          return result;
        };
      }
    }
  }
}
