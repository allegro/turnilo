# Migration to Druid 0.9.1 lookups

Druid 0.9.1 introduces a new way of making query time lookups (QTLs).
The new and old lookups are incompatible.
To facilitate a rolling migration Druid 0.9.1 supports both styles of lookup.

If you are using Pivot with QTLs (`.lookup(...)` actions) and desire to have uninterrupted service,
you will need to follow the following steps.

### Step 1

Ensure you have Pivot 0.9.x that supports all of the Druid 0.9.1 features including the lookups.

Please migrate your config to the new style config by following the [migration instructions](./pivot-0.9.x.migration.md) for Pivot 0.9.x.

### Step 2

Update the 'druid' cluster in the Pivot config and explicitly set the `version` to `0.9.0` (or whatever your Druid version is) like so:

```yaml
  - name: druid
    type: druid
    host: your.broker.host
    version: 0.9.0
```

Make sure to restart Pivot.

By fixing the version you will prevent Pivot form auto-detecting the new Druid version as you start your upgrade.

### Step 3

Roll out Druid 0.9.1 to your cluster.

### Step 4

Update the 'druid' cluster in the Pivot config and explicitly set the `version` to `0.9.1-legacy-lookups` like so:

```yaml
  - name: druid
    type: druid
    host: your.broker.host
    version: 0.9.1-legacy-lookups
```

Make sure to restart Pivot.

In this configuration all the Druid 0.9.1 features will be used except the new lookups.

### Step 5

Follow the [instructions]() and add the new style lookups alongside the legacy lookups to Druid.

### Step 6

Remove the explicit version pinning from the Pivot config. (Alternatively you can set it to `0.9.1`).

Make sure to restart Pivot.

### Step 7

Remove old lookup definitions from Druid.

