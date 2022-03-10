context("Grid", () => {

  const grid = () => cy.get(".grid");
  const rows = () => grid().find(".split-value");

  const urls = {
    baseGrid: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwgDmAThACYgA0408SqGOAygKZobaFT7YwILUMAWxbIcLfCACiaAMYB6AKoAVAMJUQAMwgI0LYtzwBtUGgCeABwkFhE6sRabJtjbYAK+rGUMmQZGMToWLgEbgCMACIaUHoW+AC0YYKW1iAI6CwxIAC+ALp51FAWSGg+pimSMaScGmQQIthQwZKyABZw2NgsCNGYxGj4oA5OBHBkZCwUyVaVnpm1EA6yjCF+mbIs2HU11FakmBQEOdRIQhADeACsAAwFIFBzZSDD+psbkmMTU1p9QuiDIHMMwIE00cD4A2oYEQMFSx0BFQIIjgsAcxyGjle2HeIO6bEmGk0v3+eHKwLWYIhGmhCFhknhQNSyNREjuFggnUmEXqmyaOB8IDaHS6PWo2DgIiKcHe1GgACVMAAjTADXK7DldMhMPoXECfAnZIA=="
  };

  beforeEach(() => {
    cy.visit(urls.baseGrid);
  });

  it("should load grid", () => {
    grid().should("exist");
  });

  it("should load 29 rows", () => {
    rows().should("have.length", 29);
  });
});
