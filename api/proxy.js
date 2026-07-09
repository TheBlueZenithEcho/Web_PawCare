export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { targetUrl, payload } = req.body;
        
        if (!targetUrl) {
            return res.status(400).json({ error: 'Missing targetUrl' });
        }

        // Forward the request to the target webhook (n8n)
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            return res.status(200).json({ status: "success" });
        } else {
            const text = await response.text();
            return res.status(response.status).json({ error: text });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
