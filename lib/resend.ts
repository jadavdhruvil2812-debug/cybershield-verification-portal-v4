
const { Resend } = require("resend") as {
  Resend: new (apiKey: string) => unknown;
};

export const resend = new Resend(process.env.RESEND_API_KEY as string);