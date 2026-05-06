const maxLogoSvg = `
<svg width="96" viewBox="0 0 72 72" role="img" aria-label="Max" xmlns="http://www.w3.org/2000/svg">
  <path fill="#101824" d="M36 5.8 24.7 13 14.9 12.4 12.6 27.1 6.1 35.6 13.4 48.7 36 66.2 58.6 48.7 65.9 35.6 59.4 27.1 57.1 12.4 47.3 13z"/>
  <path fill="#F5EAD4" d="m18.4 15.8 13.2 14.7-12.2-6.4-4.2 8.9z"/>
  <path fill="#F5EAD4" d="m53.6 15.8-13.2 14.7 12.2-6.4 4.2 8.9z"/>
  <path fill="#273241" d="m15.4 35.2 13.4-7.3 8.3 8.8-8 13.2-14.3-4.6z"/>
  <path fill="#273241" d="m56.6 35.2-13.4-7.3-8.3 8.8 8 13.2 14.3-4.6z"/>
  <path fill="#F6EFE2" d="m21.3 42.2 11.4 4.4-4.4 9-13.1-8.7z"/>
  <path fill="#F6EFE2" d="m50.7 42.2-11.4 4.4 4.4 9 13.1-8.7z"/>
  <path fill="#F3A51C" d="m20.6 36.4 11.1 2.2-3.6 3.9-6.2-1.3z"/>
  <path fill="#F3A51C" d="m51.4 36.4-11.1 2.2 3.6 3.9 6.2-1.3z"/>
  <path fill="#0B111A" d="m25.3 35.9 4.1 1.8-2.9 4.8z"/>
  <path fill="#0B111A" d="m46.7 35.9-4.1 1.8 2.9 4.8z"/>
  <path fill="#F8F1E4" d="m39.2 14.4-6.4 17.3h6.3L32.3 47l13-21.1h-6.9l4.9-11.5z"/>
  <path fill="#0B111A" d="m36 48.6 4.3 2.9L36 55.3l-4.3-3.8z"/>
  <path fill="#F6EFE2" d="m29.6 57.7 6.4 3.8 6.4-3.8-2.3 4.9H31.9z"/>
  <path stroke="#F6EFE2" stroke-linecap="round" stroke-width="2.2" d="M18.8 49.8 6.9 51.9M20.7 53.1 10 57.7M53.2 49.8l11.9 2.1M51.3 53.1 62 57.7"/>
</svg>`;

module.exports = function aboutMax({ version }) {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1, user-scalable=yes">
      <title>About Max</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          margin: 0;
          padding: 18px 12px;
          background-color: #f6f6f6;
          color: #222;
        }
        .title {
          font-size: 24px;
          margin: 8px 0 4px;
          font-weight: 700;
        }
        .description {
          font-size: 12px;
          margin: 0;
          color: #555;
        }
        .footer {
          margin-top: 12px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      ${maxLogoSvg}
      <h2 class="title">Max ${version}</h2>
      <p class="description">Open-source API client with collaborative cloud workspaces.</p>
      <footer class="footer">© ${currentYear} Max contributors</footer>
    </body>
    </html>
  `;
};
