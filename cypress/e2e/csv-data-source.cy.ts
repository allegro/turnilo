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
context("CSV Data Source", () => {

  const count = () => cy.get(".total .measure-value");
  const leftGutter = () => cy.get(".table .left-gutter");
  const body = () => cy.get(".table .body");
  const splitValue = (idx: number) => leftGutter().get(`.split-value:nth-child(${idx})`);
  const measureValue = (idx: number) => body().get(`.measure-row:nth-child(${idx}) .measure-label`);

  function assertDates(...dates: string[]) {
    dates.forEach((date, idx) => {
      splitValue(idx + 1).should("contain", date);
    });
  }

  function assertValues(...values: string[]) {
    values.forEach((value, idx) => {
      measureValue(idx + 1).should("contain", value);
    });
  }

  describe("Data load", () => {
    const urls = {
      // tslint:disable:max-line-length
      baseView: "http://localhost:9090/#unemployment/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0408SqGOAygKZobYDmZe2MCClGALZNkOJvhABRNAGMA9AFUAKgGEKIAGYQEaJgCcuAbVBoAngAdxBIeMp6mGiQBN0twhGEAFfVidHQTjB66Fi4BJ4AjACy6lC65vgAtBECFlYgCK5xIAC+ALr5lFDmSGhGeUU+TP4g9hr6TNgy6TKYMNho6hqYeoLo+CZpzg5wvJ2UYIgw6bmplhLCcLD2uRUg5hDY2ExOACIejVCh5ZQbWzsMPZ0Ere2dOUA=",
      lastYearTable: "http://localhost:9090/#unemployment/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggACboFKq+ZAAKjlghLqAhMA7oWLgE0QCMAJpWUPbC+AC0Waqe3kL2BSBKALr11FDCSGiJhBXB6hGhUdhQ6cFh9lYcqdgwQg4QHsHZALL5mA5oPCABQQTDPR5eQ30DOFYhEAG8jBkgcFC8ZNgnnLXUSGoz+BOCjSBi02TtG447rdgvwYNhVtQ5Ms1Og1rtvCFAnBJhDwIgYN4nh09gQNNcUhQvsIINhsGQQgARA7pFx1ajE0nkpjLVYEUHg2pAA="
      // tslint:enable:max-line-length
    };

    it("should load last month count", () => {
      cy.visit(urls.baseView);

      count().should("contain", "15.0 k");
    });

    it("should load table for last year counts", () => {
      cy.visit(urls.lastYearTable);

      assertDates(
        "Total",
        "1 Mar 2009",
        "1 Apr 2009",
        "1 May 2009",
        "1 Jun 2009",
        "1 Jul 2009",
        "1 Aug 2009",
        "1 Sep 2009",
        "1 Oct 2009",
        "1 Nov 2009",
        "1 Dec 2009",
        "1 Jan 2010",
        "1 Feb 2010"
      );

      assertValues(
        "163.7 k",
        "13.2 k",
        "12.5 k",
        "13.0 k",
        "13.7 k",
        "13.8 k",
        "13.6 k",
        "13.4 k",
        "13.5 k",
        "13.2 k",
        "13.7 k",
        "15.1 k",
        "15.0 k"
      );

    });

  });
});
