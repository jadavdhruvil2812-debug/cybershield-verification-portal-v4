export function verificationEmailTemplate(
  name: string,
  verifyLink: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify Your Email</title>
</head>

<body style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#020617;">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0"
style="background:#0f172a;border:1px solid #1e293b;border-radius:18px;overflow:hidden;">

<tr>
<td align="center"
style="padding:35px;background:linear-gradient(90deg,#06b6d4,#0891b2);">

<h1 style="margin:0;color:white;font-size:32px;">
🛡 CyberShield
</h1>

<p style="margin-top:8px;color:white;font-size:15px;">
AI Powered Verification Portal
</p>

</td>
</tr>

<tr>
<td style="padding:40px;color:white;">

<h2 style="margin-top:0;">
Verify your email
</h2>

<p style="font-size:16px;line-height:28px;color:#cbd5e1;">
Hello <b>${name}</b>,
</p>

<p style="font-size:16px;line-height:28px;color:#cbd5e1;">
Thank you for creating your CyberShield account.
Please verify your email address to activate your account.
</p>

<div style="text-align:center;margin:40px 0;">

<a href="${verifyLink}"
style="
background:#06b6d4;
padding:16px 38px;
color:#020617;
font-weight:bold;
text-decoration:none;
border-radius:10px;
display:inline-block;
font-size:16px;
">
Verify Email
</a>

</div>

<p style="color:#94a3b8;font-size:14px;line-height:24px;">
If the button doesn't work, copy and paste this link into your browser:
</p>

<p style="word-break:break-all;color:#38bdf8;font-size:13px;">
${verifyLink}
</p>

<hr style="margin:35px 0;border:none;border-top:1px solid #1e293b;">

<p style="color:#64748b;font-size:13px;">
This verification link expires automatically.
If you didn't create this account, you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td
align="center"
style="
padding:22px;
background:#020617;
color:#64748b;
font-size:13px;
">

© ${new Date().getFullYear()} CyberShield Verification Portal

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}

export function resetPasswordTemplate(
  name: string,
  resetLink: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Password</title>
</head>

<body style="margin:0;padding:40px;background:#020617;font-family:Arial,Helvetica,sans-serif;">

<div style="max-width:620px;margin:auto;background:#0f172a;border:1px solid #1e293b;border-radius:18px;overflow:hidden;">

<div style="background:linear-gradient(90deg,#06b6d4,#0891b2);padding:35px;text-align:center;">

<h1 style="margin:0;color:white;font-size:32px;">
🛡 CyberShield
</h1>

<p style="margin-top:8px;color:white;">
AI Powered Verification Portal
</p>

</div>

<div style="padding:40px;color:white;">

<h2 style="margin-top:0;">
Reset Your Password
</h2>

<p style="color:#cbd5e1;font-size:16px;">
Hello <b>${name}</b>,
</p>

<p style="color:#cbd5e1;font-size:16px;line-height:28px;">
We received a request to reset your CyberShield account password.
Click the button below to create a new password.
</p>

<div style="text-align:center;margin:40px 0;">

<a
href="${resetLink}"
style="
background:#06b6d4;
color:#020617;
padding:16px 38px;
text-decoration:none;
font-weight:bold;
border-radius:10px;
display:inline-block;
font-size:16px;
">
Reset Password
</a>

</div>

<p style="color:#94a3b8;">
This password reset link will expire in <b>15 minutes</b>.
</p>

<p style="color:#64748b;font-size:13px;">
If you did not request a password reset, you can safely ignore this email.
Your account will remain secure.
</p>

</div>

<div
style="
background:#020617;
padding:22px;
text-align:center;
color:#64748b;
font-size:13px;
">

© ${new Date().getFullYear()} CyberShield Verification Portal

</div>

</div>

</body>
</html>
`;
}