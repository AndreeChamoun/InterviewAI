export let vapi: any = null;

if (typeof window !== 'undefined') {
  import('@vapi-ai/web').then(({ default: Vapi }) => {
    vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
  });
}
