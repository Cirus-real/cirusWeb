const WEBHOOK_URL = 'https://discord.com/api/webhooks/1284240629647278181/pQZzRcY9CPYCYSTyBhHEoZXy2W3gB2HpOLNEjEfHxikSgk6_0gfxQohiQKGvZEb2p-4e';

export interface WebhookPayload {
  username: string;
  content: string;
}

export const sendWebhookMessage = async ({ username, content }: WebhookPayload): Promise<boolean> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, content }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending webhook message:', error);
    return false;
  }
};
