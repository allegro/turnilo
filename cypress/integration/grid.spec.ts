/*
 * Copyright 2017-2022 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
context("Grid", () => {

  const grid = () => cy.get(".grid");
  const rows = () => grid().find(".split-value");

  const urls = {
    // tslint:disable-next-line:max-line-length
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
