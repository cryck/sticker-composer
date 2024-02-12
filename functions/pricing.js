export default {
    async fetch(request, env, ctx) {
      const corsHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        };
  
      const customHeaders = new Headers({
        "Accept"       : "application/json",
        "Content-Type" : "application/json",
        "User-Agent"   : "Mozilla/5.0 Cloudflare/Worker"
      }); 
  
      // Extract stickerName from the request's URL query parameters
      const url = new URL(request.url);
      const stickerName = url.searchParams.get("stickerName");
  
      // Proceed only if stickerName is provided
      if (!stickerName) {
          return new Response(JSON.stringify({ error: "Sticker name is required" }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
          });
      }
  
      const apiUrl = `https://csgobackpack.net/api/GetItemPrice/?id=${encodeURIComponent(stickerName)}&key=${env.csgobackpackApiKey}`;
      try {
          const response = await fetch(apiUrl, customHeaders);
          if (!response.ok) {
              console.error(`API call failed with HTTP status ${response.status}`);
              return new Response(JSON.stringify({ error: `API call failed with HTTP status ${response.status}` }), {
                  status: response.status,
                  headers: { 'Content-Type': 'application/json' }
              });
          }
          const results = await response.json();
          return new Response(JSON.stringify(results), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
      } catch (error) {
          console.error("Error fetching item price:", error);
          return new Response(JSON.stringify({ error: "Internal Server Error" }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
          });
      }
  }}