/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { expect } from "chai";
import { Timezone } from "chronoshift";
import { Dataset } from "plywood";
import { SPLIT } from "../../config/constants";
import "../../utils/test-utils";
import { fillDataset, orderByTimeDimensionDecreasing, orderByTimeDimensionIncreasing, orderByValueDecreasing, orderByValueIncreasing } from "./dataset";

const rawDataset = {
    data: [
      {
          pv_count: 459481169,
          SPLIT: {
            type: "DATASET",
            data: [
                {
                  pv_count: 453304201,
                  service_id: "CM.991213.tz_pl",
                  SPLIT: {
                      type: "DATASET",
                      data: [
                        {
                            pv_count: 453291667,
                            site: "allegro.pl"
                        },
                        {
                            pv_count: 3969,
                            site: "translate.googleusercontent.com"
                        }
                      ]
                  }
                },
                {
                  pv_count: 6106737,
                  service_id: "CM.789253.tz_pl",
                  SPLIT: {
                      type: "DATASET",
                      data: [
                        {
                            pv_count: 6103414,
                            site: "archiwum.allegro.pl"
                        },
                        {
                            pv_count: 2351,
                            site: "translate.googleusercontent.com"
                        }
                      ]
                  }
                },
                {
                  pv_count: 6512,
                  service_id: "CM.181116.tz_pl",
                  SPLIT: {
                      type: "DATASET",
                      data: [
                        {
                            pv_count: 6512,
                            site: "bazawiedzy.allegrogroup.com"
                        }
                      ]
                  }
                }
            ]
          }
      }
    ]
} as any as Dataset;

const expectedDataset = {
  data: [
    {
        pv_count: 459481169,
        SPLIT: {
          type: "DATASET",
          data: [
              {
                pv_count: 453304201,
                service_id: "CM.991213.tz_pl",
                SPLIT: {
                    type: "DATASET",
                    data: [
                      {
                          pv_count: 453291667,
                          site: "allegro.pl"
                      },
                      {
                        pv_count: 0,
                        site: "archiwum.allegro.pl"
                      },
                      {
                        pv_count: 0,
                        site: "bazawiedzy.allegrogroup.com"
                      },
                      {
                          pv_count: 3969,
                          site: "translate.googleusercontent.com"
                      }
                    ]
                }
              },
              {
                pv_count: 6106737,
                service_id: "CM.789253.tz_pl",
                SPLIT: {
                    type: "DATASET",
                    data: [
                      {
                        pv_count: 0,
                        site: "allegro.pl"
                      },
                      {
                          pv_count: 6103414,
                          site: "archiwum.allegro.pl"
                      },
                      {
                        pv_count: 0,
                        site: "bazawiedzy.allegrogroup.com"
                      },
                      {
                          pv_count: 2351,
                          site: "translate.googleusercontent.com"
                      }
                    ]
                }
              },
              {
                pv_count: 6512,
                service_id: "CM.181116.tz_pl",
                SPLIT: {
                    type: "DATASET",
                    data: [
                      {
                        pv_count: 0,
                        site: "allegro.pl"
                      },
                      {
                          pv_count: 0,
                          site: "archiwum.allegro.pl"
                      },
                      {
                        pv_count: 6512,
                        site: "bazawiedzy.allegrogroup.com"
                      },
                      {
                          pv_count: 0,
                          site: "translate.googleusercontent.com"
                      }
                    ]
                }
              }
          ]
        }
    }
  ]
} as any as Dataset;

const expectedDatasetReversed = {
  data: [
    {
        pv_count: 459481169,
        SPLIT: {
          type: "DATASET",
          data: [
              {
                pv_count: 453304201,
                service_id: "CM.991213.tz_pl",
                SPLIT: {
                    type: "DATASET",
                    data: [
                      {
                        pv_count: 3969,
                        site: "translate.googleusercontent.com"
                    },
                    {
                      pv_count: 0,
                      site: "bazawiedzy.allegrogroup.com"
                    },
                    {
                      pv_count: 0,
                      site: "archiwum.allegro.pl"
                    },
                      {
                          pv_count: 453291667,
                          site: "allegro.pl"
                      }
                    ]
                }
              },
              {
                pv_count: 6106737,
                service_id: "CM.789253.tz_pl",
                SPLIT: {
                    type: "DATASET",
                    data: [
                      {
                        pv_count: 2351,
                        site: "translate.googleusercontent.com"
                    },
                    {
                      pv_count: 0,
                      site: "bazawiedzy.allegrogroup.com"
                    },
                    {
                      pv_count: 6103414,
                      site: "archiwum.allegro.pl"
                  },
                      {
                        pv_count: 0,
                        site: "allegro.pl"
                      }
                    ]
                }
              },
              {
                pv_count: 6512,
                service_id: "CM.181116.tz_pl",
                SPLIT: {
                    type: "DATASET",
                    data: [
                      {
                        pv_count: 0,
                        site: "translate.googleusercontent.com"
                    },
                    {
                      pv_count: 6512,
                      site: "bazawiedzy.allegrogroup.com"
                    },
                    {
                      pv_count: 0,
                      site: "archiwum.allegro.pl"
                  },
                      {
                        pv_count: 0,
                        site: "allegro.pl"
                      }
                    ]
                }
              }
          ]
        }
    }
  ]
} as any as Dataset;

const rawDatasetWithTimeDimension = {
    data: [
      {
          click: 6658963,
          SPLIT: {
            type: "DATASET",
            data: [
                {
                  page_route: "/kategoria/:alias",
                  click: 1701895,
                  SPLIT: {
                      type: "DATASET",
                      data: [
                        {
                            click: 141631,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T08:00:00.000Z",
                              end: "2019-04-08T09:00:00.000Z"
                            }
                        },
                        {
                            click: 281544,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T09:00:00.000Z",
                              end: "2019-04-08T10:00:00.000Z"
                            }
                        },
                        {
                            click: 294462,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T10:00:00.000Z",
                              end: "2019-04-08T11:00:00.000Z"
                            }
                        },
                        {
                            click: 292301,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T11:00:00.000Z",
                              end: "2019-04-08T12:00:00.000Z"
                            }
                        },
                        {
                            click: 285251,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T12:00:00.000Z",
                              end: "2019-04-08T13:00:00.000Z"
                            }
                        },
                        {
                            click: 276786,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T13:00:00.000Z",
                              end: "2019-04-08T14:00:00.000Z"
                            }
                        },
                        {
                            click: 129964,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T14:00:00.000Z",
                              end: "2019-04-08T15:00:00.000Z"
                            }
                        }
                      ]
                  }
                },
                {
                  page_route: "/oferta/:offerId",
                  click: 1613275,
                  SPLIT: {
                      type: "DATASET",
                      data: [
                        {
                            click: 141779,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T08:00:00.000Z",
                              end: "2019-04-08T09:00:00.000Z"
                            }
                        },
                        {
                            click: 284084,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T09:00:00.000Z",
                              end: "2019-04-08T10:00:00.000Z"
                            }
                        },
                        {
                            click: 283571,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T10:00:00.000Z",
                              end: "2019-04-08T11:00:00.000Z"
                            }
                        },
                        {
                            click: 275764,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T11:00:00.000Z",
                              end: "2019-04-08T12:00:00.000Z"
                            }
                        },
                        {
                            click: 262909,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T12:00:00.000Z",
                              end: "2019-04-08T13:00:00.000Z"
                            }
                        },
                        {
                            click: 249920,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T13:00:00.000Z",
                              end: "2019-04-08T14:00:00.000Z"
                            }
                        },
                        {
                            click: 115266,
                            __time: {
                              type: "TIME_RANGE",
                              start: "2019-04-08T14:00:00.000Z",
                              end: "2019-04-08T15:00:00.000Z"
                            }
                        }
                      ]
                  }
                }
            ]
          }
      }
    ]
} as any as Dataset;

const reversedDatasetWithTimeDimension = {
  data: [
    {
        click: 6658963,
        SPLIT: {
          type: "DATASET",
          data: [
              {
                page_route: "/kategoria/:alias",
                click: 1701895,
                SPLIT: {
                    type: "DATASET",
                    data: [
                      {
                        click: 129964,
                        __time: {
                          type: "TIME_RANGE",
                          start: "2019-04-08T14:00:00.000Z",
                          end: "2019-04-08T15:00:00.000Z"
                        }
                    },
                      {
                        click: 276786,
                        __time: {
                          type: "TIME_RANGE",
                          start: "2019-04-08T13:00:00.000Z",
                          end: "2019-04-08T14:00:00.000Z"
                        }
                    },
                      {
                        click: 285251,
                        __time: {
                          type: "TIME_RANGE",
                          start: "2019-04-08T12:00:00.000Z",
                          end: "2019-04-08T13:00:00.000Z"
                        }
                    },
                      {
                        click: 292301,
                        __time: {
                          type: "TIME_RANGE",
                          start: "2019-04-08T11:00:00.000Z",
                          end: "2019-04-08T12:00:00.000Z"
                        }
                    },
                      {
                        click: 294462,
                        __time: {
                          type: "TIME_RANGE",
                          start: "2019-04-08T10:00:00.000Z",
                          end: "2019-04-08T11:00:00.000Z"
                        }
                    },
                      {
                        click: 281544,
                        __time: {
                          type: "TIME_RANGE",
                          start: "2019-04-08T09:00:00.000Z",
                          end: "2019-04-08T10:00:00.000Z"
                        }
                    },
                      {
                          click: 141631,
                          __time: {
                            type: "TIME_RANGE",
                            start: "2019-04-08T08:00:00.000Z",
                            end: "2019-04-08T09:00:00.000Z"
                          }
                      }
                    ]
                }
              },
              {
                page_route: "/oferta/:offerId",
                click: 1613275,
                SPLIT: {
                    type: "DATASET",
                    data: [
                      {
                        click: 115266,
                        __time: {
                          type: "TIME_RANGE",
                          start: "2019-04-08T14:00:00.000Z",
                          end: "2019-04-08T15:00:00.000Z"
                        }
                    },
                    {
                      click: 249920,
                      __time: {
                        type: "TIME_RANGE",
                        start: "2019-04-08T13:00:00.000Z",
                        end: "2019-04-08T14:00:00.000Z"
                      }
                  },
                  {
                    click: 262909,
                    __time: {
                      type: "TIME_RANGE",
                      start: "2019-04-08T12:00:00.000Z",
                      end: "2019-04-08T13:00:00.000Z"
                    }
                },
                {
                  click: 275764,
                  __time: {
                    type: "TIME_RANGE",
                    start: "2019-04-08T11:00:00.000Z",
                    end: "2019-04-08T12:00:00.000Z"
                  }
              },
              {
                click: 283571,
                __time: {
                  type: "TIME_RANGE",
                  start: "2019-04-08T10:00:00.000Z",
                  end: "2019-04-08T11:00:00.000Z"
                }
            },
            {
              click: 284084,
              __time: {
                type: "TIME_RANGE",
                start: "2019-04-08T09:00:00.000Z",
                end: "2019-04-08T10:00:00.000Z"
              }
          },
                      {
                          click: 141779,
                          __time: {
                            type: "TIME_RANGE",
                            start: "2019-04-08T08:00:00.000Z",
                            end: "2019-04-08T09:00:00.000Z"
                          }
                      }
                    ]
                }
              }
          ]
        }
    }
  ]
} as any as Dataset;

const timezone = Timezone.UTC;

describe.only("Dataset", () => {
  it("works", () => {
    expect(fillDataset(Dataset.fromJS(rawDataset.data[0][SPLIT] as Dataset), "pv_count", "site", orderByValueDecreasing, timezone).toJS())
      .to.deep.equal(Dataset.fromJS(expectedDataset.data[0][SPLIT] as Dataset).toJS());
  });

  it("works reversed", () => {
    expect(fillDataset(Dataset.fromJS(rawDataset.data[0][SPLIT] as Dataset), "pv_count", "site", orderByValueIncreasing, timezone).toJS())
      .to.deep.equal(Dataset.fromJS(expectedDatasetReversed.data[0][SPLIT] as Dataset).toJS());
  });

  it("works with time dimension", () => {
    expect(fillDataset(Dataset.fromJS(rawDatasetWithTimeDimension.data[0][SPLIT] as Dataset), "click", "__time", orderByTimeDimensionDecreasing, timezone).toJS())
      .to.deep.equal(Dataset.fromJS(rawDatasetWithTimeDimension.data[0][SPLIT] as Dataset).toJS());
  });

  it("works when reversing time dimension", () => {
    expect(fillDataset(Dataset.fromJS(rawDatasetWithTimeDimension.data[0][SPLIT] as Dataset), "click", "__time", orderByTimeDimensionIncreasing, timezone).toJS())
    .to.deep.equal(Dataset.fromJS(reversedDatasetWithTimeDimension.data[0][SPLIT] as Dataset).toJS());
  });
});
