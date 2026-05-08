const fs = require('fs');
const path = require('path');

const getLogoDataUrl = () => {
  const logoPath = path.join(__dirname, '../about/256x256.png');
  const logo = fs.readFileSync(logoPath).toString('base64');

  return `data:image/png;base64,${logo}`;
};

module.exports = function aboutMax({ version }) {
  const currentYear = new Date().getFullYear();
  const logoDataUrl = getLogoDataUrl();

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
      <img src="${logoDataUrl}" width="96" height="96" alt="Max" />
      <h2 class="title">Max ${version}</h2>
      <p class="description">Open-source API client with collaborative cloud workspaces.</p>
      <footer class="footer">© ${currentYear} Max contributors</footer>
    </body>
    </html>
  `;
};
