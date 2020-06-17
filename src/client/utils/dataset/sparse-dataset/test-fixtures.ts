/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Dataset } from "plywood";
import { DataSetWithTabOptions } from "../../../views/cube-view/cube-view";

export const rawDataset = {
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

export const expectedDataset = {
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

export const expectedDatasetReversed = {
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

export const rawDatasetWithTimeDimension = {
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

export const reversedDatasetWithTimeDimension = {
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

export const rawDataWithNumberRanges = {
     data: [
        {
           added: 9385573,
           SPLIT: {
             type: "DATASET",
              data: [
                 {
                    channel: "en",
                    added: 3045299,
                    SPLIT: {
                      type: "DATASET",
                       data: [
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -500,
                                end: -490
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -400,
                                end: -390
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -300,
                                end: -290
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -200,
                                end: -190
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -100,
                                end: -90
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 0,
                                end: 10
                             },
                             added: 130552
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 100,
                                end: 110
                             },
                             added: 107398
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 200,
                                end: 210
                             },
                             added: 108905
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 300,
                                end: 310
                             },
                             added: 94440
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 400,
                                end: 410
                             },
                             added: 91709
                          }
                       ]
                    }
                 },
                 {
                    channel: "it",
                    added: 711011,
                    SPLIT: {
                      type: "DATASET",
                       data: [
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -500,
                                end: -490
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -400,
                                end: -390
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -300,
                                end: -290
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -200,
                                end: -190
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -100,
                                end: -90
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 0,
                                end: 10
                             },
                             added: 11798
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 100,
                                end: 110
                             },
                             added: 12373
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 200,
                                end: 210
                             },
                             added: 9774
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 300,
                                end: 310
                             },
                             added: 6793
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 400,
                                end: 410
                             },
                             added: 4435
                          }
                       ]
                    }
                 },
                 {
                    channel: "fr",
                    added: 642555,
                    SPLIT: {
                      type: "DATASET",
                       data: [
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -500,
                                end: -490
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -400,
                                end: -390
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -300,
                                end: -290
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -200,
                                end: -190
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -100,
                                end: -90
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 0,
                                end: 10
                             },
                             added: 26870
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 100,
                                end: 110
                             },
                             added: 24478
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 200,
                                end: 210
                             },
                             added: 16030
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 300,
                                end: 310
                             },
                             added: 26297
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 400,
                                end: 410
                             },
                             added: 18407
                          }
                       ]
                    }
                 },
                 {
                    channel: "ru",
                    added: 640698,
                    SPLIT: {
                      type: "DATASET",
                       data: [
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -500,
                                end: -490
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -400,
                                end: -390
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -300,
                                end: -290
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -200,
                                end: -190
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -100,
                                end: -90
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 0,
                                end: 10
                             },
                             added: 16167
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 100,
                                end: 110
                             },
                             added: 15742
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 200,
                                end: 210
                             },
                             added: 18279
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 300,
                                end: 310
                             },
                             added: 18903
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 400,
                                end: 410
                             },
                             added: 13771
                          }
                       ]
                    }
                 },
                 {
                    channel: "es",
                    added: 634670,
                    SPLIT: {
                      type: "DATASET",
                       data: [
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -500,
                                end: -490
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -400,
                                end: -390
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -300,
                                end: -290
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -200,
                                end: -190
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: -100,
                                end: -90
                             },
                             added: 0
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 0,
                                end: 10
                             },
                             added: 13295
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 100,
                                end: 110
                             },
                             added: 9040
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 200,
                                end: 210
                             },
                             added: 7036
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 300,
                                end: 310
                             },
                             added: 12354
                          },
                          {
                             deltaBucket100: {
                                type: "NUMBER_RANGE",
                                start: 400,
                                end: 410
                             },
                             added: 8943
                          }
                       ]
                    }
                 }
              ]
           }
        }
      ]
} as any as Dataset;
