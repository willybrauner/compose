export const HomePageMock = () => `
  <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Home</title>
      </head>
      <body>        
        <!-- CONTAINER -->
        <main class="App" data-component="App" data-page-transition-container>
          <header>  
            <nav>
              <a class="Link Link_home" href="/" data-page-transition-url="/">home</a>
              <a class="Link Link_about" href="/about.html" data-page-transition-url="about.html">about</a>
              <a class="Link Link_notFound" href="/notexist.html" data-page-transition-url="notexist.html">notexist</a>
            </nav>
          </header>
          <!-- WRAPPER -->
          <div class="App_stack" data-page-transition-wrapper>
            <div class="HomePage Page" data-component="HomePage">
              <section class="HomePage_section">Home page section 1</section>
              <section class="HomePage_section">Home page section 2</section>
              
             <div class="Button" data-component="Button">foo</div> 
             <div class="Button" data-component="Button">foo</div> 
            </div>
          </div>
          <footer class="App_footer Footer" data-component="Footer">footer</footer>
        </main>
      </body>
  </html>
`
