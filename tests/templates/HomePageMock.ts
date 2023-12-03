export const HomePageMock = () => `
  <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Home</title>
      </head>
      <body>        
        <!-- CONTAINER -->
        <main class="App">
          <header>  
            <nav>
              <a class="Link Link_home" href="/">home</a>
              <a class="Link Link_about" href="/about.html">about</a>
              <a class="Link Link_notFound" href="/notexist.html">notexist</a>
            </nav>
          </header>
          <!-- WRAPPER -->
          <div class="App_stack">
            <div class="HomePage">
            Home
            <div class="Button">Hello</div>
            <div class="Button">Hello</div>
            </div>
          </div>
          <footer class="App_footer Footer">footer</footer>
        </main>
      </body>
  </html>
`
