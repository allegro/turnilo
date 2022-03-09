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

import jsonLanguage from "highlight.js/lib/languages/json";
import React from "react";
/* Imported from `/src/` to save on bundle size.
 * Luckily untranspiled source code is avaiable within npm package. */
import SyntaxHighlighter from "react-syntax-highlighter/src/light";
import githubGist from "react-syntax-highlighter/src/styles/hljs/github-gist";

SyntaxHighlighter.registerLanguage("json", jsonLanguage);

const Highlighter: React.FunctionComponent = ({ children: source }) =>
    <SyntaxHighlighter className="source-modal__source" language="json" style={githubGist}>
        {source}
    </SyntaxHighlighter>;

export default Highlighter;
