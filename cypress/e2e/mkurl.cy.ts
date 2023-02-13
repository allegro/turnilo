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
      expect(hash.body.hash).to.eq("#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+EnCcZC6gUEQOaMEATAAMAIwArAC0KQCcWWlJpikpeCVlKQB0JSkAWlZk2AAmyenZeQUAzMWl5SXVJfVKALoqbp7ecQ4QnP6BwbwAFpHYZAhWcLyMuAQzVmCIMNH4ziCNIMPU2JiJ8opk1BAc1wHmcGL4CgjKlONewcRMAIyJE5kFdlBJIDEtQDggji40A4jpcQNdbkijmNCBNglMZhwwcFhHAOBRqJttgscEQZtxYYdjnhTgApRxkNTuC5XG6fe6PZ6YV7vHRfH5/SZIglEggwMQOczLJwbLZYHYgNToJb7RkuEAAPQAggASblo3l3b4PEBPF5kN4fS3inH/AjYGBqYiOGUgfhqDTYNAAGUaHDQiys6L5VuoDkiZJiIDicAS+E61EaLTw7sE1EBMGashAzgAlCARiNqFBhEg0ImPK6k1LZtQmuFsFA1QtlthVusq0LbqAAuCQE01kQrA3Jo4IMdWxAAqqcMFx1BeJnpdQvNNMFmQOXqEg1BBbhkUtjpwCgeRQQuA52VxCobyB6m8MP5gRx3Y4FPcQQ8pzvSY6LmQy7qmuG7NFuIA7lg+6HiAx6nvgGSXgBaIel6DhWG2D5dgQfoBsGobhlYHBxjmKanlyeBpCkb5DiAI6rhOf6qJhQHzqBS5Ut+0TQW2LZwbOe7BEhKFnhhjbqOSoEEU+ITyZRkQwEI0weMEAAKphpAAElYUCDjwLFfmO7H/o23EgW2fGERZ66biJ8HiQQkm+Kh2bqQglZJrOTKuGZcjstgG5sb+VhyEKmrMVeAkKOpMLgIyEkqC63gaO8MABIen4hQEYXePwBbJdFDixaZ8UWYldg6vC3hIdVWWwLl2IjqF4UEHATTji01DlZVH4ZWxtXJXCRxpZxjYtTlFB+cIMyrE0AAi7aPh2Jy+j2faRnAGjVps8nQC+iSootvZkE0TAmQJkVKEAA");
    });
  });
});
