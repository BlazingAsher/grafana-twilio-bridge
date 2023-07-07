import { Router } from 'itty-router';

async function sendText(message, number, source, accountSid, tokenSid, tokenSecret) {
		const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

		let encoded = new URLSearchParams();
		encoded.append('To', number);
		encoded.append('From', source);
		encoded.append('Body', message);

		let token = btoa(tokenSid + ':' + tokenSecret);

		const request = {
				body: encoded,
				method: 'POST',
				headers: {
						'Authorization': `Basic ${token}`,
						'Content-Type': 'application/x-www-form-urlencoded',
				},
		};

		let result = await fetch(endpoint, request);
		result = await result.json();

		return result;
}


// Create a new router
const router = Router();

router.post('/alert', async (request, env) => {

  if(request.headers.get('Authorization') !== `Bearer ${env.ALERT_TOKEN}`) {
			return new Response(JSON.stringify({
					status: "UNAUTHORIZED"
			}), {
					status: 401,
					headers: {
							'Content-Type': 'application/json',
					}
			});
	}

  let response = {
			status: "OK"
	};

	// If the POST data is JSON then attach it to our response.
	if (request.headers.get('Content-Type') === 'application/json') {
		let json = await request.json();

		const notifyNumbers = JSON.parse((await env.GTBKV.get("numbers")) || "[]");
		const results = {
				success: [],
				fail: []
		}

		for(const number of notifyNumbers) {
				try {
						await sendText(json["title"], number, env.SOURCE_NUMBER,
								env.TWILIO_ACCOUNT_SID, env.TWILIO_TOKEN_SID, env.TWILIO_TOKEN_SECRET);
						results.success.push(number);
				}
				catch(e) {
						results.fail.push(number);
				}
		}

		response.data = results;
	}

	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
});

router.all('*', () => new Response('No such route.', { status: 404 }));

export default {
	fetch: router.handle,
};
