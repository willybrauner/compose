import { Component, TNewComponent } from "./Component";

// export type TDeferredPromise<T> = {
//   promise: Promise<T>;
//   resolve: (resolve?: T) => void;
//   reject: (error?: Error | any) => void;
// };

export type TPageList = { [x: string]: TNewComponent<any, any> };

// default transitions used instead specific page transitions methods
// They can be implemented on parent Class
export interface IDefaultPageTransitions {
  defaultPlayIn({ $root, goFrom }: { $root: HTMLElement; goFrom?: string }): Promise<void>;
  defaultPlayOut({ $root, goTo }: { $root: HTMLElement; goTo?: string }): Promise<void>;
}

export interface IPage {
  $pageRoot: HTMLElement;
  pageName: string;
  instance: any;
  playIn?: () => Promise<void>;
  playOut?: (goFrom?: string, autoRemoveOnComplete?: boolean) => Promise<void>;
  remove?: () => void;
}

export type TCurrentPage = Omit<IPage, "playIn">;
export type TNewPage = Omit<IPage, "playOut">;
export type TManagePageTransitionParams = {
  currentPage: TCurrentPage;
  mountNewPage: () => Promise<TNewPage>;
};

// function MakeQuerablePromise(promise) {
//   // Don't modify any promise that has been already modified.
//   if (promise.isFulfilled) return promise;
//
//   // Set initial state
//   let isPending = true;
//   let isRejected = false;
//   let isFulfilled = false;
//
//   // Observe the promise, saving the fulfillment in a closure scope.
//   let result = promise.then(
//     function (v) {
//       isFulfilled = true;
//       isPending = false;
//       return v;
//     },
//     function (e) {
//       isRejected = true;
//       isPending = false;
//       throw e;
//     }
//   );
//
//   result.isFulfilled = function () {
//     return isFulfilled;
//   };
//   result.isPending = function () {
//     return isPending;
//   };
//   result.isRejected = function () {
//     return isRejected;
//   };
//   return result;
// }
//
// /**
//  * @name deferredPromise
//  * @return TDeferredPromise
//  */
// function deferredPromise<T>(): TDeferredPromise<T> {
//   const deferred: TDeferredPromise<T> | any = {};
//   deferred.promise = MakeQuerablePromise(
//     new Promise((resolve, reject) => {
//       deferred.resolve = resolve;
//       deferred.reject = reject;
//     })
//   );
//   return deferred;
// }

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
  public documentIsFetching: boolean = false;
  public pageIsAnimating: boolean = false;
  public disableTranstitions: boolean = false;

  protected currentUrl: string = null;
  protected currentPage: IPage;
  protected prevPage: IPage;
  protected isFirstPage = true;

  // Register pages from parent class
  protected _pageList: TPageList;
  protected pages(): TPageList {
    return {};
  }

  protected playInPromiseRef = { reject: undefined };
  protected playOutPromiseRef = { reject: undefined };

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
    // prevent to following the link
    event.preventDefault();
    // get page url attr
    const url = event?.currentTarget?.getAttribute(Stack.pageUrlAttr);
    // push it in history
    window.history.pushState({}, null, url);
  }

  /**
   * Handle history
   * @param event
   */
  private async handleHistory(event?): Promise<void> {
    // get URL to request
    // const pathname = window.location.pathname;
    // const firstUrl =
    //   pathname[0] === "/" && pathname !== "/"
    //     ? pathname.slice(1, pathname.length)
    //     : pathname;

    const requestUrl = event?.["arguments"]?.[2] || window.location.href;

    // check before continue
    if (!requestUrl || requestUrl === this.currentUrl) return;

    // keep new request URL
    this.currentUrl = requestUrl;

    // if page is animating
    if (this.pageIsAnimating) {
      console.log("pageIsAnimating > reject");
      // reject current promise playIn playOut
      this.playOutPromiseRef.reject?.();
      this.playInPromiseRef.reject?.();
      this.pageIsAnimating = false;
      // remove all page wrapper children
      this.$pageWrapper.querySelectorAll("*").forEach((el) => el.remove());
    }

    // Start page transition manager who resolve newPage obj
    try {
      const newPage = await this.pageTransitionsMiddleware({
        currentPage: this.prepareCurrentPage(),
        mountNewPage: () => this.mountNewPage(requestUrl),
      });
      this.isFirstPage = false;
      this.pageIsAnimating = false;
      this.prevPage = this.currentPage;
      this.currentPage = newPage;
    } catch (e) {
      console.warn("error on page transition", e);
    }
  }

  /**
   * Prepare current page
   */
  private prepareCurrentPage(): IPage | null {
    const page = this.currentPage;

    // prepare remove dom page
    const _remove = () => {
      page.$pageRoot.remove();
    };

    // prepare playout
    const playOut = (goTo: string, autoRemoveOnComplete = true) => {
      // execute unmounted page method
      page.instance._unmounted();

      // store current playOut (specific anim first, default anim if first doesn't exist)
      const playOut =
        page.instance?.playOut?.bind(page.instance) || this.constructor.prototype?.defaultPlayOut;

      // case there is no available playOut method
      if (!playOut) {
        return Promise.resolve().then(() => _remove());
      }

      // return playOut function used by pageTransitons method
      return playOut({ $root: page.$pageRoot, goTo, promiseRef: this.playOutPromiseRef })
        .then(() => {
          autoRemoveOnComplete && _remove();
        })
        .catch(() => {});
    };

    // if is first page, return nothing
    if (this.isFirstPage) {
      return null;
    }

    return {
      ...page,
      playOut,
      remove: _remove,
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
    const _preparePlayIn = (pageInstance): Promise<any> => {
      // select playIn method
      const playIn =
        pageInstance.playIn?.bind(pageInstance) || this.constructor.prototype?.defaultPlayIn;

      // case there is no available playIn method, resolve the promise
      if (!playIn) {
        console.log("!playIn || this.pageIsAnimating, resolve");
        return Promise.resolve();
      }

      // return playIn function used by pageTransitons method
      return playIn({
        $root: pageInstance.$root,
        goFrom: this.currentPage.pageName,
        promiseRef: this.playInPromiseRef,
      }).catch(() => {});
    };

    // case of is first page
    if (this.isFirstPage) {
      const page = this.currentPage;

      return {
        $pageRoot: page.$pageRoot,
        pageName: page.pageName,
        instance: page.instance,
        playIn: () => _preparePlayIn(page.instance),
      };
    }

    try {
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

      return {
        $pageRoot: newPageRoot,
        pageName: newPageName,
        instance: newPageInstance,
        playIn: () => _preparePlayIn(newPageInstance),
      };
    } catch (e) {
      throw new Error(`Fetch new document failed on url: ${requestUrl}`);
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
        const newPage = await mountNewPage();

        // prepare playOut and pass automatically goTo newPage name as param
        const preparedCurrentPage = {
          ...currentPage,
          playOut: (goTo: string, autoRemoveOnComplete = true) =>
            currentPage?.playOut(newPage.pageName, autoRemoveOnComplete),
        };

        // called when transition is completed
        const resolver = () => {
          resolve(newPage);
        };

        // change page is animating state (need to be changed after mount new page)
        this.pageIsAnimating = true;

        // return page transition function
        return this.pageTransitions(preparedCurrentPage, newPage, resolver);
      } catch (e) {
        throw new Error("mountNewPage error");
      }
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
  private fetchNewDocument(url: string): Promise<any> {
    this.documentIsFetching = true;
    return fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error("Something went wrong");
        }
      })
      .then((html) => {
        this.documentIsFetching = false;
        const parser = new DOMParser();
        return parser.parseFromString(html, "text/html");
      })
      .catch((error) => {
        this.documentIsFetching = false;
        throw new Error("Fetch new document failed");
      });

    // try {
    //   const data = await fetch(url);
    //   const html = await data.text();
    //   const parser = new DOMParser();
    //   return parser.parseFromString(html, "text/html");
    // } catch (e) {
    //   throw new Error("Fetch new document failed");
    // }
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
