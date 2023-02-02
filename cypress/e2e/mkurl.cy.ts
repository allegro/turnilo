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

import {
  ViewDefinitionConverter2Fixtures
} from "../../src/common/view-definitions/version-2/view-definition-converter-2.fixtures";
import { total } from "../../src/common/view-definitions/version-4/view-definition-4.fixture";

interface MkurlResponse {
  hash: string;
}

context("mkurl", () => {
  it("should return hash for version 4 view definition", () => {
    const body = {
      dataCubeName: "wiki",
      viewDefinitionVersion: "4",
      viewDefinition: total
    };

    cy.request("POST", "http://localhost:9090/mkurl", body).then((hash: Cypress.Response<MkurlResponse>) => {
      expect(hash.status).to.eq(200);
      expect(hash.body.hash).to.eq("#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0408SqGOAygKZobYDmZe2MCClGALZNkOJvhABRNAGMA9AFUAKgGEKIAGYQEaJgCcuAbVBoAngAdxBIeMp6mGiTfU2ACvqwATI6E8w96Fi4BK4AjAAi6lC65vgAtKECFlaaCJiY9p4gAL4AunmUUOZIaEa5hR5MPiD2GvpM2DIpMpgw2GjqGhmC6PgmyRKeDnC8HZRgiDApOUmWEsJwsPYzoLX1jSlwnkNZlF16PR14/XMEQxojOuoTCFMSM4QDBAtL4gUg5hDY2Eye4RDCbBQIJlSifb6/BgZI4gLY7HJAA===");
    });
  });

  it("should return hash for version 2 view definition", () => {
    const body = {
      dataCubeName: "wiki",
      viewDefinitionVersion: "2",
      viewDefinition: ViewDefinitionConverter2Fixtures.fullTable()
    };

    cy.request("POST", "http://localhost:9090/mkurl", body).then((hash: Cypress.Response<MkurlResponse>) => {
      expect(hash.status).to.eq(200);
      expect(hash.body.hash).to.eq("#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+EnCcZC6gUEQOaMEATAAMAIwArAC0KQCcWWlJpikpeCVlKQB0JSkAWlZk2AAmyenZeQUAzMWl5SXVJfVKALoqbp7ecQ4QnP6BwbwAFpHYZAhWcLyMuAQzVmCIMNH4ziCNIMPU2JiJ8opkY4QTwcSYAmSRc0G7UJKvidQDggji40A4jpcQNdbmCjo8PF5glMZhwvsFhHAOBRqJttgscEQZtxAYdjnhTgApRxkNTuC5XG74BQIZSUcaIgjI2bUALfEAwMQOczLJwbLZYHYgNToJb7UkuEAAPQAggASelQxl3FkPNlPDlQmBqYiONEEfhqDTYNAAGUaHDQiys0KZ9x5kSxMRAcTgCXwnWojRaeGwMEE1FeMGashAzgAlCARiNqFBhEg0F6EZMwSirE1wtgoBKFstsKt1inMH68KBecEmmsiFYs0jHBBjtR8wFxTh69FeEHc9QvNNMMGQInqEg1BBbhkUvDngRXu9Pp2C0Xez8/ozK9Xa/MCA27HBm0vvW2OyAu2Qe5KG1AB80hyAR1hx5OQNPZ/gMouDaGxqmuuVqbpKFpWra9qOlYHAOJEYa+rOdJ4GkKR7rcB58seTaqOegrtsS14QN2eJHv2g7cq+bZjsEn7fnO/7eOo2LEaBxYECxsHwaGQjTB4wQAAqmGkAASVhQFWmEgHW5EnmeBoEVeN53n2j6Uaiw40R+Khfr4P4hmGCDJhe0xkq4MmBNS2ADn28nUHIVbStJLbkQoYYAuApJ0bprlSh8sABJOWHWbZ5qYFGnmOQ4zk8Pq3gNu5dhysC3ifn5GhwIFFCPLyoXeHATQNi0DlOegcV+YlcAeSlRw+XhBqZdliaQsIMyrE0AAiG4SgqSwrGszpwBoqabKx0A7okrXtWQTRMFJdlNkoQA=");
    });
  });
});
