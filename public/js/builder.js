/* ═══════════════════════════════════════════════
   Builder Module — Template construction
   ═══════════════════════════════════════════════ */

const Builder = (() => {
  const BRAND_CONFIG = {
    liderbet: {
        localIcon: '/images/logos/icon_liderbet_branco.png',
        headerLogoExternal: 'https://promocoes.liderbet.com.br/wp-content/uploads/2026/04/liderbet-branco.png',
        instagram: 'https://www.instagram.com/liderbet.br/',
        facebook: '',
        bgColor: '#1a1a2e',
        btnColor: '#e03326'
    },
    geralbet: {
        localIcon: '/images/logos/icon_geralbet_branco.png',
        headerLogoExternal: 'https://promocoes.liderbet.com.br/wp-content/uploads/2026/04/geralbet-branca-1536x213.png',
        instagram: 'https://www.instagram.com/geralbet.bet.br',
        facebook: '',
        bgColor: '#162b4d',
        btnColor: '#2684ff'
    },
    certeiro: {
        localIcon: '/images/logos/icon_certeiro.png',
        headerLogoExternal: 'https://promocoes.liderbet.com.br/wp-content/uploads/2026/04/Certeiro-Logo-1536x1536.png',
        instagram: '',
        facebook: '',
        bgColor: '#0d1b2a',
        btnColor: '#10b981'
    },
    logame: {
        localIcon: '/images/logos/Logo-Logame.png',
        headerLogoExternal: 'https://promocoes.liderbet.com.br/wp-content/uploads/2026/04/Logo-Logame.png',
        instagram: 'https://www.instagram.com/logamedobrasil/',
        facebook: '',
        bgColor: '#0a0a14',
        btnColor: '#f59e0b'
    },
    officecom: {
        localIcon: '',
        headerLogoExternal: '',
        instagram: 'https://www.instagram.com/officecom.brasil/',
        facebook: '',
        bgColor: '#1e1e1e',
        btnColor: '#3b82f6'
    }
  };

  let formEl;
  let bgInput;
  let btnInput;
  let hexBgEl;
  let hexBtnEl;
  let copyEditor;
  let copyToolbarBtns;

  // Base Template
  const basePre = `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <title>{{BRAND}}</title>
    <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; background-color: {{BG_COLOR}}; }
        u+#body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
        [data-ogsc] .dark-bg { background-color: {{BG_COLOR}} !important; }
        [data-ogsc] .card-bg { background-color: #1e293b !important; }
        
        @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .fluid-img img { width: 100% !important; height: auto !important; }
            .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; text-align: center !important; }
            
            /* Ajustes de espaçamento geral para mobile */
            .mobile-padding { padding-left: 15px !important; padding-right: 15px !important; }
            .card-padding { padding: 15px !important; }
            
            /* Ajustes de tipografia para mobile */
            .mobile-title h1 { font-size: 18px !important; line-height: 1.3 !important; }
            .mobile-text p, .mobile-text div { font-size: 14px !important; line-height: 1.5 !important; margin-bottom: 10px !important; }
            
            /* Ajuste do Botão */
            .mobile-button a { font-size: 16px !important; padding: 14px 20px !important; width: 100% !important; box-sizing: border-box !important; display: block !important; }
            
            /* Ajustes do Footer (Lado a Lado no Mobile) */
            .footer-col { display: table-cell !important; padding: 0 !important; vertical-align: middle !important; }
            .footer-seal { padding: 5px 0 !important; }
            .footer-seal img { max-width: 90px !important; width: 100% !important; height: auto !important; }
            .footer-icons img { width: 20px !important; height: 20px !important; }
            .footer-18-icon { width: 22px !important; height: auto !important; }
            .footer-18-text { font-size: 8px !important; line-height: 1.1 !important; padding-left: 3px !important; }
            .mobile-footer-legal { font-size: 9px !important; line-height: 1.3 !important; }
        }
    </style>
</head>
<body id="body" style="margin:0; padding:0; word-spacing:normal; background-color:{{BG_COLOR}}; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{{BG_COLOR}}" style="background-color:{{BG_COLOR}}; width:100%;">
        <tr>
            <td align="center" valign="top" style="padding:10px 0;">
                <!-- O main color do card vai ser ligeiramente diferente para destacar. Mas como baseamos no bg input, vamos usar lighten trick no estilo inline ou manter 1a1a2e genérico -->
                <table class="email-container" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" bgcolor="#1a1a2e" style="margin:0 auto; max-width:600px; width:100%; background-color:#1a1a2e; border-radius:8px; overflow:hidden;">
                    
                    <!-- LOGO -->
                    {{LOGO_HTML}}

                    <!-- BANNER -->
                    <tr>
                        <td class="fluid-img" bgcolor="#1a1a2e" style="background-color:#1a1a2e; padding:0;">
                            <a href="{{BANNER_LINK}}" target="_blank" style="display:block;">
                                <img src="{{BANNER_IMG}}" alt="{{BRAND}}" width="600" style="display:block; width:100%; max-width:600px; height:auto; border:0;">
                            </a>
                        </td>
                    </tr>
                    
                    <!-- TITLE (Optional, we put it inside copy or leave a brand heading?)
                         We will put it generically here -->
                    <tr>
                        <td align="center" bgcolor="#1a1a2e" class="mobile-title mobile-padding" style="background-color:#1a1a2e; padding:25px 30px 10px 30px;">
                            <h1 style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:24px; font-weight:bold; color:#ffffff; text-align:center; line-height:1.3;">
                                {{BRAND}}
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- COPY -->
                    <tr>
                        <!-- Add a wrapper div to inject rich text while forcing styles -->
                        <td class="mobile-padding mobile-text" bgcolor="#1a1a2e" style="background-color:#1a1a2e; padding:10px 40px 15px 40px; font-family:Arial, Helvetica, sans-serif; color:#e0e0e0; text-align:center; font-size: 16px; line-height:1.6;">
                            <div style="font-family:Arial, Helvetica, sans-serif; color:#e0e0e0; font-size:16px; line-height:1.6; margin:0;">
                                {{COPY_HTML}}
                            </div>
                        </td>
                    </tr>
                    
                    <!-- BUTTON -->
                    <tr>
                        <td align="center" bgcolor="#1a1a2e" class="mobile-button mobile-padding" style="background-color:#1a1a2e; padding:10px 40px 30px 40px;">
                            <a href="{{CTA_LINK}}" target="_blank" style="display:inline-block; background-color:{{BTN_COLOR}}; color:#ffffff; border-radius:30px; font-size:18px; padding:16px 45px; text-decoration:none; font-weight:bold; font-family:Arial, Helvetica, sans-serif; text-align:center;">
                                {{CTA_TEXT}}
                            </a>
                        </td>
                    </tr>
                    
                    <!-- FOOTER -->
                    <tr>
                        <td bgcolor="#1a1a2e" style="background-color:#1a1a2e; padding:0 25px 25px 25px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td colspan="3" style="padding-bottom:15px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="height:1px; background-color:#334155; font-size:1px; line-height:1px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="footer-col" width="33%" align="center" valign="middle" style="padding:5px 0;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="vertical-align:middle;">
                                                    <img class="footer-18-icon" src="https://static6.smr.vc/3ad1ec5520e3efc6744141-db3afa67bab81861992d42-18.png" alt="18+" width="30" style="display:inline-block; max-width:30px; height:auto; border:0;">
                                                </td>
                                                <td class="footer-18-text" style="vertical-align:middle; padding-left:4px; font-family:Arial, sans-serif; font-size:10px; color:#94a3b8; line-height:1.2; text-align: left;">
                                                    Jogue com<br>responsabilidade
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    
                                    <td class="footer-col footer-seal" width="34%" align="center" valign="middle" style="padding:5px 0;">
                                        <img src="https://static.lider.bet.br/deploy-2949dee11b6a535f5e9ba1f0752ba04fcc492a86-0734ee759183ad3828d3/assets/seals/autorizado.png" alt="Autorizado - Ministério da Fazenda" width="120" style="display:inline-block; max-width:120px; height:auto; border:0;">
                                    </td>
                                    
                                    <td class="footer-col footer-icons" width="33%" align="center" valign="middle" style="padding:5px 0;">
                                        {{INSTAGRAM_HTML}}
                                        {{FACEBOOK_HTML}}
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td colspan="3" style="padding-top:15px;">
                                        <p class="mobile-footer-legal" style="font-family:Arial, sans-serif; text-align:center; font-size:10px; color:#64748b; line-height:1.4; margin:0 0 8px 0;">
                                            LIDER.BET.BR é uma plataforma operada pela LOGAME DO BRASIL LTDA (CNPJ 56.349.116/0001-95) e licenciada pela Secretaria de Prêmios e Apostas do Ministério da Fazenda (Autorização SPA/MF n&deg; 324/2025).
                                        </p>
                                        <p class="mobile-footer-legal" style="font-family:Arial, sans-serif; text-align:center; font-size:10px; color:#64748b; margin:0;">
                                            <a href="#" style="color:#64748b; text-decoration:underline;">Cancelar inscrição</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  function init() {
    formEl = document.getElementById('builder-form');
    if (!formEl) return;

    bgInput = document.getElementById('builder-color-bg');
    btnInput = document.getElementById('builder-color-btn');
    hexBgEl = document.getElementById('hex-bg');
    hexBtnEl = document.getElementById('hex-btn');
    copyEditor = document.getElementById('builder-copy');
    copyToolbarBtns = document.querySelectorAll('.rich-editor-toolbar button');

    // Setup Logotipo Toggles
    const logoToggle = document.getElementById('builder-has-logo');
    const logoSection = document.getElementById('builder-logo-section');
    const brandSelect = document.getElementById('builder-brand-select');
    const customLogoGroup = document.getElementById('builder-logo-custom-group');

    if (logoToggle) {
      logoToggle.addEventListener('change', (e) => {
        logoSection.style.display = e.target.checked ? 'block' : 'none';
      });
    }

    if (brandSelect) {
      brandSelect.addEventListener('change', (e) => {
        customLogoGroup.style.display = e.target.value === 'outra' ? 'block' : 'none';
        applyBrandDefaults(e.target.value);
      });
      // Aplica os valores padrão na inicialização (Liderbet)
      applyBrandDefaults(brandSelect.value);
    }

    // Setup Colors
    bgInput.addEventListener('input', (e) => hexBgEl.textContent = e.target.value);
    btnInput.addEventListener('input', (e) => hexBtnEl.textContent = e.target.value);

    // Setup Rich Editor
    copyToolbarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.getAttribute('data-command');
        document.execCommand(command, false, null);
        copyEditor.focus();
      });
    });

    // Handle Form Submit
    formEl.addEventListener('submit', handleGenerate);

    // Setup Image Upload
    const btnUploadImage = document.getElementById('btn-upload-image');
    const imageUploadInput = document.getElementById('image-upload-input');
    const imageUploadUrl = document.getElementById('image-upload-url');
    const btnCopyUploadUrl = document.getElementById('btn-copy-upload-url');

    if (btnUploadImage && imageUploadInput) {
      btnUploadImage.addEventListener('click', () => {
        imageUploadInput.click();
      });

      imageUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
          btnUploadImage.disabled = true;
          btnUploadImage.textContent = 'Enviando...';
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            // Note: Don't set Content-Type header manually for FormData, browser handles it including boundaries.
          });
          const data = await res.json();

          if (res.ok && data.url) {
            imageUploadUrl.value = data.url;
            btnCopyUploadUrl.disabled = false;
            if (window.App && window.App.toast) window.App.toast('Upload concluído!', 'success');
          } else {
            if (window.App && window.App.toast) window.App.toast(data.error || 'Erro no upload', 'error');
          }
        } catch (err) {
          if (window.App && window.App.toast) window.App.toast('Erro ao fazer upload', 'error');
        } finally {
          btnUploadImage.disabled = false;
          btnUploadImage.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Fazer Upload';
          imageUploadInput.value = '';
        }
      });

      btnCopyUploadUrl?.addEventListener('click', () => {
        if (imageUploadUrl.value) {
          navigator.clipboard.writeText(imageUploadUrl.value);
          if (window.App && window.App.toast) window.App.toast('URL copiada para a área de transferência', 'info');
        }
      });
    }
  }

  function applyBrandDefaults(brandId) {
    const config = BRAND_CONFIG[brandId];
    if (!config) return;

    // Atualiza preview local do ícone
    const iconPreview = document.getElementById('builder-brand-icon');
    if (iconPreview) {
      if (config.localIcon) {
        iconPreview.src = config.localIcon;
        iconPreview.style.display = 'block';
      } else {
        iconPreview.style.display = 'none';
      }
    }

    // Atualiza Cores base baseando-se no dicionário
    if (config.bgColor) {
      bgInput.value = config.bgColor;
      hexBgEl.textContent = config.bgColor;
    }
    if (config.btnColor) {
      btnInput.value = config.btnColor;
      hexBtnEl.textContent = config.btnColor;
    }

    // Atualiza Links das Redes Sociais
    const instaInput = document.getElementById('builder-instagram');
    const fbInput = document.getElementById('builder-facebook');
    if (instaInput) instaInput.value = config.instagram || '';
    if (fbInput) fbInput.value = config.facebook || '';
  }

  function handleGenerate(e) {
    e.preventDefault();

    // Collect values
    const brand = document.getElementById('builder-brand').value.trim();
    
    // Logo HTML processing
    const hasLogo = document.getElementById('builder-has-logo').checked;
    const brandType = document.getElementById('builder-brand-select').value;
    const customLogo = document.getElementById('builder-logo-custom').value.trim();

    let logoHtml = '';
    if (hasLogo) {
      let logoUrl = '';
      if (brandType !== 'outra' && BRAND_CONFIG[brandType]) {
        // Para os templates injetamos a Logo externa obrigatoriamente
        logoUrl = BRAND_CONFIG[brandType].headerLogoExternal;
      } else {
        logoUrl = customLogo;
      }

      if (logoUrl) {
        logoHtml = `
                    <tr>
                        <td align="center" bgcolor="#1a1a2e" style="background-color:#1a1a2e; padding:30px 20px 0px 20px;">
                            <img src="${logoUrl}" alt="${brand || 'Logo'}" width="200" style="display:block; max-width:200px; height:auto; border:0;">
                        </td>
                    </tr>`;
      }
    }

    const bannerImg = document.getElementById('builder-banner').value.trim();
    const bannerLink = document.getElementById('builder-link-banner').value.trim();
    
    // Copy HTML processing
    // Let's grab the HTML from contenteditable, and ensure it replaces <p> or <div> default browser margins 
    // with ones appropriate for email
    let copyHtml = copyEditor.innerHTML.trim();
    if (!copyHtml || copyHtml === '<br>') copyHtml = 'Insira o seu texto principal aqui.';
    
    const ctaText = document.getElementById('builder-cta-text').value.trim();
    const ctaLink = document.getElementById('builder-cta-link').value.trim();
    const instaLink = document.getElementById('builder-instagram').value.trim();
    const fbLink = document.getElementById('builder-facebook').value.trim();
    const bgColor = bgInput.value;
    const btnColor = btnInput.value;

    // Build Socials
    let instaHtml = '';
    if (instaLink && instaLink !== 'https://instagram.com/') {
      instaHtml = `
        <a href="${instaLink}" target="_blank" style="display:inline-block; text-decoration:none; margin: 0 2px;">
            <img src="https://s3-eu-west-1.amazonaws.com/ecomail-assets/editor/social-icos/simplegrey/instagram.png" alt="Instagram" width="24" height="24" style="display:inline-block; border:0; width:24px; height:24px;">
        </a>`;
    }
    
    let fbHtml = '';
    if (fbLink && fbLink !== 'https://facebook.com/') {
      fbHtml = `
        <a href="${fbLink}" target="_blank" style="display:inline-block; text-decoration:none; margin: 0 2px;">
            <img src="https://s3-eu-west-1.amazonaws.com/ecomail-assets/editor/social-icos/simplegrey/facebook.png" alt="Facebook" width="24" height="24" style="display:inline-block; border:0; width:24px; height:24px;">
        </a>`;
    }

    // Replace in template
    let finalHtml = basePre
      .replace(/\{\{BRAND\}\}/g, brand || 'Campanha')
      .replace(/\{\{BG_COLOR\}\}/g, bgColor)
      .replace(/\{\{LOGO_HTML\}\}/g, logoHtml)
      .replace(/\{\{BANNER_IMG\}\}/g, bannerImg)
      .replace(/\{\{BANNER_LINK\}\}/g, bannerLink)
      .replace(/\{\{COPY_HTML\}\}/g, copyHtml)
      .replace(/\{\{CTA_TEXT\}\}/g, ctaText)
      .replace(/\{\{CTA_LINK\}\}/g, ctaLink)
      .replace(/\{\{BTN_COLOR\}\}/g, btnColor)
      .replace(/\{\{INSTAGRAM_HTML\}\}/g, instaHtml)
      .replace(/\{\{FACEBOOK_HTML\}\}/g, fbHtml);

    // Send the generated HTML to the Editor tab
    Editor.setHTML(finalHtml);

    // Switch to Preview tab
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    
    document.getElementById('tab-preview').classList.add('active');
    document.getElementById('panel-preview').classList.add('active');

    // Explicitly update preview just in case setHTML didn't fire enough events due to focus, etc.
    Preview.update(finalHtml);
    
    // Notify user
    if (window.App && window.App.toast) {
      window.App.toast('Template gerado com sucesso! Verifique o Preview.', 'success');
      window.App.updateSendButton();
    }
  }

  return { init };
})();
