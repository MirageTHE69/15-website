/**
 * MARCA CREATIVES — INTEGRATED CMS DATA ENGINE
 * Provides persistent LocalStorage state management and CRUD APIs for:
 *  - Form Submissions & Leads Inbox
 *  - Case Studies
 *  - Portfolio Projects
 *  - Services
 *  - Client Trust Logos & Site Settings
 */

const MarcaCMS = (function () {
  'use strict';

  const STORAGE_KEYS = {
    LEADS: 'marca_cms_leads',
    CASE_STUDIES: 'marca_cms_case_studies',
    PROJECTS: 'marca_cms_projects',
    SERVICES: 'marca_cms_services',
    SETTINGS: 'marca_cms_settings'
  };

  /* Default Seed Data initialized on first load */
  const SEED_DATA = {
    caseStudies: [
      {
        id: 'cs-aanya',
        clientName: 'Dr. Aanya Shah',
        slug: 'case-study-aanya.html',
        tagline: 'Positioning an Expert, Building Patient Trust.',
        category: 'Personal Branding',
        industry: 'Healthcare, Skincare',
        timeline: '8 Months',
        image: 'assets/hero_arc_1.png',
        followersGrowth: '2.1K → 418K',
        totalViews: '62M+',
        consultationsGrowth: '+200%',
        creatorRank: 'Top 1%',
        challenge: 'Strict medical compliance guidelines, zero camera-readiness, and low digital trust in healthcare.',
        approach: 'Designed a compliance-safe educational roadmap focusing on clinical value rather than promotional ads.',
        quote: 'MARCO. didn\'t just build a channel—they established my authority. The patient booking rate has tripled.',
        authorRole: 'Cosmetic Dermatologist',
        authorAvatar: 'assets/team_sarah.png',
        featured: true
      },
      {
        id: 'cs-rohan',
        clientName: 'Rohan Malhotra',
        slug: 'case-study-rohan.html',
        tagline: 'Scaling B2B Authority & Organic Inbound Funnels.',
        category: 'Brand Marketing',
        industry: 'Fintech, B2B SaaS',
        timeline: '6 Months',
        image: 'assets/hero_arc_3.png',
        followersGrowth: '10K → 185K',
        totalViews: '45M+',
        consultationsGrowth: '+310%',
        creatorRank: 'Top 5%',
        challenge: 'Dense financial concepts failing to hook audience retention on vertical video formats.',
        approach: 'Converted complex market reports into high-retention 45-second visual breakdowns with kinetic typography.',
        quote: 'Our inbound enterprise lead flow went from 2 per month to 15+ per week after MARCO took over.',
        authorRole: 'Founder & CEO, FinPulse',
        authorAvatar: 'assets/hero_arc_3.png',
        featured: true
      },
      {
        id: 'cs-nutty',
        clientName: 'Nutty Affair',
        slug: 'case-study-nutty.html',
        tagline: 'DTC Brand Launch & Visual Content Ecosystem.',
        category: 'Branding & Production',
        industry: 'DTC Food & FMCG',
        timeline: '10 Months',
        image: 'assets/hero_arc_2.png',
        followersGrowth: '0 → 290K',
        totalViews: '88M+',
        consultationsGrowth: '+450%',
        creatorRank: 'Top 2%',
        challenge: 'Entering a crowded gourmet snack market with zero prior brand awareness or ad spend history.',
        approach: 'Shot a cinematic studio brand film and created high-converting unboxing shorts highlighting premium ingredients.',
        quote: 'MARCO created our brand identity from scratch and delivered content that sold out our first 3 production batches.',
        authorRole: 'Co-Founder, Nutty Affair',
        authorAvatar: 'assets/hero_arc_2.png',
        featured: true
      }
    ],

    projects: [
      {
        id: 'proj-1',
        title: 'Dr. Shah · Dermatology Reel Series',
        category: 'Shorts & Reels',
        image: 'assets/hero_arc_1.png',
        views: '12.4M Views',
        client: 'Dr. Aanya Shah',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-skin-41221-large.mp4'
      },
      {
        id: 'proj-2',
        title: 'Nutty Affair · Gourmet Brand Launch Film',
        category: 'Brand Films',
        image: 'assets/hero_arc_2.png',
        views: '8.2M Views',
        client: 'Nutty Affair',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-fresh-roasted-nuts-43091-large.mp4'
      },
      {
        id: 'proj-3',
        title: 'Finance Market Breakdown · Viral Thumbnail & Reel',
        category: 'Thumbnails & Graphics',
        image: 'assets/hero_arc_3.png',
        views: '5.1M Views',
        client: 'FinPulse',
        videoUrl: ''
      },
      {
        id: 'proj-4',
        title: 'Verde & Oak · Luxury Restaurant Launch Campaign',
        category: 'YouTube Videos',
        image: 'assets/hero_arc_4.png',
        views: '14.8M Views',
        client: 'Verde & Oak',
        videoUrl: ''
      },
      {
        id: 'proj-5',
        title: 'Studio Lume · Architectural TVC Commercial Stills',
        category: 'Production Shoots',
        image: 'assets/hero_arc_6.png',
        views: '3.6M Views',
        client: 'Studio Lume',
        videoUrl: ''
      },
      {
        id: 'proj-6',
        title: 'Clinic Aesthetic · Patient Experience Documentary',
        category: 'YouTube Videos',
        image: 'assets/hero_arc_7.png',
        views: '9.4M Views',
        client: 'Lumiere Clinic',
        videoUrl: ''
      }
    ],

    services: [
      {
        id: 'srv-1',
        title: 'Personal Branding',
        icon: '👤',
        slug: 'personal-branding.html',
        tagline: 'Position your expertise and build high-trust digital authority.',
        deliverables: ['Scriptwriting & Hook Architecture', 'In-Clinic & Studio Shoots', 'Vertical Shorts & Reels Editing', 'Growth Strategy & Scheduling'],
        timeline: 'Monthly Retainer'
      },
      {
        id: 'srv-2',
        title: 'Brand & Business Marketing',
        icon: '🚀',
        slug: 'brand-business-marketing.html',
        tagline: 'Scale B2B & DTC brands with full-stack video production.',
        deliverables: ['Brand Launch Films', 'YouTube Channel Operations', 'Product Commercial Shoots', 'Inbound Lead Funnel Integration'],
        timeline: 'Quarterly & Annual Campaigns'
      },
      {
        id: 'srv-3',
        title: 'Branding & Graphic Design',
        icon: '🎨',
        slug: 'services.html',
        tagline: 'Visual identities, high-CTR thumbnails, and creative assets.',
        deliverables: ['Logo & Visual Style Systems', 'High-CTR YouTube Thumbnails', 'Social Media Templates', 'Packaging & Ad Graphics'],
        timeline: 'Project Based'
      }
    ],

    leads: [
      {
        id: 'lead-101',
        name: 'Siddharth Mehta',
        email: 'siddharth@mehtaclinic.com',
        phone: '+91 98250 12345',
        company: 'Mehta Dental & Aesthetics',
        service: 'Personal Branding',
        message: 'Looking to build a doctor personal brand for our aesthetic dental clinic in Vadodara.',
        status: 'New',
        createdAt: '2026-07-21 10:15 AM',
        notes: 'Interested in monthly retainer package.'
      },
      {
        id: 'lead-102',
        name: 'Priya Sharma',
        email: 'priya@urbanroots.in',
        phone: '+91 99090 87654',
        company: 'Urban Roots Organics',
        service: 'Brand & Business Marketing',
        message: 'Need a DTC brand film and short-form reels for our organic skincare launch.',
        status: 'Contacted',
        createdAt: '2026-07-20 04:30 PM',
        notes: 'Followed up via call. Scheduled discovery meeting for Thursday.'
      }
    ],

    settings: {
      siteName: 'MARCO.',
      agencyTagline: 'Full-Stack Content Driven Marketing Agency',
      totalViewsGenerated: '800M+',
      totalFollowersScaled: '500K+',
      serviceVerticals: '3',
      industriesServed: '5+',
      contactEmail: 'hello@marcocreatives.com',
      contactPhone: '+91 63573 64872',
      contactAddress: 'Vadodara, Gujarat, India',
      clientLogos: [
        { name: 'Nutty Affair', class: 'logo-nutty' },
        { name: 'MERIDIAN', class: 'logo-meridian' },
        { name: 'Kessler & Co.', class: 'logo-kessler' },
        { name: 'novo', class: 'logo-novo' },
        { name: 'ATLAS', class: 'logo-atlas' },
        { name: 'form·studio', class: 'logo-form' },
        { name: 'VERDE', class: 'logo-verde' }
      ]
    }
  };

  /* Helper to read data safely */
  function getItem(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`[MarcaCMS] Error reading ${key}:`, e);
      return fallback;
    }
  }

  /* Helper to save data safely */
  function setItem(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`[MarcaCMS] Error writing ${key}:`, e);
      return false;
    }
  }

  /* Initializer: populates seed data if empty */
  function initStore() {
    if (!localStorage.getItem(STORAGE_KEYS.CASE_STUDIES)) {
      setItem(STORAGE_KEYS.CASE_STUDIES, SEED_DATA.caseStudies);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      setItem(STORAGE_KEYS.PROJECTS, SEED_DATA.projects);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      setItem(STORAGE_KEYS.SERVICES, SEED_DATA.services);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
      setItem(STORAGE_KEYS.LEADS, SEED_DATA.leads);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setItem(STORAGE_KEYS.SETTINGS, SEED_DATA.settings);
    }
  }

  /* Auto-run init */
  initStore();

  /* ============================================================
     CMS PUBLIC API METHODS
     ============================================================ */
  return {
    /* ---- Leads / Form Submissions API ---- */
    getLeads: function () {
      return getItem(STORAGE_KEYS.LEADS, SEED_DATA.leads);
    },

    addLead: function (leadData) {
      const leads = this.getLeads();
      const newLead = {
        id: 'lead-' + Date.now(),
        name: leadData.name || 'Anonymous',
        email: leadData.email || '',
        phone: leadData.phone || '',
        company: leadData.company || '',
        service: leadData.service || 'General Inquiry',
        message: leadData.message || '',
        status: 'New',
        createdAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        notes: ''
      };
      leads.unshift(newLead);
      setItem(STORAGE_KEYS.LEADS, leads);
      return newLead;
    },

    updateLeadStatus: function (id, status, notes) {
      const leads = this.getLeads();
      const idx = leads.findIndex(l => l.id === id);
      if (idx !== -1) {
        leads[idx].status = status;
        if (notes !== undefined) leads[idx].notes = notes;
        setItem(STORAGE_KEYS.LEADS, leads);
        return leads[idx];
      }
      return null;
    },

    deleteLead: function (id) {
      let leads = this.getLeads();
      leads = leads.filter(l => l.id !== id);
      setItem(STORAGE_KEYS.LEADS, leads);
      return leads;
    },

    exportLeadsCSV: function () {
      const leads = this.getLeads();
      if (!leads.length) return '';

      const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Service', 'Message', 'Status', 'Date', 'Notes'];
      const rows = leads.map(l => [
        `"${l.id}"`,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.company || '').replace(/"/g, '""')}"`,
        `"${(l.service || '').replace(/"/g, '""')}"`,
        `"${(l.message || '').replace(/"/g, '""')}"`,
        `"${(l.status || '').replace(/"/g, '""')}"`,
        `"${(l.createdAt || '').replace(/"/g, '""')}"`,
        `"${(l.notes || '').replace(/"/g, '""')}"`
      ]);

      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    },

    /* ---- Case Studies API ---- */
    getCaseStudies: function () {
      return getItem(STORAGE_KEYS.CASE_STUDIES, SEED_DATA.caseStudies);
    },

    addCaseStudy: function (csData) {
      const studies = this.getCaseStudies();
      const newCS = {
        id: 'cs-' + Date.now(),
        clientName: csData.clientName || 'New Client',
        slug: csData.slug || 'case-study-aanya.html',
        tagline: csData.tagline || '',
        category: csData.category || 'Case Study',
        industry: csData.industry || '',
        timeline: csData.timeline || '',
        image: csData.image || 'assets/hero_arc_1.png',
        followersGrowth: csData.followersGrowth || '0 → 100K',
        totalViews: csData.totalViews || '10M+',
        consultationsGrowth: csData.consultationsGrowth || '+100%',
        creatorRank: csData.creatorRank || 'Top 5%',
        challenge: csData.challenge || '',
        approach: csData.approach || '',
        quote: csData.quote || '',
        authorRole: csData.authorRole || '',
        authorAvatar: csData.authorAvatar || 'assets/team_sarah.png',
        featured: csData.featured !== undefined ? csData.featured : true
      };
      studies.unshift(newCS);
      setItem(STORAGE_KEYS.CASE_STUDIES, studies);
      return newCS;
    },

    updateCaseStudy: function (id, csData) {
      const studies = this.getCaseStudies();
      const idx = studies.findIndex(cs => cs.id === id);
      if (idx !== -1) {
        studies[idx] = { ...studies[idx], ...csData };
        setItem(STORAGE_KEYS.CASE_STUDIES, studies);
        return studies[idx];
      }
      return null;
    },

    deleteCaseStudy: function (id) {
      let studies = this.getCaseStudies();
      studies = studies.filter(cs => cs.id !== id);
      setItem(STORAGE_KEYS.CASE_STUDIES, studies);
      return studies;
    },

    /* ---- Portfolio Projects API ---- */
    getProjects: function () {
      return getItem(STORAGE_KEYS.PROJECTS, SEED_DATA.projects);
    },

    addProject: function (pData) {
      const projects = this.getProjects();
      const newProj = {
        id: 'proj-' + Date.now(),
        title: pData.title || 'Untitled Project',
        category: pData.category || 'Shorts & Reels',
        image: pData.image || 'assets/hero_arc_1.png',
        views: pData.views || '1M Views',
        client: pData.client || 'Client',
        videoUrl: pData.videoUrl || ''
      };
      projects.unshift(newProj);
      setItem(STORAGE_KEYS.PROJECTS, projects);
      return newProj;
    },

    updateProject: function (id, pData) {
      const projects = this.getProjects();
      const idx = projects.findIndex(p => p.id === id);
      if (idx !== -1) {
        projects[idx] = { ...projects[idx], ...pData };
        setItem(STORAGE_KEYS.PROJECTS, projects);
        return projects[idx];
      }
      return null;
    },

    deleteProject: function (id) {
      let projects = this.getProjects();
      projects = projects.filter(p => p.id !== id);
      setItem(STORAGE_KEYS.PROJECTS, projects);
      return projects;
    },

    /* ---- Services API ---- */
    getServices: function () {
      return getItem(STORAGE_KEYS.SERVICES, SEED_DATA.services);
    },

    addService: function (sData) {
      const services = this.getServices();
      const newSrv = {
        id: 'srv-' + Date.now(),
        title: sData.title || 'New Service',
        icon: sData.icon || '⚡',
        slug: sData.slug || 'services.html',
        tagline: sData.tagline || '',
        deliverables: sData.deliverables || [],
        timeline: sData.timeline || 'Project Based'
      };
      services.push(newSrv);
      setItem(STORAGE_KEYS.SERVICES, services);
      return newSrv;
    },

    updateService: function (id, sData) {
      const services = this.getServices();
      const idx = services.findIndex(s => s.id === id);
      if (idx !== -1) {
        services[idx] = { ...services[idx], ...sData };
        setItem(STORAGE_KEYS.SERVICES, services);
        return services[idx];
      }
      return null;
    },

    deleteService: function (id) {
      let services = this.getServices();
      services = services.filter(s => s.id !== id);
      setItem(STORAGE_KEYS.SERVICES, services);
      return services;
    },

    /* ---- Settings & Client Logos API ---- */
    getSettings: function () {
      return getItem(STORAGE_KEYS.SETTINGS, SEED_DATA.settings);
    },

    saveSettings: function (newSettings) {
      const settings = { ...this.getSettings(), ...newSettings };
      setItem(STORAGE_KEYS.SETTINGS, settings);
      return settings;
    },

    /* ---- Full Backup & Import ---- */
    exportCMSJSON: function () {
      const fullBackup = {
        caseStudies: this.getCaseStudies(),
        projects: this.getProjects(),
        services: this.getServices(),
        leads: this.getLeads(),
        settings: this.getSettings(),
        exportedAt: new Date().toISOString()
      };
      return JSON.stringify(fullBackup, null, 2);
    },

    importCMSJSON: function (jsonString) {
      try {
        const backup = JSON.parse(jsonString);
        if (backup.caseStudies) setItem(STORAGE_KEYS.CASE_STUDIES, backup.caseStudies);
        if (backup.projects) setItem(STORAGE_KEYS.PROJECTS, backup.projects);
        if (backup.services) setItem(STORAGE_KEYS.SERVICES, backup.services);
        if (backup.leads) setItem(STORAGE_KEYS.LEADS, backup.leads);
        if (backup.settings) setItem(STORAGE_KEYS.SETTINGS, backup.settings);
        return true;
      } catch (e) {
        console.error('[MarcaCMS] Import JSON failed:', e);
        return false;
      }
    },

    resetToDefaults: function () {
      localStorage.removeItem(STORAGE_KEYS.CASE_STUDIES);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.SERVICES);
      localStorage.removeItem(STORAGE_KEYS.LEADS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      initStore();
      return true;
    }
  };
})();
