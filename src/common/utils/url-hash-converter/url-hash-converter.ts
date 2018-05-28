/*
 * Copyright 2017-2018 Allegro.pl
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

import { DataCube, Essence, Manifest } from "../../models";
import {
  DEFAULT_VIEW_DEFINITION_VERSION,
  definitionConverters,
  definitionUrlEncoders,
  LEGACY_VIEW_DEFINITION_VERSION,
  version2Visualizations,
  ViewDefinitionVersion
} from "../../view-definitions";

const SEGMENT_SEPARATOR = "/";
const MINIMAL_HASH_SEGMENTS_COUNT = 2;

export interface UrlHashConverter {
  essenceFromHash(hash: string, dataCube: DataCube, visializations: Manifest[]): Essence;

  toHash(essence: Essence, version?: ViewDefinitionVersion): string;
}

function isLegacyWithVisualizationPrefix(hashParts: string[]) {
  return version2Visualizations.indexOf(hashParts[0]) !== -1 && hashParts[1] === LEGACY_VIEW_DEFINITION_VERSION && hashParts.length >= 3;
}

function isModernWithNoVisualizationPrefix(hashParts: string[]) {
  return hashParts[0] === "3";
}

interface HashSegments {
  readonly version: ViewDefinitionVersion;
  readonly encodedModel: string;
  readonly visualization?: string;
}

function getHashSegments(hash: string): HashSegments {
  const hashParts = hash.split(SEGMENT_SEPARATOR);

  if (hashParts.length < MINIMAL_HASH_SEGMENTS_COUNT) {
    throw new Error(`Expected ${MINIMAL_HASH_SEGMENTS_COUNT} hash segments, got ${hashParts.length}.`);
  }

  if (isLegacyWithVisualizationPrefix(hashParts)) {
    return {
      version: hashParts[1] as ViewDefinitionVersion,
      encodedModel: hashParts.splice(2).join(SEGMENT_SEPARATOR),
      visualization: hashParts[0]
    };
  } else if (isModernWithNoVisualizationPrefix(hashParts)) {
    return {
      version: hashParts[0] as ViewDefinitionVersion,
      encodedModel: hashParts.splice(1).join(SEGMENT_SEPARATOR),
      visualization: undefined
    };
  } else {
    throw new Error(`Unsupported url hash: ${hash}.`);
  }
}

export const urlHashConverter: UrlHashConverter = {
  essenceFromHash(hash: string, dataCube: DataCube, visualizations: Manifest[]): Essence {
    const { version, encodedModel, visualization } = getHashSegments(hash);

    const urlEncoder = definitionUrlEncoders[version];
    const definitionConverter = definitionConverters[version];

    const definition = urlEncoder.decodeUrlHash(encodedModel, visualization);
    return definitionConverter.fromViewDefinition(definition, dataCube, visualizations);
  },

  toHash(essence: Essence, version: ViewDefinitionVersion = DEFAULT_VIEW_DEFINITION_VERSION): string {
    const { visualization } = essence;

    const urlEncoder = definitionUrlEncoders[version];
    const definitionConverter = definitionConverters[version];

    if (urlEncoder == null || definitionConverter == null) {
      throw new Error(`Unsupported url hash version: ${version}.`);
    }

    const definition = definitionConverter.toViewDefinition(essence);
    const encodedDefinition = urlEncoder.encodeUrlHash(definition);

    const hashParts = [version, encodedDefinition];

    if (version === LEGACY_VIEW_DEFINITION_VERSION) {
      hashParts.unshift(visualization.name);
    }

    return hashParts.join(SEGMENT_SEPARATOR);
  }
};
