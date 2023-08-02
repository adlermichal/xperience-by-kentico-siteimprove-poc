# Siteimprove integration into Xperience by Kentico
This integration allows users to check website and pages for issues directly from Xperience by Kentico.

The CMS plugin and Prepublish check are accessible from Preview mode in the Pages application. Pages are automatically rechecked when republished to ensure the plugin displays up-to-date information.

The integration also supports CMS Deeplink for easier setup on Siteimprove's side.

## Setup
By following the steps below, the integration setups automatically on the first startup.
### Installation of CMS Plugin

1. Add project reference or NuGet from provided file

2. In `Program.cs`, register services and map routes by adding

    ```cs
    WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
    
    ...
    builder.Services.AddKentico();
    builder.Services.AddSiteimprove(builder.Configuration);
    
    ...
    WebApplication app = builder.Build();
    
    ...
    app.UseKentico();
    app.UseSiteimprove();
    ```

3. In `Views/_ViewImports.cshtml`, add Tag Helper
    ```cs
    @using Kentico.Xperience.Siteimprove
    @addTagHelper *, Kentico.Xperience.Siteimprove
    ```

4. In `Views/Shared/_Layout.cshtml`, place the Tag Helper to a suitable location
    ```cs
    <page-builder-scripts />
    <siteimprove-plugin />
    ```

5. In your `appsettings.json`, add section
    ```json
    "Siteimprove": {
      "APIUser": "<Siteimprove API user>",
      "APIKey": "<Siteimprove API key>",
      "EnableContentCheck" : "<true/false>" // set this to true if you are subscribed to Prepublish feature
    }
    ```

### Installation of CMS Deeplink

1. Add project reference or NuGet from provided file

2. In `Views/_ViewImports.cshtml`, add Tag Helper
    ```cs
    @using Kentico.Xperience.Siteimprove
    @addTagHelper *, Kentico.Xperience.Siteimprove
    ```

3. In `Views/Shared/_Layout.cshtml`, place the Tag Helper inside the head tag
    ```cs
    <page-builder-styles />
    <siteimprove-deeplink />
    ```
