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

describe('ExternalView', () => {
  it('open share menu and find example externalView', () => {
    cy.visit('http://localhost:9090/#covid19/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0408SqGOAygKZobYDmZe2MCClGALZNkOJvhABRNAGMA9AFUAKgGEKIAGYQEaJgCcuAbVBoAngAdxBIeMp6mGiTfU2ACvqwATI6E8w96Fi4BK4AjACa6lC65vgAtKECFlYgCOhM0SAAvgC6uZRQ5khoRjkFHhn4xiD2GvpM2DIpMnBQlZQamHqC6PgmyRKeDnC8aOpgiDAp2UmWEsKt/uJZ5KC19Y0pQ+gAFmQdXT1jeP1zBEMaIzrjk9MrhAMEC7D2M2sOG01OGSXqnd29E4PM4gC5XMaUCYIKYSGbAlLPJZvGofeybCQTGQyCDYQI4faaQ6A05bYajG7Qu6zBFMRavfIgcw47BMTwAEQgwmwUCCRlSmBa9FwZUZzNZDC6xxALTaZCyQA=')

    cy.get('div.icon-button:nth-child(3)').click()
    cy.contains('Example externalView')
  })
})


  
