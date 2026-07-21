/**
 * MARCA CREATIVES — FRONTEND CMS CLIENT CONNECTOR
 * Dynamically binds website pages to persistent MarcaCMS store:
 *  - Form Submissions on contact.html -> Saves lead into CMS Inbox
 *  - Client Trust Logos Marquee on index.html -> Dynamic from CMS
 *  - Case Studies Grid on work.html -> Dynamic from CMS
 *  - Portfolio Grid on portfolio.html -> Dynamic from CMS
 *  - Services List on services.html -> Dynamic from CMS
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  if (typeof MarcaCMS === 'undefined') return;

  /* 1. Contact Form Lead Saver */
  initContactFormListener();

  /* 2. Client Logos Marquee Dynamic Sync */
  syncClientLogos();

  /* 3. Case Studies Page Sync */
  syncCaseStudies();

  /* 4. Portfolio Page Sync */
  syncPortfolioProjects();

  /* 5. Services Page Sync */
  syncServices();
});

/* ---- 1. Contact Form Listener ---- */
function initContactFormListener() {
  const form = document.querySelector('.contact-fields-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll('input, select, textarea');
    const data = {};

    inputs.forEach(input => {
      const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
      const value = input.value.trim();

      if (input.type === 'email') data.email = value;
      else if (input.type === 'tel') data.phone = value;
      else if (input.tagName.toLowerCase() === 'select') data.service = input.options[input.selectedIndex]?.text || value;
      else if (input.tagName.toLowerCase() === 'textarea') data.message = value;
      else if (placeholder.includes('name') && !placeholder.includes('company')) data.name = value;
      else if (placeholder.includes('company') || placeholder.includes('brand')) data.company = value;
      else if (!data.name) data.name = value;
    });

    /* Save to CMS */
    const lead = MarcaCMS.addLead(data);

    /* Show confirmation modal / toast */
    showSubmissionModal(lead);

    form.reset();
  });
}

function showSubmissionModal(lead) {
  let modal = document.getElementById('lead-success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'lead-success-modal';
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
      z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    modal.innerHTML = `
      <div style="background: #1f1f22; border: 1px solid #333338; border-radius: 24px; padding: 36px; max-width: 440px; text-align: center; color: #ffffff; box-shadow: 0 30px 60px rgba(0,0,0,0.5);">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(228,83,15,0.15); color: #e4530f; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px;">✓</div>
        <h3 style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">Message Received!</h3>
        <p style="font-size: 14px; color: #a3a29b; margin-bottom: 20px; line-height: 1.5;">Thank you <strong style="color:#ffffff;">${escapeHtml(lead.name)}</strong>. Your project inquiry has been recorded in our CMS system. We'll be in touch within 24 hours.</p>
        <button onclick="document.getElementById('lead-success-modal').remove()" style="background: #e4530f; color: #ffffff; border: none; border-radius: 40px; padding: 12px 28px; font-weight: 700; font-size: 14px; cursor: pointer;">Got it!</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

/* ---- 2. Client Logos Sync ---- */
function syncClientLogos() {
  const track = document.querySelector('.logo-marquee-track');
  if (!track) return;

  const settings = MarcaCMS.getSettings();
  const logos = settings.clientLogos;
  if (!logos || !logos.length) return;

  const html = [...logos, ...logos].map(l => `
    <span class="marquee-logo ${l.class || 'logo-brand'}">${escapeHtml(l.name)}</span>
  `).join('');

  track.innerHTML = html;
}

/* ---- 3. Case Studies Sync ---- */
function syncCaseStudies() {
  const csGrid = document.querySelector('.work-case-grid, .cs2-cards-grid');
  if (!csGrid) return;

  const studies = MarcaCMS.getCaseStudies();
  if (!studies || !studies.length) return;

  csGrid.innerHTML = studies.map(cs => `
    <div class="cs2-card" data-reveal>
      <div class="cs2-card-image-wrap">
        <img src="${escapeHtml(cs.image)}" alt="${escapeHtml(cs.clientName)} Case Study">
        <span class="cs2-card-tag">${escapeHtml(cs.category)}</span>
      </div>
      <div class="cs2-card-content">
        <div class="cs2-card-header-row">
          <div>
            <h3 class="cs2-card-client-name">${escapeHtml(cs.clientName)}</h3>
            <p class="cs2-card-subtitle">${escapeHtml(cs.tagline)}</p>
          </div>
          <a href="${escapeHtml(cs.slug)}" class="cs2-card-arrow-btn" aria-label="View Case Study">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>
        <div class="cs2-card-stats-row">
          <div class="cs2-stat-box">
            <span class="cs2-stat-val">${escapeHtml(cs.totalViews)}</span>
            <span class="cs2-stat-lbl">Total Views</span>
          </div>
          <div class="cs2-stat-box">
            <span class="cs2-stat-val">${escapeHtml(cs.followersGrowth)}</span>
            <span class="cs2-stat-lbl">Followers</span>
          </div>
          <div class="cs2-stat-box">
            <span class="cs2-stat-val">${escapeHtml(cs.consultationsGrowth)}</span>
            <span class="cs2-stat-lbl">Growth</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ---- 4. Portfolio Projects Sync ---- */
function syncPortfolioProjects() {
  const portGrid = document.querySelector('.portfolio-grid-container');
  if (!portGrid) return;

  const projects = MarcaCMS.getProjects();
  if (!projects || !projects.length) return;

  portGrid.innerHTML = projects.map(p => `
    <div class="portfolio-card-item" data-category="${escapeHtml(p.category)}">
      <div class="port-card-visual">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}">
        <span class="port-card-cat-tag">${escapeHtml(p.category)}</span>
      </div>
      <div class="port-card-info">
        <h4>${escapeHtml(p.title)}</h4>
        <div class="port-card-meta">
          <span>${escapeHtml(p.client)}</span>
          <strong>${escapeHtml(p.views)}</strong>
        </div>
      </div>
    </div>
  `).join('');
}

/* ---- 5. Services Sync ---- */
function syncServices() {
  const serviceList = document.querySelector('.platform-list');
  if (!serviceList) return;

  const services = MarcaCMS.getServices();
  if (!services || !services.length) return;

  serviceList.innerHTML = services.map((s, idx) => `
    <div class="platform-item ${idx === 0 ? 'active' : ''}" data-platform="${idx}">
      <span class="platform-num">0${idx + 1}</span>
      <div class="platform-info">
        <h4>${s.icon} ${escapeHtml(s.title)}</h4>
        <p>${escapeHtml(s.tagline)}</p>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
