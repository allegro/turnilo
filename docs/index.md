---
title: Turnilo
nav_order: 1
---

Turnilo is a business intelligence, data exploration and visualization web application for [Apache Druid](https://druid.apache.org).
Turnilo is a fork of [Pivot](https://github.com/implydata/pivot) which is currently available under commercial licence only.
This repository was forked from the stalled repository [Swiv](https://github.com/yahoo/swiv)
with the latest version of Pivot under Apache license.

## Motivation

[Druid](https://github.com/druid-io/druid) is heavily used as business intelligence platform at [Allegro](https://allegro.tech/).
In order to gain wide adoption of non-technical users, Druid requires simple yet powerful user interface.
In Allegro, we have decided that we are going to continue Pivot development as an open source software,
this is how Turnilo emerged.

## Manifesto

* High usability for non-technical users over sophisticated but rarely used features.
* Focus on interactive data exploration over static predefined dashboards.
* Self-describing reports for users without deep domain expertise.
* Outstanding integration with Druid over support for other data sources like SQL databases.
* Focus on data visualizations over Druid cluster or data ingestion management.
* Data cubes configuration as a code over UI editor backed by non-versioned database.
* Stateless over stateful server-side architecture.
* Support for most recent versions of standards compliant browsers.

## Features

* Intuitive, drag and drop, gorgeous user interface to visualize Druid datasets.
* Fully dedicated to low latency Druid
  [Timeseries](https://druid.apache.org/docs/latest/querying/timeseriesquery.html),
  [TopN](https://druid.apache.org/docs/latest/querying/topnquery.html) and
  [GroupBy](https://druid.apache.org/docs/latest/querying/groupbyquery.html) queries.
* Unified view for historical and real-time data.
* Blazingly fast.

![Turnilo UI](assets/images/showcase.gif)
