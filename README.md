# Grafana Twilio Bridge
This Worker translates a Grafana Webhook contact point into a Twilio request. To make things easier around message size limites,
only the title is sent as an SMS.

The Worker should be bound to a KV namespace with binding name GTBKV. A key called "numbers" should have a value that
is a stringified JSON array of the numbers to send the notification to.
