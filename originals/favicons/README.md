# Favicons

Pregenerated favicons and tiles for maximum device compatibility.

These assets should be deployed at the site root and included in an HTML page
with the following snippet:

```html
<html>
  <head>
    <!-- rest ... -->

    <!-- favicons -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#b91d47" />
    <meta name="msapplication-TileColor" content="#b91d47" />
    <meta name="theme-color" content="#ffffff" />

    <!-- rest ... -->
  </head>
  <!-- rest ... -->
</html>
```
