/* ==========================================================================
   VMF FINANCE LIMITED - INTERACTIVE SCRIPTS & ENGINE LOGIC
   ========================================================================== */

/* ------------------------------------------------------------
   Page Scroll Reset & History Restoration (Header onwards)
   ------------------------------------------------------------ */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Smooth deep linking to target hash when arriving from other pages
function handleInitialHashScroll(immediate = false) {
  const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const isReload = (navEntry && navEntry.type === 'reload') || (window.performance && window.performance.navigation && window.performance.navigation.type === 1);
  if (isReload) {
    if (window.location.hash && history.replaceState) {
      history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
    return;
  }

  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;

  try {
    const target = document.querySelector(hash);
    if (!target) return;

    const scrollToEl = () => {
      if (typeof lenis !== 'undefined' && lenis) {
        lenis.scrollTo(target, { offset: -70, duration: immediate ? 0.01 : 1.15, immediate: immediate });
      } else {
        target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
      }
    };

    scrollToEl();
    setTimeout(scrollToEl, 150);
    setTimeout(scrollToEl, 400);

    if (hash === '#contact') {
      setTimeout(() => {
        const input = document.getElementById('contactFullName');
        if (input) {
          input.focus();
          input.classList.add('focused-pulse');
          setTimeout(() => input.classList.remove('focused-pulse'), 1500);
        }
      }, 550);
    }
  } catch (err) {}
}

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

// Logo Click Handler: Smoothly scroll to the very top header and reset URL
function handleLogoClick(e) {
  const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';
  if (isIndex) {
    if (e) e.preventDefault();
    if (history.replaceState) {
      history.replaceState(null, null, window.location.pathname);
    }
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(0, { duration: 1.15 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

/* ------------------------------------------------------------
   1. Cash Velocity Simulator Logic
   ------------------------------------------------------------ */
let currentFacility = 'invoice';

function switchSimFacility(type) {
  currentFacility = type;
  const tabInv = document.getElementById('simTabInv');
  const tabPO = document.getElementById('simTabPO');
  const tabWC = document.getElementById('simTabWC');

  if (tabInv) tabInv.classList.remove('active');
  if (tabPO) tabPO.classList.remove('active');
  if (tabWC) tabWC.classList.remove('active');

  const lbl1 = document.getElementById('sliderLabel1');
  const lbl2 = document.getElementById('sliderLabel2');
  const advLbl = document.getElementById('advRatioLabel');

  if (type === 'invoice') {
    if (tabInv) tabInv.classList.add('active');
    if (lbl1) lbl1.innerText = 'Invoice / Order Value';
    if (lbl2) lbl2.innerText = 'Payment Period';
    if (advLbl) advLbl.innerText = 'Estimated Funding (85%)';
  } else if (type === 'po') {
    if (tabPO) tabPO.classList.add('active');
    if (lbl1) lbl1.innerText = 'Purchase Order Value';
    if (lbl2) lbl2.innerText = 'Payment Period';
    if (advLbl) advLbl.innerText = 'Estimated Funding (75%)';
  } else {
    if (tabWC) tabWC.classList.add('active');
    if (lbl1) lbl1.innerText = 'Working Capital Requirement';
    if (lbl2) lbl2.innerText = 'Payment Period';
    if (advLbl) advLbl.innerText = 'Estimated Funding (80%)';
  }
  updateVelocity();
}

function updateVelocity() {
  const invInput = document.getElementById('invSlider');
  const delayInput = document.getElementById('delaySlider');
  if (!invInput || !delayInput) return;

  const inv = parseFloat(invInput.value);
  const delay = parseInt(delayInput.value);
  
  const invDisplay = document.getElementById('invoiceVal');
  const delayDisplay = document.getElementById('delayVal');
  if (invDisplay) invDisplay.innerText = '₹' + inv + ' Lakhs';
  if (delayDisplay) delayDisplay.innerText = delay + ' Days';
  
  let ratio = 0.85;
  if (currentFacility === 'po') ratio = 0.75;
  if (currentFacility === 'wc') ratio = 0.80;

  const adv = (inv * ratio).toFixed(1);
  const advAmt = document.getElementById('advAmt');
  const turnaroundStat = document.getElementById('turnaroundStat');

  if (advAmt) {
    advAmt.innerText = '₹' + adv + ' Lakhs';
    advAmt.classList.remove('stat-pop');
    void advAmt.offsetWidth;
    advAmt.classList.add('stat-pop');
  }
  if (turnaroundStat) turnaroundStat.innerText = 'Subject to approval';
}

function openApplyWithSim() {
  const invInput = document.getElementById('invSlider');
  const inv = invInput ? invInput.value : '50';
  let facName = 'Invoice Financing';
  if (currentFacility === 'po') facName = 'Purchase Order Financing';
  if (currentFacility === 'wc') facName = 'Working Capital Loans';

  openApplyModal(facName + ' (Simulated Amount: ₹ ' + inv + 'L)');
}

/* ------------------------------------------------------------
   2. Exact Product Data & Operational Workflows
   ------------------------------------------------------------ */
const originalProductData = {
  inv: {
    title: "Invoice Financing",
    chip: "Receivables Acceleration",
    pitch: "Turn eligible invoices into working capital",
    desc: "Get funds against eligible invoices from approved corporate buyers while awaiting payment.",
    docs: "Business KYC, GST and financial details, bank statements, purchase orders, invoices, delivery proof and buyer confirmation, as applicable.",
    steps: [
      { num: "1", title: "Submit Invoices", desc: "The business submits eligible invoices and supporting commercial documents." },
      { num: "2", title: "Transaction Verification", desc: "VMF verifies the underlying transaction, buyer details and receivable." },
      { num: "3", title: "Credit Assessment", desc: "The proposal undergoes credit assessment and approval against credit criteria." },
      { num: "4", title: "Disbursement", desc: "Funding is disbursed in accordance with sanctioned facility and executed documents." },
      { num: "5", title: "Settlement", desc: "Repayment and settlement take place according to the agreed arrangement." }
    ],
    note: "All invoices, buyers, advance amounts, tenures and repayment arrangements are subject to VMF's eligibility criteria and approval.",
    applyBtnText: "Apply Now"
  },
  po: {
    title: "Purchase Order Financing",
    chip: "Input Procurement & Fulfillment",
    pitch: "Fund confirmed orders with confidence",
    desc: "Fund materials, production, and delivery for confirmed orders without straining daily cash flow.",
    docs: "Confirmed purchase order, related documents, supplier capacity details, material cost estimates, buyer details and KYC.",
    steps: [
      { num: "1", title: "Submit Order Documents", desc: "The applicant submits the confirmed purchase order and order-related documents." },
      { num: "2", title: "Capacity Evaluation", desc: "VMF evaluates the buyer, order authenticity, supplier capacity, execution costs and cash flows." },
      { num: "3", title: "Facility Structuring", desc: "The facility is structured based on the transaction and assessed credit risk." },
      { num: "4", title: "Direct Disbursement", desc: "Approved funds disbursed per sanctioned terms, including direct supplier payments where applicable." },
      { num: "5", title: "Milestone Repayment", desc: "Repayment is made as stipulated in facility documents upon buyer settlement." }
    ],
    note: "Funding is not automatic against a purchase order. Order validity, margins, execution capability, buyer acceptance, repayment sources and any required credit support are assessed before approval.",
    applyBtnText: "Apply Now"
  },
  wc: {
    title: "Working Capital Loans",
    chip: "Operational Liquidity",
    pitch: "Finance your daily business needs",
    desc: "Cover cash gaps, stock purchases, and daily expenses with funding aligned to your cash flow.",
    docs: "Business, financial and KYC details, past audited records, banking history, existing liabilities and cash-flow forecasts.",
    steps: [
      { num: "1", title: "Information Submission", desc: "The applicant submits business, financial and KYC information." },
      { num: "2", title: "Financial & Conduct Check", desc: "VMF assesses financial performance, banking conduct, existing obligations, cash flows and capacity." },
      { num: "3", title: "Pricing & Sizing", desc: "Proposed facility amount, pricing, tenure, repayment schedule and security requirements determined." },
      { num: "4", title: "Sanction & Disclosure", desc: "The borrower receives sanction terms and transparent loan agreement schedule before entering loan arrangement." },
      { num: "5", title: "Disbursement & Servicing", desc: "Disbursement and repayment follow executed loan documents per applicable credit policies." }
    ],
    note: "Facility availability, loan structure and terms depend on the applicant's eligibility and VMF's applicable credit policies.",
    applyBtnText: "Apply Now"
  }
};

const productWorkflows = originalProductData; // Backward compatibility alias

/* ------------------------------------------------------------
   2. Explore Now Product Steps Modal Controller (w: 60%, h: 70%)
   ------------------------------------------------------------ */
let currentExploreKey = 'inv';

const facilityLabels = {
  inv: "Invoice Financing",
  po: "Purchase Order Financing",
  wc: "Working Capital Loans"
};

function openExploreStepsModal(key) {
  currentExploreKey = key || 'inv';
  switchExploreModalFacility(currentExploreKey);
  const modal = document.getElementById('exploreStepsModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  // Pause Lenis smooth-scroll so modal wheel & trackpad events scroll natively
  if (typeof lenis !== 'undefined' && lenis) {
    try { lenis.stop(); } catch (err) {}
  }
  // Reset scroll position to top
  const expBody = document.getElementById('expModalBody');
  if (expBody) {
    expBody.scrollTop = 0;
  }
}

function closeExploreStepsModal() {
  const modal = document.getElementById('exploreStepsModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  // Resume Lenis smooth-scroll on main page
  if (typeof lenis !== 'undefined' && lenis) {
    try { lenis.start(); } catch (err) {}
  }
}

function closeExploreStepsModalOnBackdrop(e) {
  if (e.target && e.target.id === 'exploreStepsModal') {
    closeExploreStepsModal();
  }
}

const stepIconsSvg = {
  1: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  2: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><line x1="9" y1="9" x2="9.01" y2="9"/></svg>`,
  3: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  4: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  5: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
};

function switchExploreModalFacility(key) {
  currentExploreKey = key || 'inv';
  const data = originalProductData[currentExploreKey] || originalProductData.inv;
  if (!data) return;

  const chip = document.getElementById('expModalChip');
  const title = document.getElementById('expModalTitle');
  const pitch = document.getElementById('expModalPitch');
  const desc = document.getElementById('expModalDesc');
  const docs = document.getElementById('expModalDocs');
  const stepsGrid = document.getElementById('expModalStepsGrid');
  const policyNote = document.getElementById('expModalPolicyNote');
  const btnText = document.getElementById('expModalApplyBtnText');

  if (chip) chip.innerText = data.chip;
  if (title) title.innerText = data.title;
  if (pitch) pitch.innerText = data.pitch;
  if (desc) desc.innerText = data.desc;
  if (docs) docs.innerText = data.docs;
  if (policyNote) policyNote.innerText = data.note;
  if (btnText) btnText.innerText = data.applyBtnText;

  if (stepsGrid) {
    const stepsHtml = data.steps.map(s => {
      const numStr = String(s.num).padStart(2, '0');
      return `
        <div class="exp-step-card-row">
          <div class="exp-step-badge-wrap">
            <span class="exp-step-num-pill">${numStr}</span>
          </div>
          <div class="exp-step-content-wrap">
            <h5 class="exp-step-row-title">${s.title}</h5>
            <p class="exp-step-row-desc">${s.desc}</p>
          </div>
        </div>
      `;
    }).join('');

    stepsGrid.innerHTML = `
      <div class="exp-steps-vertical-stack">
        ${stepsHtml}
      </div>
    `;
  }
}

function applyFromExploreModal() {
  const facName = facilityLabels[currentExploreKey] || 'General MSME Financing';
  closeExploreStepsModal();
  openApplyModal(facName);
}

// Backward compatibility helper
function viewProductDetails(key) {
  openExploreStepsModal(key);
}

// Modal event listeners (wheel isolation & ESC key)
document.addEventListener('DOMContentLoaded', () => {
  const expBody = document.getElementById('expModalBody');
  if (expBody) {
    expBody.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const expModal = document.getElementById('exploreStepsModal');
      if (expModal && expModal.style.display === 'flex') {
        closeExploreStepsModal();
      }
    }
  });
});

/* ------------------------------------------------------------
   3. How We Finance - 6 Step Interactive Inspector
   ------------------------------------------------------------ */
const roadmapData = {
  1: {
    badge: "Step 1 of 6 • Initiation",
    title: "Share Your Requirement",
    desc: "Preliminary review of enterprise transaction volumes, debtor quality, and required facility structure to identify eligibility.",
    action: "Same-day advisory triage & facility mapping."
  },
  2: {
    badge: "Step 2 of 6 • Documentation",
    title: "Submit Documents",
    desc: "Seamless digital ingestion of commercial invoices, purchase orders, GST returns, and bank statements for rapid validation.",
    action: "Verification completed within 24 hours of submission."
  },
  3: {
    badge: "Step 3 of 6 • Underwriting",
    title: "Credit Assessment",
    desc: "Comprehensive appraisal evaluating real cash flows, buyer standing, and historical fulfillment rather than demanding static collateral.",
    action: "Risk assessment completed within 24–48 business hours."
  },
  4: {
    badge: "Step 4 of 6 • Disclosure",
    title: "Sanction and Disclosure",
    desc: "Formal issuance of sanction letter paired with transparent loan terms disclosing APR, charges, and exact repayment milestones.",
    action: "Transparent terms issued upfront before borrower commitment."
  },
  5: {
    badge: "Step 5 of 6 • Execution",
    title: "Documentation and Disbursement",
    desc: "Streamlined execution of digital loan agreements followed by immediate fund transfer directly to your designated business account.",
    action: "Disbursement executed within 24 hours of agreement signing."
  },
  6: {
    badge: "Step 6 of 6 • Settlement",
    title: "Repayment and Closure",
    desc: "Collections reconciled seamlessly against buyer realizations, automatically replenishing your sanctioned limit for continuous liquidity.",
    action: "Real-time limit renewal & formal security release upon settlement."
  }
};

function selectRoadmapStep(stepNum, el) {
  document.querySelectorAll('.roadmap-item').forEach(item => item.classList.remove('active'));
  if (el) el.classList.add('active');

  const d = roadmapData[stepNum];
  if (!d) return;

  const badge = document.getElementById('inspBadge');
  const title = document.getElementById('inspTitle');
  const desc = document.getElementById('inspDesc');
  const deliverable = document.getElementById('inspDeliverable');

  if (badge) badge.innerText = d.badge;
  if (title) title.innerText = d.title;
  if (desc) desc.innerText = d.desc;
  if (deliverable) deliverable.innerHTML = '<strong>Applicant Action:</strong> ' + d.action;
}

/* ------------------------------------------------------------
   4. Modal Application & Form Submission Handlers
   ------------------------------------------------------------ */
function openApplyModal(facilityName) {
  const title = document.getElementById('modalFacilityTitle');
  const input = document.getElementById('modalFacilityInput');
  const modal = document.getElementById('appModal');

  if (title) title.innerText = 'Apply: ' + facilityName;
  if (input) input.value = facilityName;
  if (modal) modal.classList.add('open');
}

function closeAppModal() {
  const modal = document.getElementById('appModal');
  if (modal) modal.classList.remove('open');
}

function closeModalOnBackdrop(e) {
  if (e.target && e.target.id === 'appModal') {
    closeAppModal();
  }
}

function showSuccess(refId) {
  closeAppModal();
  const docketEl = document.getElementById('successDocketId');
  const modal = document.getElementById('successModal');
  if (docketEl) docketEl.innerText = refId;
  if (modal) modal.classList.add('open');
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.remove('open');
}

function handleFormSubmit(e) {
  e.preventDefault();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const ref = 'VMF-' + new Date().getFullYear() + '-' + randNum;
  showSuccess(ref);
  const form = document.getElementById('financeForm');
  if (form) form.reset();
}

/* ------------------------------------------------------------
   Enhanced Real-Time Form Validation Engine (Fintech Standard)
   ------------------------------------------------------------ */
function setFieldError(inputEl, errorEl, message) {
  if (!inputEl) return;
  inputEl.classList.remove('is-valid');
  inputEl.classList.add('is-invalid');
  if (errorEl) {
    if (message) errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

function clearFieldError(inputEl, errorEl) {
  if (!inputEl) return;
  inputEl.classList.remove('is-invalid');
  inputEl.classList.add('is-valid');
  if (errorEl) {
    errorEl.classList.remove('visible');
  }
}

function resetValidationState(inputEl, errorEl) {
  if (!inputEl) return;
  inputEl.classList.remove('is-valid', 'is-invalid');
  if (errorEl) {
    errorEl.classList.remove('visible');
  }
}

function validateFullName(name) {
  if (!name || name.trim().length < 2) return 'Please enter your full legal name (at least 2 characters).';
  if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) return 'Please enter valid alphabetical characters.';
  return '';
}

function validateEmail(email) {
  if (!email || !email.trim()) return 'Please enter your business email address.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email format (e.g. name@domain.com).';
  return '';
}

function validatePhone(phone, countryCode = '+91') {
  if (!phone || !phone.trim()) return 'Please enter your mobile phone number.';
  const cleaned = phone.trim().replace(/[\s-]/g, '');
  if (countryCode === '+91') {
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      return 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }
  } else {
    if (!/^\d{6,15}$/.test(cleaned)) {
      return 'Please enter a valid phone number (6 to 15 digits).';
    }
  }
  return '';
}

function handleContactSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactFullName');
  const emailInput = document.getElementById('contactEmail');
  const phoneInput = document.getElementById('contactPhone');
  const countryCode = document.getElementById('contactCountryCode')?.value || '+91';
  const typeSelect = document.getElementById('contactEnquiryType');
  const msgInput = document.getElementById('contactMessage');
  const consentBox = document.getElementById('contactConsent');

  const errName = document.getElementById('errorFullName');
  const errEmail = document.getElementById('errorEmail');
  const errPhone = document.getElementById('errorPhone');
  const errType = document.getElementById('errorEnquiryType');
  const errMsg = document.getElementById('errorMessage');
  const errConsent = document.getElementById('errorConsent');

  let isValid = true;
  let firstInvalidEl = null;

  // Validate Name
  const nameErr = validateFullName(nameInput ? nameInput.value : '');
  if (nameErr) {
    setFieldError(nameInput, errName, nameErr);
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = nameInput;
  } else {
    clearFieldError(nameInput, errName);
  }

  // Validate Email
  const emailErr = validateEmail(emailInput ? emailInput.value : '');
  if (emailErr) {
    setFieldError(emailInput, errEmail, emailErr);
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = emailInput;
  } else {
    clearFieldError(emailInput, errEmail);
  }

  // Validate Phone
  const phoneErr = validatePhone(phoneInput ? phoneInput.value : '', countryCode);
  if (phoneErr) {
    setFieldError(phoneInput, errPhone, phoneErr);
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = phoneInput;
  } else {
    clearFieldError(phoneInput, errPhone);
  }

  // Validate Enquiry Type
  if (!typeSelect || !typeSelect.value) {
    setFieldError(typeSelect, errType, 'Please select the financing product you are seeking.');
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = typeSelect;
  } else {
    clearFieldError(typeSelect, errType);
  }

  // Validate Message
  if (!msgInput || msgInput.value.trim().length < 10) {
    setFieldError(msgInput, errMsg, 'Please provide details regarding your requirement (min 10 characters).');
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = msgInput;
  } else {
    clearFieldError(msgInput, errMsg);
  }

  // Validate Consent
  if (!consentBox || !consentBox.checked) {
    if (errConsent) errConsent.classList.add('visible');
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = consentBox;
  } else {
    if (errConsent) errConsent.classList.remove('visible');
  }

  if (!isValid) {
    if (firstInvalidEl && typeof firstInvalidEl.focus === 'function') {
      firstInvalidEl.focus();
    }
    return;
  }

  const btn = document.getElementById('contactSubmitBtn') || form.querySelector('button[type="submit"]');
  const originalHTML = btn ? btn.innerHTML : '';

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="contact-spinner"></span> <span>Registering Application...</span>`;
  }

  // Submit and show confirmation docket
  setTimeout(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const ref = 'VMF-APP-' + new Date().getFullYear() + '-' + randNum;
    showSuccess(ref);
    form.reset();

    // Reset visual validation classes
    [nameInput, emailInput, phoneInput, typeSelect, msgInput].forEach(el => resetValidationState(el));
    [errName, errEmail, errPhone, errType, errMsg, errConsent].forEach(el => {
      if (el) el.classList.remove('visible');
    });
  }, 700);
}

// Attach real-time validation listeners
document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('contactFullName');
  const emailInput = document.getElementById('contactEmail');
  const phoneInput = document.getElementById('contactPhone');
  const typeSelect = document.getElementById('contactEnquiryType');
  const msgInput = document.getElementById('contactMessage');
  const consentBox = document.getElementById('contactConsent');

  const errName = document.getElementById('errorFullName');
  const errEmail = document.getElementById('errorEmail');
  const errPhone = document.getElementById('errorPhone');
  const errType = document.getElementById('errorEnquiryType');
  const errMsg = document.getElementById('errorMessage');
  const errConsent = document.getElementById('errorConsent');

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.classList.contains('is-invalid')) {
        const err = validateFullName(nameInput.value);
        if (!err) clearFieldError(nameInput, errName);
      }
    });
    nameInput.addEventListener('blur', () => {
      if (nameInput.value.trim()) {
        const err = validateFullName(nameInput.value);
        if (err) setFieldError(nameInput, errName, err);
        else clearFieldError(nameInput, errName);
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (emailInput.classList.contains('is-invalid')) {
        const err = validateEmail(emailInput.value);
        if (!err) clearFieldError(emailInput, errEmail);
      }
    });
    emailInput.addEventListener('blur', () => {
      if (emailInput.value.trim()) {
        const err = validateEmail(emailInput.value);
        if (err) setFieldError(emailInput, errEmail, err);
        else clearFieldError(emailInput, errEmail);
      }
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[^\d\s-]/g, '');
      if (phoneInput.classList.contains('is-invalid')) {
        const countryCode = document.getElementById('contactCountryCode')?.value || '+91';
        const err = validatePhone(phoneInput.value, countryCode);
        if (!err) clearFieldError(phoneInput, errPhone);
      }
    });
    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value.trim()) {
        const countryCode = document.getElementById('contactCountryCode')?.value || '+91';
        const err = validatePhone(phoneInput.value, countryCode);
        if (err) setFieldError(phoneInput, errPhone, err);
        else clearFieldError(phoneInput, errPhone);
      }
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      if (typeSelect.value) clearFieldError(typeSelect, errType);
    });
  }

  if (msgInput) {
    msgInput.addEventListener('input', () => {
      if (msgInput.classList.contains('is-invalid') && msgInput.value.trim().length >= 10) {
        clearFieldError(msgInput, errMsg);
      }
    });
  }

  if (consentBox) {
    consentBox.addEventListener('change', () => {
      if (consentBox.checked && errConsent) {
        errConsent.classList.remove('visible');
      }
    });
  }
});

function handleModalSubmit(e) {
  e.preventDefault();
  const busInput = document.getElementById('mBusinessName');
  const personInput = document.getElementById('mContactPerson');
  const phoneInput = document.getElementById('mPhone');
  const fundInput = document.getElementById('mFundingAmt');

  let valid = true;
  if (!busInput || !busInput.value.trim()) {
    if (busInput) busInput.classList.add('is-invalid');
    valid = false;
  } else if (busInput) {
    busInput.classList.remove('is-invalid');
    busInput.classList.add('is-valid');
  }

  if (!personInput || !personInput.value.trim()) {
    if (personInput) personInput.classList.add('is-invalid');
    valid = false;
  } else if (personInput) {
    personInput.classList.remove('is-invalid');
    personInput.classList.add('is-valid');
  }

  if (!phoneInput || !phoneInput.value.trim() || phoneInput.value.replace(/\D/g, '').length < 10) {
    if (phoneInput) phoneInput.classList.add('is-invalid');
    valid = false;
  } else if (phoneInput) {
    phoneInput.classList.remove('is-invalid');
    phoneInput.classList.add('is-valid');
  }

  if (!fundInput || !fundInput.value.trim()) {
    if (fundInput) fundInput.classList.add('is-invalid');
    valid = false;
  } else if (fundInput) {
    fundInput.classList.remove('is-invalid');
    fundInput.classList.add('is-valid');
  }

  if (!valid) return;

  closeAppModal();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const ref = 'VMF-APP-' + new Date().getFullYear() + '-' + randNum;
  showSuccess(ref);
}

/* ==========================================================================
   LENIS & GSAP SCROLL MOTION ENGINE (VMF FINANCE)
   ========================================================================== */

let lenis = null;
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   1. Lenis Smooth Scrolling Engine
   ------------------------------------------------------------ */
function initLenis() {
  if (isReducedMotion) return;
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
    infinite: false
  });
  window.lenis = lenis;

  const pageHash = window.location.hash;
  if (!pageHash || pageHash.length <= 1) {
    lenis.scrollTo(0, { immediate: true });
  }

  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }

  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

/* ------------------------------------------------------------
   2. GSAP Plugins & Custom Easing Registration
   ------------------------------------------------------------ */
function initGSAPPlugins() {
  if (typeof gsap === 'undefined') return;

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollTrigger.clearScrollMemory === 'function') {
      ScrollTrigger.clearScrollMemory('manual');
    }
  }

  if (typeof CustomEase !== 'undefined') {
    gsap.registerPlugin(CustomEase);
    CustomEase.create('vmfEase', '0.22, 1, 0.36, 1');
  } else {
    // Exact cubic-bezier(0.22, 1, 0.36, 1) fallback solver
    gsap.registerEase('vmfEase', (t) => {
      const x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1;
      let s = t;
      for (let i = 0; i < 6; i++) {
        const currentX = ((1 - 3*x2 + 3*x1)*s + (3*x2 - 6*x1))*s*s + 3*x1*s - t;
        const dX = 3*(1 - 3*x2 + 3*x1)*s*s + 2*(3*x2 - 6*x1)*s + 3*x1;
        if (Math.abs(currentX) < 1e-4 || Math.abs(dX) < 1e-4) break;
        s -= currentX / dX;
      }
      return ((1 - 3*y2 + 3*y1)*s + (3*y2 - 6*y1))*s*s + 3*y1*s;
    });
  }
}

/* ------------------------------------------------------------
   3. Item 1: <ScrambleText /> Component
   Letters start distorted (stretched, overlapped, mixed bold and thin, random glyphs),
   then settle into the clean title in ~1.2s with ease-out.
   ------------------------------------------------------------ */
class ScrambleText {
  constructor(element, options = {}) {
    this.element = element;
    this.duration = options.duration || 1.2;
    this.chars = options.chars || '!<>-_\\/[]{}—=+*^?#_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.init();
  }

  init() {
    if (isReducedMotion) return;

    const originalNodes = Array.from(this.element.childNodes);
    const charList = [];
    this.element.innerHTML = '';

    const processNode = (node, parent) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (parent === this.element && /^\s*$/.test(text)) {
          return;
        }
        const words = text.split(/(\s+)/);
        words.forEach(word => {
          if (/^\s+$/.test(word)) {
            parent.appendChild(document.createTextNode(word));
          } else {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'scramble-word';
            for (let i = 0; i < word.length; i++) {
              const charSpan = document.createElement('span');
              charSpan.className = 'scramble-char';
              charSpan.textContent = word[i];
              wordSpan.appendChild(charSpan);
              charList.push({
                span: charSpan,
                realChar: word[i]
              });
            }
            parent.appendChild(wordSpan);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        parent.appendChild(clone);
        Array.from(node.childNodes).forEach(child => processNode(child, clone));
      }
    };

    originalNodes.forEach(node => processNode(node, this.element));

    const totalChars = charList.length;
    charList.forEach((c, idx) => {
      // Left-to-right settlement schedule
      c.resolveAt = 0.22 + 0.78 * Math.pow(idx / (totalChars - 1 || 1), 0.75);
    });

    this.play(charList);
  }

  play(charList) {
    const startTime = performance.now();
    const durationMs = this.duration * 1000;

    const update = (now) => {
      const elapsed = now - startTime;
      const linearProgress = Math.min(1, elapsed / durationMs);
      // Cubic ease-out settlement: 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - linearProgress, 3);

      charList.forEach(c => {
        if (easeProgress >= c.resolveAt) {
          c.span.textContent = c.realChar;
          c.span.style.transform = '';
          c.span.style.fontWeight = '';
          c.span.style.letterSpacing = '';
          c.span.style.display = '';
        } else {
          // Distorted phase: random glyph, stretched, overlapped, mixed bold and thin
          const rand = this.chars[Math.floor(Math.random() * this.chars.length)];
          c.span.textContent = rand;
          const stretchX = (0.72 + Math.random() * 0.55).toFixed(2);
          const stretchY = (0.85 + Math.random() * 0.35).toFixed(2);
          const weight = Math.random() > 0.5 ? '800' : '300';
          const overlap = (Math.random() * -2.2).toFixed(1) + 'px';
          c.span.style.transform = `scale(${stretchX}, ${stretchY})`;
          c.span.style.fontWeight = weight;
          c.span.style.letterSpacing = overlap;
          c.span.style.display = 'inline-block';
        }
      });

      if (linearProgress < 1) {
        requestAnimationFrame(update);
      } else {
        charList.forEach(c => {
          c.span.textContent = c.realChar;
          c.span.style.transform = '';
          c.span.style.fontWeight = '';
          c.span.style.letterSpacing = '';
          c.span.style.display = '';
        });
      }
    };

    requestAnimationFrame(update);
  }
}

class ScrambleTextElement extends HTMLElement {
  connectedCallback() {
    const run = () => {
      new ScrambleText(this, {
        duration: parseFloat(this.getAttribute('duration')) || 1.2
      });
    };
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  }
}
if (!customElements.get('scramble-text')) {
  customElements.define('scramble-text', ScrambleTextElement);
}
window.ScrambleText = ScrambleText;

/* ------------------------------------------------------------
   Hero Stagger Entrance Sequence (Subheading, CTAs, Badges)
   Subheading & paragraphs below fade in & slide up 20px, staggered by 0.15s.
   ------------------------------------------------------------ */
function initHeroEntrance() {
  if (isReducedMotion || typeof gsap === 'undefined') return;

  const heroP = document.querySelector('.hero-p');
  const heroCta = document.querySelector('.hero-cta-entrance') || document.querySelector('.hero-sec .btn-cta')?.parentElement;
  const heroBadges = document.querySelector('.hero-badges-row');
  const simCard = document.querySelector('.velocity-card');

  const timeline = gsap.timeline({ delay: 0.35 });

  const elements = [heroP, heroCta, heroBadges].filter(Boolean);
  if (elements.length) {
    timeline.fromTo(elements,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'vmfEase' }
    );
  }

  if (simCard) {
    timeline.fromTo(simCard,
      { opacity: 0, x: 35, scale: 0.98 },
      { opacity: 1, x: 0, scale: 1, duration: 0.95, ease: 'vmfEase' },
      0.15
    );
  }
}

/* ------------------------------------------------------------
   4. Items 2 to 4: <Reveal /> Reusable Component
   - mode="section": Smooth fade in + slide up when entering (no leaving blur)
   - mode="focus": Items start at 0.3 opacity; center animates to 1, previous dims back down
   - mode="zigzag": Items alternate entering from left/right (x: -40 / +40 to 0) while fading in
   ------------------------------------------------------------ */
class Reveal {
  static init(element, options = {}) {
    if (!element || isReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (element._revealInitialized) return;
    element._revealInitialized = true;

    const mode = options.mode || element.getAttribute('mode') || 'section';

    if (mode === 'section') {
      Reveal.initSectionReveal(element, options);
    } else if (mode === 'focus' || mode === 'dim-focus') {
      Reveal.initDimFocus(element, options);
    } else if (mode === 'zigzag') {
      Reveal.initZigzag(element, options);
    }
  }

  // Item 2: SECTION REVEAL (every section)
  static initSectionReveal(section, options = {}) {
    if (isReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Reset any unwanted filter
    section.style.filter = 'none';

    // Entrance Scrub: Clean fade in + gentle slide up
    gsap.fromTo(section,
      { opacity: 0.15, y: 35 },
      {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 95%',
          end: 'top 65%',
          scrub: 0.6,
          onUpdate: (self) => {
            if (self.progress >= 0.999) {
              section.style.transform = '';
            }
          },
          onLeave: () => {
            section.style.transform = '';
          }
        }
      }
    );
  }

  // Item 3: DIM-TO-BRIGHT FOCUS
  static initDimFocus(container, options = {}) {
    if (isReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const selector = options.selector || container.getAttribute('selector') || '.scroll-card, .roadmap-item, .dim-focus-item';
    let items = Array.from(container.querySelectorAll(selector));
    if (!items.length) items = Array.from(container.children);
    if (!items.length) return;

    items.forEach(item => {
      gsap.set(item, { opacity: 0.3, scale: 0.985, transformOrigin: 'center center' });

      gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.3
        }
      })
      .to(item, { opacity: 1, scale: 1, duration: 0.5, ease: 'power1.out' })
      .to(item, { opacity: 0.3, scale: 0.985, duration: 0.5, ease: 'power1.in' });
    });
  }

  // Item 4: ZIGZAG ENTRANCE
  static initZigzag(container, options = {}) {
    if (isReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const selector = options.selector || container.getAttribute('selector') || '.value-card, .roadmap-item, .step-flow-item';
    let items = Array.from(container.querySelectorAll(selector));
    if (!items.length) items = Array.from(container.children);
    if (!items.length) return;

    items.forEach((item, idx) => {
      const fromLeft = idx % 2 === 0;
      const xOffset = fromLeft ? -40 : 40;

      gsap.fromTo(item,
        { opacity: 0, x: xOffset },
        {
          opacity: 1,
          x: 0,
          duration: 0.85,
          ease: 'vmfEase',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  // Auto-initialize all <reveal-wrapper> and [data-reveal] elements
  static autoInit() {
    if (isReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('reveal-wrapper').forEach(el => {
      const mode = el.getAttribute('mode') || 'section';
      const selector = el.getAttribute('selector') || '';
      Reveal.init(el, { mode, selector });
    });

    document.querySelectorAll('[data-reveal]').forEach(el => {
      const mode = el.getAttribute('data-reveal') || 'section';
      const selector = el.getAttribute('data-selector') || '';
      Reveal.init(el, { mode, selector });
    });
  }
}

class RevealWrapperElement extends HTMLElement {
  connectedCallback() {
    const run = () => {
      const mode = this.getAttribute('mode') || 'section';
      const selector = this.getAttribute('selector') || '';
      Reveal.init(this, { mode, selector });
    };
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  }
}
if (!customElements.get('reveal-wrapper')) {
  customElements.define('reveal-wrapper', RevealWrapperElement);
}
window.Reveal = Reveal;

/* ------------------------------------------------------------
   5. Item 5: STICKY TITLE & SCROLLING CARDS FOCUS
   Large section title stays pinned while its cards scroll past beside it.
   Only the active card is bright.
   ------------------------------------------------------------ */
function initStickyTitleAndFocus() {
  if (isReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Auto-bind dim-focus to scrolling card columns in sticky sections if not wrapped
  document.querySelectorAll('.scroll-cards-col').forEach(col => {
    if (!col.closest('reveal-wrapper[mode="focus"]') && !col.matches('reveal-wrapper[mode="focus"]')) {
      Reveal.initDimFocus(col, { selector: '.scroll-card' });
    }
  });
}

/* ------------------------------------------------------------
   6. Item 6: STAGGERED CARDS & HOVER LIFT
   Cards fade up one after another (0.1s stagger).
   ------------------------------------------------------------ */
function initStaggeredCards() {
  if (isReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const cardGrids = document.querySelectorAll('.industries-grid, .prod-3d-grid, .gov-grid, .mission-vision-grid, .pillars-grid, .connected-timeline');
  cardGrids.forEach(grid => {
    const cards = Array.from(grid.children);
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'vmfEase',
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

/* ------------------------------------------------------------
   7. Item 7: NAV SCROLL-SPY, ANCHOR SMOOTH SCROLL, & LOGO SHRINK
   - Nav link gets animated underline (width 0 to 100%, 0.3s)
   - Clicking a link smooth-scrolls to its section using Lenis
   - Logo shrinks slightly as user scrolls
   ------------------------------------------------------------ */
function initNavScrollSpy() {
  const nav = document.querySelector('.main-nav');
  const logo = document.querySelector('.brand-logo-img');
  const navLinks = document.querySelectorAll('.nav-links a');

  // Smooth scroll click handler using Lenis
  document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(anchor => {
    const rawHref = anchor.getAttribute('href');
    const hash = rawHref.includes('#') ? '#' + rawHref.split('#')[1] : '';
    if (hash && hash.length > 1) {
      anchor.addEventListener('click', (e) => {
        const isCurrentPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !rawHref.startsWith('index.html');
        if (isCurrentPage) {
          const target = document.querySelector(hash);
          if (target) {
            e.preventDefault();
            if (lenis) {
              lenis.scrollTo(target, { offset: -80, duration: 1.15 });
            } else {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    }
  });

  if (isReducedMotion || typeof ScrollTrigger === 'undefined') return;

  // Active section spy
  function setActive(activeLink) {
    navLinks.forEach(l => l.classList.remove('active'));
    if (activeLink) activeLink.classList.add('active');
  }

  // Spy on Hero: Ensure no green line appears on Products or any link while on Hero
  const heroSec = document.getElementById('hero');
  if (heroSec) {
    ScrollTrigger.create({
      trigger: heroSec,
      start: 'top top',
      end: 'bottom 25%',
      onEnter: () => setActive(null),
      onEnterBack: () => setActive(null)
    });
  }

  const trackedSections = Array.from(document.querySelectorAll('section[id], reveal-wrapper > section[id]'));
  trackedSections.forEach(section => {
    const id = section.getAttribute('id');
    if (id === 'hero') return;

    const matchingLink = document.querySelector(`.nav-links a[href="#${id}"], .nav-links a[href="index.html#${id}"]`);
    if (matchingLink) {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 35%',
        end: 'bottom 35%',
        onEnter: () => setActive(matchingLink),
        onEnterBack: () => setActive(matchingLink),
        onLeaveBack: () => {
          if (id === 'products') setActive(null);
        }
      });
    }
  });

  // On page load or scroll near top, ensure no nav link is active
  function checkTopNavState() {
    if ((window.scrollY || document.documentElement.scrollTop) < 180) {
      setActive(null);
    }
  }
  window.addEventListener('scroll', checkTopNavState, { passive: true });
  checkTopNavState();

  const siteHeader = document.getElementById('siteHeader');
  const footerEl = document.querySelector('.site-footer');

  function updateHeaderScrolled() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const isScrolled = scrollY > 20;
    if (nav) nav.classList.toggle('nav-scrolled', isScrolled);
    if (siteHeader) siteHeader.classList.toggle('nav-scrolled', isScrolled);

    if (footerEl && siteHeader) {
      const footerRect = footerEl.getBoundingClientRect();
      const headerHeight = siteHeader.offsetHeight || 80;
      const isOverFooter = footerRect.top <= (headerHeight + 10);
      siteHeader.classList.toggle('nav-over-footer', isOverFooter);
      if (nav) nav.classList.toggle('nav-over-footer', isOverFooter);
    }
  }
  window.addEventListener('scroll', updateHeaderScrolled, { passive: true });
  if (typeof lenis !== 'undefined' && lenis) {
    lenis.on('scroll', updateHeaderScrolled);
  }
  updateHeaderScrolled();

  if (footerEl && siteHeader && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: footerEl,
      start: () => `top top+=${siteHeader.offsetHeight || 80}px`,
      end: 'bottom top',
      onEnter: () => {
        siteHeader.classList.add('nav-over-footer');
        if (nav) nav.classList.add('nav-over-footer');
      },
      onLeaveBack: () => {
        siteHeader.classList.remove('nav-over-footer');
        if (nav) nav.classList.remove('nav-over-footer');
      }
    });
  }

  // Logo shrink transition on scroll
  ScrollTrigger.create({
    start: 'top top',
    end: 120,
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      if (logo) {
        const scaleVal = 1 - (p * 0.16); // shrinks smoothly from 1.0 to 0.84
        logo.style.transform = `scale(${scaleVal})`;
        logo.style.transformOrigin = 'left center';
      }
    }
  });
}

/* ------------------------------------------------------------
   8. Board of Directors & KMP: Member Data & LinkedIn Configuration
   Add or update member LinkedIn profile URLs below:
   1. Siva Krishna Kolli — [PASTE_LINKEDIN_PROFILE_URL]
   2. Raj Sekhar Aluri — [PASTE_LINKEDIN_PROFILE_URL]
   3. Srinivasa Rao Palla — [PASTE_LINKEDIN_PROFILE_URL]

   Rule: If a valid profile URL is missing or set to placeholder,
   that member's LinkedIn icon is automatically hidden.
   ------------------------------------------------------------ */
const GOVERNANCE_MEMBERS_DATA = [
  {
    name: "Siva Krishna Kolli",
    role: "CEO & Managing Director",
    linkedinUrl: "[PASTE_LINKEDIN_PROFILE_URL]"
  },
  {
    name: "Raj Sekhar Aluri",
    role: "Chief Operating Officer (COO)",
    linkedinUrl: "[PASTE_LINKEDIN_PROFILE_URL]"
  },
  {
    name: "Srinivasa Rao Palla",
    role: "Head of Credit & Compliance Officer",
    linkedinUrl: "[PASTE_LINKEDIN_PROFILE_URL]"
  }
];

function initGovernanceLinkedIn() {
  const mapping = [
    { key: 'sivaKrishnaKolli', index: 0 },
    { key: 'rajSekharAluri', index: 1 },
    { key: 'srinivasaRaoPalla', index: 2 }
  ];

  mapping.forEach(m => {
    const btn = document.querySelector(`.gov-linkedin-btn[data-member="${m.key}"]`);
    if (!btn) return;

    // Check JS configuration first, fallback to button's href attribute
    const dataUrl = GOVERNANCE_MEMBERS_DATA[m.index] ? GOVERNANCE_MEMBERS_DATA[m.index].linkedinUrl : '';
    const hrefUrl = btn.getAttribute('href') || '';
    const activeUrl = (dataUrl && !dataUrl.includes('PASTE_LINKEDIN')) ? dataUrl : hrefUrl;

    const isValid = activeUrl &&
      !activeUrl.includes('PASTE_LINKEDIN') &&
      activeUrl !== '#' &&
      (activeUrl.startsWith('http://') || activeUrl.startsWith('https://'));

    if (isValid) {
      btn.setAttribute('href', activeUrl);
    } else {
      btn.setAttribute('href', '#');
    }
    btn.style.display = 'inline-flex';
  });
}

// Master Initialization on DOM Ready

/* ------------------------------------------------------------
   CardSwap Component Initialization
   ------------------------------------------------------------ */
/**
 * CardSwap Engine - Vanilla JS implementation of React Bits <CardSwap />
 */
class CardSwap {
  constructor(root, options = {}) {
    if (!root) return;
    this.root = root;
    this.stage = root.querySelector('.card-swap-stage');
    if (!this.stage) return;

    this.slots = Array.from(root.querySelectorAll('.card-swap-slot'));
    this.shades = Array.from(root.querySelectorAll('.card-swap-shade'));
    this.count = this.slots.length;
    if (this.count === 0) return;

    // Configuration
    this.width = Number(options.width || root.dataset.width || 400);
    this.height = Number(options.height || root.dataset.height || 270);
    this.dx = Number(options.cardDistance || root.dataset.cardDistance || 46);
    this.dy = Number(options.verticalDistance || root.dataset.verticalDistance || 54);
    this.dz = Math.max(0, Number(options.depth || root.dataset.depth || 75));
    this.skew = Number(options.skewAmount || root.dataset.skew || 5);
    this.visible = Math.min(Math.max(1, Number(options.visibleCards || root.dataset.visibleCards || 4)), this.count);
    this.delay = Number(options.delay || root.dataset.delay || 4000);
    this.autoplay = (options.autoplay !== undefined ? options.autoplay : root.dataset.autoplay !== 'false');
    this.pauseOnHover = (options.pauseOnHover !== undefined ? options.pauseOnHover : true);
    this.draggable = (options.draggable !== undefined ? options.draggable : root.dataset.draggable !== 'false');
    this.speed = Math.min(4, Math.max(0.1, Number(options.speed || 1)));
    this.bounce = Math.min(1, Math.max(0, Number(options.bounce || 0.35)));
    this.parallax = Math.min(1, Math.max(0, Number(options.parallax || 0.45)));
    this.hoverSpread = Math.max(0, Number(options.hoverSpread || 0.12));
    this.dim = Math.min(1, Math.max(0, Number(options.dim || 0.45)));
    this.cardRadius = Number(options.cardRadius || 18);
    this.intro = options.intro !== false;

    this.PERSPECTIVE = 900;
    this.TAU = Math.PI * 2;
    this.STEP = 1 / 240;
    this.PAD = 14;
    this.AXES = ['x', 'y', 'z', 'r', 'p'];
    this.DOWN = { x: 0, y: 1 };

    this.calcBounds();
    this.applyRootStyles();
    this.initDeck();
    this.initState();
    this.attachEvents();
    this.fit();
    this.wake();
    this.schedule();
  }

  calcBounds() {
    const slope = Math.tan((this.skew * Math.PI) / 180);
    const spread = 1 + Math.max(0, this.hoverSpread);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < this.visible; i++) {
      const scale = this.PERSPECTIVE / (this.PERSPECTIVE + i * this.dz);
      for (const u of [-this.width / 2, this.width / 2]) {
        for (const v of [-this.height / 2, this.height / 2]) {
          const x = (i * this.dx * spread + u) * scale;
          const y = (-i * this.dy * spread + v + u * slope) * scale;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    this.bounds = {
      width: Math.ceil(maxX - minX + this.PAD * 2),
      height: Math.ceil(maxY - minY + this.PAD * 2),
      originX: this.PAD - minX,
      originY: this.PAD - minY
    };
  }

  applyRootStyles() {
    this.root.style.setProperty('--swap-w', `${this.width}px`);
    this.root.style.setProperty('--swap-h', `${this.height}px`);
    this.root.style.setProperty('--swap-ox', `${this.bounds.originX}px`);
    this.root.style.setProperty('--swap-oy', `${this.bounds.originY}px`);
    this.root.style.setProperty('--swap-stage-w', `${this.bounds.width}px`);
    this.root.style.setProperty('--swap-stage-h', `${this.bounds.height}px`);
    this.root.style.setProperty('--swap-ratio', `${this.bounds.width} / ${this.bounds.height}`);
    this.root.style.setProperty('--swap-radius', `${this.cardRadius}px`);
  }

  initDeck() {
    this.deck = Array.from({ length: this.count }, (_, index) => ({
      el: this.slots[index],
      shade: this.shades[index] || this.slots[index].querySelector('.card-swap-shade'),
      index,
      pos: index,
      from: index,
      hold: 0,
      nudge: 0,
      phase: 'rest',
      dir: { x: 0, y: 1 },
      tilt: 0,
      top: 0,
      under: false,
      x: 0,
      y: 0,
      z: 0,
      r: 0,
      p: 0,
      v: { x: 0, y: 0, z: 0, r: 0, p: 0 }
    }));
  }

  initState() {
    this.state = {
      order: this.deck.map(card => card.index),
      raf: 0,
      last: 0,
      timer: 0,
      queue: [],
      layers: 0,
      scale: 1,
      hovered: false,
      overCard: false,
      inView: true,
      drag: null,
      spread: 0,
      spreadV: 0,
      px: 0,
      py: 0,
      pvx: 0,
      pvy: 0,
      tx: 0,
      ty: 0,
      dragged: false,
      autoplay: this.autoplay,
      delay: this.delay
    };

    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (this.intro && !reduce) {
      this.deck.forEach(card => {
        card.from = 0;
        card.hold = now + (card.pos * 70) / this.speed;
      });
      if (this.stage.animate) {
        this.stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' });
      }
    } else {
      this.deck.forEach(card => {
        Object.assign(card, this.slot(card.pos));
      });
    }

    this.writeStage();
    this.deck.forEach(card => this.write(card));
  }

  slot(position) {
    const q = Math.min(position, this.visible);
    const spread = 1 + this.state.spread;
    return { x: q * this.dx * spread, y: -q * this.dy * spread, z: -q * this.dz, r: 0, p: q };
  }

  clearance(dir) {
    return Math.abs(dir.x) * this.width + Math.abs(dir.y) * this.height + 12;
  }

  targetOf(card, time) {
    if (card.phase === 'exit') {
      const base = this.slot(0);
      const reach = this.clearance(card.dir) * 1.3;
      return { x: base.x + card.dir.x * reach, y: base.y + card.dir.y * reach, z: base.z, r: card.tilt, p: 0 };
    }
    if (card.phase === 'enter') {
      const base = this.slot(0);
      return { x: base.x, y: base.y + this.clearance(this.DOWN) * 1.3, z: base.z, r: 0, p: card.p };
    }
    const position = (time < card.hold ? card.from : card.pos) + card.nudge;
    return this.slot(Math.max(0, position));
  }

  layerOf(card) {
    if (card.top) return 1000 + card.top;
    if (card.under) return 1;
    return 10 + (this.count - card.pos) * 2;
  }

  write(card) {
    const { el, shade } = card;
    if (!el) return;
    el.style.transform = `translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, ${card.z.toFixed(2)}px) rotate(${card.r.toFixed(3)}deg) skewY(${this.skew}deg)`;
    el.style.zIndex = String(this.layerOf(card));
    const fade = Math.min(1, Math.max(0, this.visible - card.p));
    el.style.opacity = fade < 1 ? fade.toFixed(3) : '';
    el.style.visibility = fade <= 0.001 ? 'hidden' : '';
    if (shade) {
      const depthT = Math.min(1, Math.max(0, card.p / Math.max(1, this.visible - 1)));
      shade.style.opacity = (this.dim * 0.62 * depthT).toFixed(3);
    }
    el.style.cursor = card.phase === 'drag' ? 'grabbing' : card.pos > 0 ? 'pointer' : this.draggable ? 'grab' : '';
    if (card.pos === 0) el.setAttribute('data-front', '');
    else el.removeAttribute('data-front');
  }

  writeStage() {
    const ox = this.bounds.originX + this.state.px;
    const oy = this.bounds.originY + this.state.py;
    this.stage.style.perspectiveOrigin = `${ox.toFixed(2)}px ${oy.toFixed(2)}px`;
  }

  integrate(card, target, omega, zeta, dt) {
    const k = omega * omega;
    const d = 2 * zeta * omega;
    const steps = Math.max(1, Math.ceil(dt / this.STEP));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      for (const axis of this.AXES) {
        const velocity = card.v[axis] + (k * (target[axis] - card[axis]) - d * card.v[axis]) * h;
        card.v[axis] = velocity;
        card[axis] += velocity * h;
      }
    }
  }

  scalar(value, velocity, target, omega, zeta, dt) {
    const k = omega * omega;
    const d = 2 * zeta * omega;
    const steps = Math.max(1, Math.ceil(dt / this.STEP));
    const h = dt / steps;
    let x = value;
    let v = velocity;
    for (let i = 0; i < steps; i++) {
      v += (k * (target - x) - d * v) * h;
      x += v * h;
    }
    return [x, v];
  }

  frame = (time) => {
    this.state.raf = 0;
    const dt = this.state.last ? Math.min(0.05, (time - this.state.last) / 1000) : 1 / 60;
    this.state.last = time;
    const speed = this.speed;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const restOmega = this.TAU * 1.7 * speed;
    const restZeta = reduce ? 1 : 1 - 0.72 * this.bounce;
    const exitOmega = this.TAU * 1.9 * speed;
    let busy = false;

    const spreadTarget = this.state.hovered && !reduce ? this.hoverSpread : 0;
    [this.state.spread, this.state.spreadV] = this.scalar(this.state.spread, this.state.spreadV, spreadTarget, this.TAU * 1.4, 0.9, dt);
    [this.state.px, this.state.pvx] = this.scalar(this.state.px, this.state.pvx, reduce ? 0 : this.state.tx, this.TAU * 1.1, 1, dt);
    [this.state.py, this.state.pvy] = this.scalar(this.state.py, this.state.pvy, reduce ? 0 : this.state.ty, this.TAU * 1.1, 1, dt);

    if (
      Math.abs(this.state.spread - spreadTarget) > 0.0005 ||
      Math.abs(this.state.spreadV) > 0.0005 ||
      Math.abs(this.state.px - this.state.tx) > 0.05 ||
      Math.abs(this.state.py - this.state.ty) > 0.05 ||
      Math.abs(this.state.pvx) + Math.abs(this.state.pvy) > 0.05
    ) {
      busy = true;
    }
    this.writeStage();

    for (const card of this.deck) {
      if (card.phase === 'drag') {
        busy = true;
        this.write(card);
        continue;
      }
      const target = this.targetOf(card, time);
      const moving = card.phase === 'exit' || card.phase === 'enter';
      this.integrate(card, target, moving ? exitOmega : restOmega, moving ? 1 : restZeta, dt);

      if (card.phase === 'exit') {
        const base = this.slot(0);
        const travelled = (card.x - base.x) * card.dir.x + (card.y - base.y) * card.dir.y;
        if (travelled >= this.clearance(card.dir)) {
          card.phase = 'rest';
          card.top = 0;
          card.hold = 0;
        }
      } else if (card.phase === 'enter') {
        const base = this.slot(0);
        if (card.y - base.y >= this.clearance(this.DOWN)) {
          card.phase = 'rest';
          card.under = false;
          card.hold = 0;
        }
      }
      if (card.hold > time || card.phase !== 'rest') busy = true;
      for (const axis of this.AXES) {
        const limit = axis === 'p' ? 0.001 : 0.02;
        if (Math.abs(target[axis] - card[axis]) > limit || Math.abs(card.v[axis]) > limit) busy = true;
      }
      this.write(card);
    }

    if (busy) {
      this.state.raf = requestAnimationFrame(this.frame);
    } else {
      this.state.last = 0;
      for (const card of this.deck) {
        if (card.top && card.phase === 'rest') card.top = 0;
      }
    }
  };

  wake() {
    if (!this.state.raf) this.state.raf = requestAnimationFrame(this.frame);
  }

  paused() {
    return (
      !this.autoplay ||
      this.count < 2 ||
      (this.pauseOnHover && this.state.overCard) ||
      this.state.drag ||
      !this.state.inView ||
      (typeof document !== 'undefined' && document.visibilityState === 'hidden')
    );
  }

  schedule() {
    clearTimeout(this.state.timer);
    this.state.timer = 0;
    if (this.paused()) return;
    this.state.timer = window.setTimeout(() => {
      this.state.timer = 0;
      this.shift(1);
    }, Math.max(400, this.delay));
  }

  settleOrder(time, stagger) {
    this.state.order.forEach((index, position) => {
      const card = this.deck[index];
      if (card.pos === position) return;
      card.from = card.pos;
      card.pos = position;
      card.hold = time + Math.max(0, position) * stagger;
    });
  }

  shift(direction, options = {}) {
    if (this.count < 2) return;
    const time = performance.now();
    const stagger = 0.05 / this.speed;

    if (direction > 0) {
      const front = this.deck[this.state.order[0]];
      this.state.order = [...this.state.order.slice(1), front.index];
      this.settleOrder(time, stagger * 1000);
      front.phase = 'exit';
      front.dir = options.dir ?? this.DOWN;
      front.tilt = options.tilt ?? 0;
      front.top = ++this.state.layers;
      front.under = false;
      front.nudge = 0;
      front.hold = 0;
      if (options.velocity) {
        front.v.x = options.velocity.x;
        front.v.y = options.velocity.y;
      }
    } else {
      const back = this.deck[this.state.order[this.count - 1]];
      this.state.order = [back.index, ...this.state.order.slice(0, this.count - 1)];
      this.settleOrder(time, stagger * 1000);
      back.phase = 'enter';
      back.top = 0;
      back.under = true;
      back.nudge = 0;
      back.hold = 0;
    }
    this.deck.forEach(card => {
      if (card.phase === 'rest') card.nudge = 0;
    });

    this.wake();
    this.schedule();
  }

  goTo(position) {
    this.state.queue.forEach(clearTimeout);
    this.state.queue = [];
    const gap = 110 / this.speed;
    for (let i = 0; i < position; i++) {
      this.state.queue.push(window.setTimeout(() => this.shift(1), i * gap));
    }
  }

  fit = () => {
    const w = this.root.clientWidth;
    const h = this.root.clientHeight;
    let scale;
    if (window.innerWidth >= 992) {
      const availW = Math.max(w, 720);
      scale = Math.min(1.0, availW / this.bounds.width, h > 0 ? h / this.bounds.height : 1);
    } else {
      const availW = Math.max(260, w - 8);
      scale = Math.min(1.0, availW / this.bounds.width);
    }
    this.state.scale = scale > 0 ? scale : 1;
    this.stage.style.transform = `translate(-50%, -50%) scale(${this.state.scale.toFixed(4)})`;
  };

  local(event) {
    const box = this.root.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top, w: box.width, h: box.height };
  }

  onMove = (event) => {
    if (event.pointerType !== 'touch') {
      const point = this.local(event);
      const nx = Math.min(1, Math.max(-1, (point.x / Math.max(1, point.w)) * 2 - 1));
      const ny = Math.min(1, Math.max(-1, (point.y / Math.max(1, point.h)) * 2 - 1));
      this.state.tx = nx * this.parallax * 0.35 * this.bounds.width;
      this.state.ty = ny * this.parallax * 0.35 * this.bounds.height;
      this.state.hovered = true;
      const overCard = Boolean(event.target.closest?.('[data-swap-index]'));
      if (overCard !== this.state.overCard) {
        this.state.overCard = overCard;
        this.schedule();
      }
      this.wake();
    }
    const drag = this.state.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = (event.clientX - drag.startX) / this.state.scale;
    const dy = (event.clientY - drag.startY) / this.state.scale;
    if (!drag.active) {
      if (Math.hypot(dx, dy) < 5) return;
      drag.active = true;
      this.state.dragged = true;
      const card = this.deck[drag.index];
      card.phase = 'drag';
      card.v = { x: 0, y: 0, z: 0, r: 0, p: 0 };
      this.root.setPointerCapture?.(event.pointerId);
      this.root.style.cursor = 'grabbing';
    }
    const card = this.deck[drag.index];
    const base = this.slot(0);
    card.x = base.x + dx;
    card.y = base.y + dy;
    card.z = base.z;
    card.r = Math.min(9, Math.max(-9, dx * 0.035));
    card.p = 0;
    const time = performance.now();
    drag.samples.push({ x: card.x, y: card.y, t: time });
    while (drag.samples.length > 2 && time - drag.samples[0].t > 90) drag.samples.shift();
    const progress = Math.min(1, Math.max(0, Math.hypot(dx, dy) / (Math.min(this.width, this.height) * 0.3)));
    const next = this.deck[this.state.order[1]];
    if (next && next.phase === 'rest') next.nudge = -0.22 * progress;
    this.wake();
  };

  onLeave = (event) => {
    if (event.pointerType === 'touch') return;
    if (this.state.drag?.active) return;
    this.state.hovered = false;
    this.state.overCard = false;
    this.state.tx = 0;
    this.state.ty = 0;
    this.schedule();
    this.wake();
  };

  onDown = (event) => {
    this.state.dragged = false;
    if (!this.draggable || event.button > 0 || this.count < 2) return;
    const target = event.target.closest?.('[data-swap-index]');
    if (!target || !this.root.contains(target)) return;
    const index = Number(target.getAttribute('data-swap-index'));
    if (index !== this.state.order[0] || this.deck[index].phase !== 'rest') return;
    this.state.drag = {
      id: event.pointerId,
      index,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      samples: []
    };
    this.schedule();
  };

  onUp = (event) => {
    const drag = this.state.drag;
    if (!drag || drag.id !== event.pointerId) return;
    this.state.drag = null;
    this.root.style.cursor = '';
    if (!drag.active) {
      this.schedule();
      return;
    }
    this.root.releasePointerCapture?.(event.pointerId);
    const card = this.deck[drag.index];
    const base = this.slot(0);
    const first = drag.samples[0];
    const lastSample = drag.samples[drag.samples.length - 1];
    const span = first && lastSample ? Math.max(0.016, (lastSample.t - first.t) / 1000) : 1;
    const velocity =
      first && lastSample && lastSample !== first
        ? { x: (lastSample.x - first.x) / span, y: (lastSample.y - first.y) / span }
        : { x: 0, y: 0 };
    const offset = { x: card.x - base.x, y: card.y - base.y };
    const distance = Math.hypot(offset.x, offset.y);
    const fling = Math.hypot(velocity.x, velocity.y);
    const next = this.deck[this.state.order[1]];
    if (next) next.nudge = 0;

    if (event.type !== 'pointercancel' && (distance > Math.min(this.width, this.height) * 0.3 || fling > 700)) {
      const aim = { x: offset.x + velocity.x * 0.12, y: offset.y + velocity.y * 0.12 };
      const length = Math.hypot(aim.x, aim.y) || 1;
      card.phase = 'rest';
      this.shift(1, {
        dir: { x: aim.x / length, y: aim.y / length },
        tilt: card.r,
        velocity
      });
    } else {
      card.phase = 'rest';
      card.v.x = velocity.x;
      card.v.y = velocity.y;
      this.wake();
      this.schedule();
    }
  };

  onClick = (event) => {
    if (this.state.dragged) {
      this.state.dragged = false;
      return;
    }
    const target = event.target.closest?.('[data-swap-index]');
    if (!target || !this.root.contains(target)) return;
    const index = Number(target.getAttribute('data-swap-index'));
    const position = this.state.order.indexOf(index);
    if (position > 0) this.goTo(position);
  };

  onKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.shift(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.shift(-1);
    }
  };

  attachEvents() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.fit);
      this.resizeObserver.observe(this.root);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(entries => {
        this.state.inView = entries[entries.length - 1]?.isIntersecting ?? true;
        this.schedule();
      });
      this.intersectionObserver.observe(this.root);
    }

    this.root.addEventListener('pointermove', this.onMove);
    this.root.addEventListener('pointerleave', this.onLeave);
    this.root.addEventListener('pointerdown', this.onDown);
    this.root.addEventListener('pointerup', this.onUp);
    this.root.addEventListener('pointercancel', this.onUp);
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('keydown', this.onKeyDown);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => this.schedule());
    }
  }

  next() {
    this.shift(1);
  }

  prev() {
    this.shift(-1);
  }
}




let heroCardSwapInstance = null;

function initHeroCardSwap() {
  const el = document.getElementById('heroCardSwap');
  if (el && !heroCardSwapInstance) {
    heroCardSwapInstance = new CardSwap(el, {
      width: 680,
      height: 470,
      cardDistance: 28,
      verticalDistance: 34,
      depth: 55,
      skewAmount: 3,
      delay: 4000,
      autoplay: true,
      pauseOnHover: true,
      draggable: true
    });
    window.heroCardSwapInstance = heroCardSwapInstance;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initHeroCardSwap();
  updateVelocity();
  initLenis();

  const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const isReload = (navEntry && navEntry.type === 'reload') || (window.performance && window.performance.navigation && window.performance.navigation.type === 1);
  const currentHash = window.location.hash;

  if (isReload) {
    if (window.location.hash && history.replaceState) {
      history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  } else if (currentHash && currentHash.length > 1) {
    setTimeout(() => handleInitialHashScroll(false), 60);
  } else {
    window.scrollTo(0, 0);
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }

  initGSAPPlugins();
  initHeroEntrance();
  Reveal.autoInit();
  initStickyTitleAndFocus();
  initStaggeredCards();
  initNavScrollSpy();
  initGovernanceLinkedIn();
  initAccordionHover();
  initFaqHover();
  initTestimonialsAutoScroll();
});

// Refresh on full load (images & fonts ready)
window.addEventListener('load', () => {
  const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const isReload = (navEntry && navEntry.type === 'reload') || (window.performance && window.performance.navigation && window.performance.navigation.type === 1);
  const currentHash = window.location.hash;

  if (isReload) {
    window.scrollTo(0, 0);
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  } else if (currentHash && currentHash.length > 1) {
    handleInitialHashScroll(false);
  } else {
    window.scrollTo(0, 0);
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
});

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 150);
});

/* ------------------------------------------------------------
   5. Policy Page Multi-Style Switcher & Interactive Engines
   ------------------------------------------------------------ */
function switchPolicyStyle(styleId) {
  // Update Buttons
  document.querySelectorAll('.style-switch-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('btnStyle-' + styleId);
  if (activeBtn) activeBtn.classList.add('active');

  // Update Sections
  document.querySelectorAll('.policy-view-section').forEach(sec => sec.classList.remove('active-view'));
  const targetSec = document.getElementById('view-' + styleId);
  if (targetSec) targetSec.classList.add('active-view');
}

function switchPolicyTab(tabId) {
  document.querySelectorAll('.policy-tab-card').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.getElementById('tabCard-' + tabId);
  if (activeTab) activeTab.classList.add('active');

  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  const targetPane = document.getElementById('pane-' + tabId);
  if (targetPane) targetPane.classList.add('active');
}

function togglePolicyAccordion(triggerEl) {
  const item = triggerEl.closest('.accordion-item');
  if (item) {
    item.classList.toggle('open');
  }
}

function filterPolicyAccordion() {
  const input = document.getElementById('policySearchInput');
  if (!input) return;
  const query = input.value.toLowerCase().trim();
  const items = document.querySelectorAll('.accordion-item');
  
  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    if (!query || text.includes(query)) {
      item.style.display = 'block';
      if (query) item.classList.add('open');
    } else {
      item.style.display = 'none';
      item.classList.remove('open');
    }
  });
}

/* ------------------------------------------------------------
   8. Institutional Policies Accordion (Click-Only Toggle, No Hover)
   ------------------------------------------------------------ */
function initAccordionHover() {
  // Auto-hover removed per user request: accordions only open/close on click
}

function toggleArcItem(triggerEl) {
  const item = triggerEl.closest('.arc-accordion-item');
  if (!item) return;

  const isOpen = item.classList.contains('open');

  // Close all other items so only one expands at a time
  const allArc = document.querySelectorAll('.arc-accordion-item');
  allArc.forEach(a => a.classList.remove('open'));

  if (!isOpen) {
    item.classList.add('open');
  }
}

/* ------------------------------------------------------------
   FAQ Accordion Controller (Click-Only Toggle, No Hover)
   ------------------------------------------------------------ */
function initFaqHover() {
  // Auto-hover removed per user request: FAQs only open/close on click
}

function toggleFaqItem(triggerEl) {
  const item = triggerEl.closest('.faq-item');
  if (!item) return;

  const isOpen = item.classList.contains('open');

  // Smooth accordion toggle: close other items so only one expands at a time
  const allFaq = document.querySelectorAll('.faq-item');
  allFaq.forEach(f => {
    f.classList.remove('open');
    const btn = f.querySelector('.faq-header');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });

  if (!isOpen) {
    item.classList.add('open');
    triggerEl.setAttribute('aria-expanded', 'true');
  }
}

/* ------------------------------------------------------------
   Mobile Navigation Toggle
   ------------------------------------------------------------ */
function toggleMobileNav() {
  const nav = document.getElementById('mainNavLinks');
  const btn = document.getElementById('mobileToggleBtn');
  if (!nav) return;
  const isOpen = nav.classList.toggle('mobile-open');
  if (btn) {
    const iconBurger = btn.querySelector('.icon-hamburger');
    const iconClose = btn.querySelector('.icon-close');
    if (iconBurger) iconBurger.style.display = isOpen ? 'none' : 'block';
    if (iconClose) iconClose.style.display = isOpen ? 'block' : 'none';
  }
}

function closeMobileNav() {
  const nav = document.getElementById('mainNavLinks');
  const btn = document.getElementById('mobileToggleBtn');
  if (nav && nav.classList.contains('mobile-open')) {
    nav.classList.remove('mobile-open');
    if (btn) {
      const iconBurger = btn.querySelector('.icon-hamburger');
      const iconClose = btn.querySelector('.icon-close');
      if (iconBurger) iconBurger.style.display = 'block';
      if (iconClose) iconClose.style.display = 'none';
    }
  }
}

/* ------------------------------------------------------------
   9. VMF Financial Assistant Chatbot Controller
   ------------------------------------------------------------ */
let isChatOpen = false;

function toggleChatbot() {
  const win = document.getElementById('vmfChatWindow');
  const triggerIcon = document.getElementById('chatTriggerIcon');
  if (!win) return;
  isChatOpen = !isChatOpen;
  
  if (isChatOpen) {
    win.style.display = 'flex';
    if (triggerIcon) {
      triggerIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    }
    const input = document.getElementById('chatUserInput');
    if (input) setTimeout(() => input.focus(), 150);
  } else {
    win.style.display = 'none';
    if (triggerIcon) {
      triggerIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    }
  }
}

function appendChatMsg(sender, htmlContent) {
  const msgContainer = document.getElementById('chatMessages');
  if (!msgContainer) return;
  
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
  msgDiv.innerHTML = `<div class="chat-bubble">${htmlContent}</div>`;
  
  msgContainer.appendChild(msgDiv);
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

function handleQuickChip(topic) {
  let userText = "";
  let botReply = "";

  if (topic === 'products') {
    userText = "Tell me about your 3 financing products";
    botReply = `<strong>We provide 3 specialized financing solutions:</strong><br><br>
    <strong>1. Invoice Financing:</strong> Advance up to 85% against unpaid invoices from approved buyers to bridge payment terms (30-90 days).<br><br>
    <strong>2. Purchase Order Financing:</strong> Fund material & production costs for confirmed client orders without locking up daily cash.<br><br>
    <strong>3. Working Capital Loans:</strong> Short-term credit tailored to inventory, payroll, and seasonal business needs.<br>
    <button class="chat-action-btn" onclick="openApplyModal('General Working Capital')">Apply for Financing</button>`;
  } else if (topic === 'invoice') {
    userText = "How does Invoice Financing work?";
    botReply = `<strong>Invoice Financing (Receivables Discounting):</strong><br>
    &bull; <strong>Advance:</strong> Up to 80%–85% of verified invoice value.<br>
    &bull; <strong>Turnaround:</strong> Swift disbursement in 48–72 hours.<br>
    &bull; <strong>Collateral:</strong> Secured against verified receivables & buyer creditworthiness.<br>
    &bull; <strong>Repayment:</strong> Cleared directly upon buyer settlement.<br>
    <button class="chat-action-btn" onclick="openApplyModal('Invoice Financing')">Explore Invoice Financing</button>`;
  } else if (topic === 'po') {
    userText = "How does Purchase Order (PO) Financing work?";
    botReply = `<strong>Purchase Order Financing:</strong><br>
    &bull; <strong>Purpose:</strong> Procure raw materials, cover production, and fulfill confirmed corporate/institutional orders.<br>
    &bull; <strong>Advantage:</strong> Execute large high-value orders without straining daily working capital.<br>
    &bull; <strong>Eligible Borrowers:</strong> Manufacturers, traders, and contractors with confirmed POs.<br>
    <button class="chat-action-btn" onclick="openApplyModal('Purchase Order Financing')">Explore PO Financing</button>`;
  } else if (topic === 'wc') {
    userText = "What are your Working Capital Loans?";
    botReply = `<strong>Working Capital Loans:</strong><br>
    &bull; Flexible short-term credit structured around your operational cash-flow cycle.<br>
    &bull; Use for supplier advances, bulk inventory discounts, or temporary cash gaps.<br>
    &bull; Structured repayment schedules with zero hidden charges.<br>
    <button class="chat-action-btn" onclick="openApplyModal('Working Capital Loans')">Explore Working Capital Loans</button>`;
  } else if (topic === 'docs') {
    userText = "What documents are required?";
    botReply = `<strong>Standard Documentation Checklist:</strong><br>
    &bull; <strong>Business KYC:</strong> PAN, Certificate of Incorporation / Udyam, Promoters KYC.<br>
    &bull; <strong>Financial Records:</strong> 12 months GST returns, 6–12 months bank statements.<br>
    &bull; <strong>Financial Statements:</strong> Audited balance sheets & P&L (last 2 years).<br>
    &bull; <strong>Transaction Proof:</strong> Confirmed Purchase Orders, buyer invoices, delivery challans.`;
  } else if (topic === 'eligibility') {
    userText = "What are the eligibility criteria?";
    botReply = `<strong>Eligibility Criteria:</strong><br>
    &bull; Registered entity in India (MSME, Pvt Ltd, Partnership, LLP).<br>
    &bull; Minimum 1–2 years of active commercial operations.<br>
    &bull; Verified business transactions with established corporate or institutional buyers.<br>
    &bull; Satisfactory banking conduct and sound repayment history.`;
  } else if (topic === 'rates') {
    userText = "What are the interest rates and charges?";
    botReply = `<strong>Pricing & Terms Transparency:</strong><br>
    &bull; Pricing is risk-based, calculated on transaction quality, buyer credit strength, and facility tenure.<br>
    &bull; All rates, APR, processing fees, and repayment terms are fully documented in your sanction letter before acceptance.<br>
    &bull; Zero hidden fees, zero surprise deductions.`;
  } else if (topic === 'apply') {
    userText = "How do I apply for funding?";
    botReply = `<strong>Applying is simple and 100% digital:</strong><br>
    1. Click the button below to submit your business requirement.<br>
    2. Our underwriting desk will review your details within 24–48 hours.<br>
    3. Review sanction terms and receive funds directly to your account.<br>
    <button class="chat-action-btn" onclick="openApplyModal('Application via Chat')">Open Application Form</button>`;
  }

  appendChatMsg('user', userText);

  // Bot response with subtle delay
  setTimeout(() => {
    appendChatMsg('bot', botReply);
  }, 300);
}

function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chatUserInput');
  if (!input) return;
  const q = input.value.trim();
  if (!q) return;

  appendChatMsg('user', q);
  input.value = '';

  const lower = q.toLowerCase();
  let botReply = '';

  if (lower.includes('invoice') || lower.includes('bill') || lower.includes('receivable')) {
    botReply = `<strong>Invoice Financing:</strong> We advance up to 85% of eligible invoices from approved buyers, bridging 30–90 day payment cycles.<br><button class="chat-action-btn" onclick="openApplyModal('Invoice Financing')">Apply for Invoice Financing</button>`;
  } else if (lower.includes('order') || lower.includes('purchase order') || lower.includes('po')) {
    botReply = `<strong>Purchase Order Financing:</strong> Covers upfront material and production costs for confirmed client orders so you can fulfill contracts on time.<br><button class="chat-action-btn" onclick="openApplyModal('Purchase Order Financing')">Apply for PO Financing</button>`;
  } else if (lower.includes('working capital') || lower.includes('loan') || lower.includes('daily')) {
    botReply = `<strong>Working Capital Loans:</strong> Short-term financing for cash gaps, bulk stock purchases, vendor payments, and operational expenses.<br><button class="chat-action-btn" onclick="openApplyModal('Working Capital Loans')">Apply for Working Capital</button>`;
  } else if (lower.includes('document') || lower.includes('kyc') || lower.includes('paper') || lower.includes('gst')) {
    botReply = `<strong>Required Documents:</strong><br>&bull; Business KYC (PAN, GSTIN, Udyam)<br>&bull; 6–12 months bank statements<br>&bull; GST returns (last 12 months)<br>&bull; Invoices or Confirmed Purchase Orders.`;
  } else if (lower.includes('eligib') || lower.includes('qualif') || lower.includes('criteria') || lower.includes('who can')) {
    botReply = `<strong>Eligibility:</strong> Registered Indian MSMEs, LLPs, or Pvt Ltd companies with at least 1–2 years operational vintage and active commercial orders from reputable buyers.`;
  } else if (lower.includes('rate') || lower.includes('interest') || lower.includes('charge') || lower.includes('fee') || lower.includes('cost')) {
    botReply = `<strong>Interest Rates & Charges:</strong> We offer competitive, risk-based pricing tailored to your buyer credit and transaction tenure. Transparent sanction terms with zero hidden fees.`;
  } else if (lower.includes('apply') || lower.includes('contact') || lower.includes('call') || lower.includes('phone') || lower.includes('office') || lower.includes('hyderabad')) {
    botReply = `<strong>Reach Out or Apply:</strong><br>Our corporate desk is at Gachibowli, Hyderabad.<br>&bull; Email: <a href="mailto:compliance@vmffinance.com" style="color:var(--green); font-weight:700;">compliance@vmffinance.com</a><br>&bull; Working Hours: Mon–Fri: 9:30 AM – 6:30 PM.<br><button class="chat-action-btn" onclick="openApplyModal('Support Inquiry')">Start Application</button>`;
  } else if (lower.includes('fast') || lower.includes('time') || lower.includes('turnaround') || lower.includes('disburs')) {
    botReply = `<strong>Fast Turnaround:</strong> Our credit appraisal takes 24–48 business hours upon document submission. Approved funds are disbursed promptly upon document execution.`;
  } else {
    botReply = `Thank you for asking! VMF Finance provides <strong>Invoice Financing</strong>, <strong>PO Financing</strong>, and <strong>Working Capital Loans</strong> for MSMEs.<br><br>Would you like to explore products, check documents, or apply now?<br><button class="chat-action-btn" onclick="openApplyModal('General Inquiry')">Submit Application</button>`;
  }

  setTimeout(() => {
    appendChatMsg('bot', botReply);
  }, 350);
}

/* ============================================================
   TESTIMONIALS & SOCIAL PROOF CAROUSEL (Ref: karncy.com/live)
   ============================================================ */
const testimonialsData = [
  {
    logo: `<div class="testi-logo-badge" style="background: rgba(45, 123, 57, 0.1); color: var(--green);">QB</div>`,
    quote: `"VMF Finance played a key role in establishing our precision manufacturing facility in India. From regulatory compliance, government liaisoning, cross-border transaction advisory and end-to-end facility setup, VMF's support helped us navigate the complexities of establishing and running manufacturing operations in India. I appreciate their practical advice, professionalism and commitment to executing within time/budget."`,
    author: "Krishna Nadella, Ph.D.",
    role: "Co-founder & CEO • Qbic Materials, Inc. | United States"
  },
  {
    logo: `<div class="testi-logo-badge" style="background: rgba(2, 132, 199, 0.1); color: #0284C7;">AX</div>`,
    quote: `"Securing timely working capital was our single biggest friction in scaling our engineering supply contracts. VMF's invoice financing provided predictable liquidity against corporate receivables without rigid collateral requirements, enabling us to fulfill 3x larger supply cycles with complete peace of mind."`,
    author: "Vikramaditya Singhania",
    role: "Managing Director • Apex Precision Engineering | Pune"
  },
  {
    logo: `<div class="testi-logo-badge" style="background: rgba(249, 115, 22, 0.1); color: #EA580C;">NX</div>`,
    quote: `"When we won a major supply contract for renewable energy infrastructure, traditional loan avenues took weeks of tedious paperwork. VMF Finance evaluated our buyer profile, sanctioned our purchase order financing facility swiftly, and disbursed funds directly to our raw material vendors."`,
    author: "Rameshwar Kulkarni",
    role: "Founder & COO • Nexus Green Infrastructure | Bengaluru"
  }
];

let currentTestimonialIdx = 0;
let testimonialAutoTimer = null;
const TESTIMONIAL_INTERVAL_MS = 4500;

function renderTestimonial(idx) {
  currentTestimonialIdx = (idx + testimonialsData.length) % testimonialsData.length;
  const item = testimonialsData[currentTestimonialIdx];
  const card = document.getElementById('testimonialCard');
  if (!card) return;

  card.style.opacity = '0';
  card.style.transform = 'translateY(8px)';

  setTimeout(() => {
    const logoBox = document.getElementById('testiLogoBox');
    const quoteEl = document.getElementById('testiQuote');
    const authorEl = document.getElementById('testiAuthor');
    const roleEl = document.getElementById('testiRole');

    if (logoBox) logoBox.innerHTML = item.logo;
    if (quoteEl) quoteEl.innerText = item.quote;
    if (authorEl) authorEl.innerText = item.author;
    if (roleEl) roleEl.innerText = item.role;

    const dots = document.querySelectorAll('.testi-dot');
    dots.forEach((dot, dIdx) => {
      dot.classList.toggle('active', dIdx === currentTestimonialIdx);
    });

    card.style.opacity = '1';
    card.style.transform = 'none';
  }, 200);
}

function prevTestimonial(isAuto = false) {
  renderTestimonial(currentTestimonialIdx - 1);
  if (!isAuto) resetTestimonialAutoScroll();
}

function nextTestimonial(isAuto = false) {
  renderTestimonial(currentTestimonialIdx + 1);
  if (!isAuto) resetTestimonialAutoScroll();
}

function goToTestimonial(idx) {
  renderTestimonial(idx);
  resetTestimonialAutoScroll();
}

function startTestimonialAutoScroll() {
  stopTestimonialAutoScroll();
  testimonialAutoTimer = setInterval(() => {
    nextTestimonial(true);
  }, TESTIMONIAL_INTERVAL_MS);
}

function stopTestimonialAutoScroll() {
  if (testimonialAutoTimer) {
    clearInterval(testimonialAutoTimer);
    testimonialAutoTimer = null;
  }
}

function resetTestimonialAutoScroll() {
  startTestimonialAutoScroll();
}

function initTestimonialsAutoScroll() {
  const card = document.getElementById('testimonialCard');
  const controls = document.querySelector('.testimonial-controls');

  if (card) {
    card.addEventListener('mouseenter', stopTestimonialAutoScroll);
    card.addEventListener('mouseleave', startTestimonialAutoScroll);
    card.addEventListener('touchstart', stopTestimonialAutoScroll, { passive: true });
    card.addEventListener('touchend', () => {
      setTimeout(startTestimonialAutoScroll, 2500);
    }, { passive: true });
  }

  if (controls) {
    controls.addEventListener('mouseenter', stopTestimonialAutoScroll);
    controls.addEventListener('mouseleave', startTestimonialAutoScroll);
  }

  startTestimonialAutoScroll();
}



/* ============================================================
   CONCAVE CAROUSEL COMPONENT (React Bits Pro Engine)
   A gallery wall that curves around the viewer (Curvature: 0.72)
   Features: Concave Curvature, Reflection, Edge Dimming, Inertia Drag
   ============================================================ */

const INDUSTRY_ITEMS = [
  {
    id: 'manufacturing',
    title: '<span class="title-line">Manufacturing &</span><span class="title-line">Engineering</span>',
    subtitle: 'Precision parts, heavy fabrication & industrial machinery',
    image: 'assets/industry-1.jpg',
    iconSvg: `<img src="assets/industry-icon-1.png" alt="Manufacturing &amp; Engineering Icon" width="58" height="58" />`
  },
  {
    id: 'automotive',
    title: '<span class="title-line">Auto Components &</span><span class="title-line">Industrial</span>',
    subtitle: 'Tier-1 & Tier-2 automotive ancillaries & precision assemblies',
    image: 'assets/industry-2.jpg',
    iconSvg: `<img src="assets/industry-icon-2.png" alt="Auto Components &amp; Industrial Icon" width="58" height="58" />`
  },
  {
    id: 'textiles',
    title: '<span class="title-line">Textiles & Consumer</span><span class="title-line">Products</span>',
    subtitle: 'Yarn spinning, weaving, finished apparel & fashion exports',
    image: 'assets/industry-3.jpg',
    iconSvg: `<img src="assets/industry-icon-3.png" alt="Textiles &amp; Consumer Products Icon" width="58" height="58" />`
  },
  {
    id: 'fmcg',
    title: '<span class="title-line">FMCG & Wholesale</span><span class="title-line">Distribution</span>',
    subtitle: 'High-frequency inventory financing & merchant supply chains',
    image: 'assets/industry-4.jpg',
    iconSvg: `<img src="assets/industry-icon-4.png" alt="FMCG &amp; Wholesale Distribution Icon" width="58" height="58" />`
  },
  {
    id: 'agriculture',
    title: '<span class="title-line">Agriculture & Food</span><span class="title-line">Processing</span>',
    subtitle: 'Cold chain storage, agro-commodities & packaged food products',
    image: 'assets/industry-5.jpg',
    iconSvg: `<img src="assets/industry-icon-5.png" alt="Agriculture &amp; Food Processing Icon" width="58" height="58" />`
  },
  {
    id: 'pharma',
    title: '<span class="title-line">Pharmaceuticals &</span><span class="title-line">Healthcare</span>',
    subtitle: 'Active ingredients, formulations, diagnostic tools & medical equipment',
    image: 'assets/industry-6.jpg',
    iconSvg: `<img src="assets/industry-icon-6.png" alt="Pharmaceuticals &amp; Healthcare Icon" width="58" height="58" />`
  },
  {
    id: 'infrastructure',
    title: '<span class="title-line">Infrastructure &</span><span class="title-line">Building Materials</span>',
    subtitle: 'Structural steel, precast concrete, cement & engineering contracting',
    image: 'assets/industry-7.jpg',
    iconSvg: `<img src="assets/industry-icon-7.png" alt="Infrastructure &amp; Building Materials Icon" width="58" height="58" />`
  },
  {
    id: 'chemicals',
    title: '<span class="title-line">Chemicals, Paper &</span><span class="title-line">Packaging</span>',
    subtitle: 'Specialty polymers, corrugated packaging & sustainable materials',
    image: 'assets/industry-8.jpg',
    iconSvg: `<img src="assets/industry-icon-8.png" alt="Chemicals, Paper &amp; Packaging Icon" width="58" height="58" />`
  },
  {
    id: 'logistics',
    title: '<span class="title-line">Logistics, Transport</span><span class="title-line">& Warehousing</span>',
    subtitle: 'Commercial freight fleets, multimodal hubs & fulfillment storage',
    image: 'assets/industry-9.jpg',
    iconSvg: `<img src="assets/industry-icon-9.png" alt="Logistics, Transport &amp; Warehousing Icon" width="58" height="58" />`
  },
  {
    id: 'techservices',
    title: '<span class="title-line">IT & Professional</span><span class="title-line">Services</span>',
    subtitle: 'Enterprise software exports, digital consulting & engineering R&D',
    image: 'assets/industry-10.jpg',
    iconSvg: `<img src="assets/industry-icon-10.png" alt="IT &amp; Professional Services Icon" width="58" height="58" />`
  }
];

function initConcaveCarousel() {
  const container = document.getElementById('concaveCarousel');
  const stage = document.getElementById('concaveStage');
  const wall = document.getElementById('concaveWall');
  const prevBtn = document.getElementById('concavePrevBtn');
  const nextBtn = document.getElementById('concaveNextBtn');
  const counterDigits = document.getElementById('concaveCurrentIndex');
  const captionTitle = document.getElementById('concaveCaptionTitle');
  const captionSubtitle = document.getElementById('concaveCaptionSubtitle');

  if (!container || !stage || !wall) return;

  const count = INDUSTRY_ITEMS.length;
  // React Bits Pro Concave Carousel Props
  const curvature = 0.72; // Gallery wall curves around the viewer (0=flat, 1=drum)
  const gap = 24;
  const dim = 0.35; // Edge dimming
  const speed = 0.16; // panels per second

  let panelWidth = window.innerWidth < 768 ? 210 : 240;
  let stepWidth = panelWidth + gap;
  // Concave radius: curves around the viewer
  let radius = (stepWidth * count) / (2 * Math.PI * curvature);

  // State
  let currentPos = 0; // Float index position
  let targetPos = 0;
  let isSnapping = false;
  let velocity = 0;
  let isDragging = false;
  let isHovered = false;
  let dragStartX = 0;
  let dragLastX = 0;
  let dragLastTime = 0;
  let dragDistance = 0;
  let lastTimestamp = performance.now();
  let activeIndex = -1;

  // Mount Concave Panels
  wall.innerHTML = '';
  const panels = [];

  INDUSTRY_ITEMS.forEach((item, index) => {
    const panel = document.createElement('div');
    panel.className = 'concave-carousel__panel';
    panel.setAttribute('role', 'button');
    panel.setAttribute('tabindex', '0');
    panel.setAttribute('aria-label', `${item.title}: ${item.subtitle}`);
    panel.dataset.index = index;

    panel.innerHTML = `
      <div class="concave-carousel__panel-inner">
        <img class="concave-carousel__panel-bg" src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="concave-carousel__panel-gradient"></div>
        <div class="concave-carousel__panel-dim"></div>
        <div class="concave-carousel__panel-content">
          <div class="concave-carousel__icon-badge">${item.iconSvg}</div>
          <h4 class="concave-carousel__panel-title">${item.title}</h4>
        </div>
      </div>
    `;

    // Click to focus centered panel
    panel.addEventListener('click', () => {
      if (dragDistance > 6) return;
      snapToPanel(index);
    });

    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        snapToPanel(index);
      }
    });

    wall.appendChild(panel);
    panels.push({
      el: panel,
      dimEl: panel.querySelector('.concave-carousel__panel-dim'),
      index: index
    });
  });

  function updateDimensions() {
    panelWidth = window.innerWidth < 768 ? 210 : 240;
    stepWidth = panelWidth + gap;
    radius = (stepWidth * count) / (2 * Math.PI * curvature);
  }

  window.addEventListener('resize', updateDimensions, { passive: true });

  // Wrap index to stay within [-count/2, count/2]
  function wrapOffset(diff) {
    return ((((diff) % count) + count * 1.5) % count) - count / 2;
  }

  function snapToPanel(idx) {
    const diff = wrapOffset(idx - currentPos);
    targetPos = currentPos + diff;
    isSnapping = true;
    velocity = 0;
  }

  function updateCaptions(idx) {
    if (idx === activeIndex || idx < 0 || idx >= count) return;
    activeIndex = idx;
    const item = INDUSTRY_ITEMS[idx];

    if (counterDigits) {
      counterDigits.textContent = String(idx + 1).padStart(2, '0');
    }

    if (captionTitle) {
      captionTitle.style.opacity = '0';
      captionTitle.style.transform = 'translateY(6px)';
      setTimeout(() => {
        captionTitle.textContent = item.title.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        captionTitle.style.opacity = '1';
        captionTitle.style.transform = 'translateY(0)';
      }, 120);
    }

    if (captionSubtitle) {
      captionSubtitle.style.opacity = '0';
      captionSubtitle.style.transform = 'translateY(6px)';
      setTimeout(() => {
        captionSubtitle.textContent = item.subtitle;
        captionSubtitle.style.opacity = '1';
        captionSubtitle.style.transform = 'translateY(0)';
      }, 120);
    }
  }

  // Animation Loop (60fps)
  function animate(now) {
    const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
    lastTimestamp = now;

    if (isDragging) {
      // Direct drag manipulation
    } else if (isSnapping) {
      const diff = targetPos - currentPos;
      if (Math.abs(diff) < 0.005) {
        currentPos = targetPos;
        isSnapping = false;
      } else {
        currentPos += diff * Math.min(1, 9 * dt);
      }
    } else if (Math.abs(velocity) > 0.01) {
      currentPos += velocity * dt * 60;
      velocity *= Math.pow(0.92, dt * 60);
    } else {
      // Continuous autoplay drift when not hovered
      if (!isHovered) {
        currentPos += speed * dt;
      }
    }

    // Keep currentPos cleanly in [0, count)
    currentPos = ((currentPos % count) + count) % count;

    // Centered item index
    const centerIdx = Math.round(currentPos) % count;
    updateCaptions(centerIdx);

    // Render Concave Curved Wall
    panels.forEach((item) => {
      // Relative offset from center
      const offset = wrapOffset(item.index - currentPos);
      const arcDist = offset * stepWidth;
      const theta = arcDist / radius; // radians

      // Concave geometry: Curves FORWARD toward viewer as theta moves away from 0
      const x = radius * Math.sin(theta);
      const z = radius * (1 - Math.cos(theta)); // z >= 0 (concave arc enveloping the viewer!)
      // Rotate panel inward to face the viewer
      const rotY = -theta * (180 / Math.PI);

      // Stacking order: centered panel has highest priority
      const depthOrder = Math.round((1 - Math.abs(offset) / (count / 2)) * 100);
      item.el.style.zIndex = depthOrder;

      // Concave 3D Transform
      item.el.style.transform = `translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg)`;

      // Edge Dimming (React Bits Pro Dim: 0.35)
      const edgeFactor = Math.min(dim, Math.pow(Math.abs(theta) / (Math.PI / 2.7), 1.5) * dim);
      if (item.dimEl) {
        item.dimEl.style.opacity = edgeFactor.toFixed(3);
      }

      // Highlight centered panel
      if (Math.abs(offset) < 0.35) {
        item.el.classList.add('is-center');
      } else {
        item.el.classList.remove('is-center');
      }
    });

    requestAnimationFrame(animate);
  }

  // Pointer Drag Interaction
  stage.addEventListener('pointerdown', (e) => {
    isDragging = true;
    isSnapping = false;
    velocity = 0;
    dragStartX = e.clientX;
    dragLastX = e.clientX;
    dragLastTime = performance.now();
    dragDistance = 0;
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const now = performance.now();
    const dx = e.clientX - dragLastX;
    const dt = Math.max((now - dragLastTime) / 1000, 0.008);
    dragDistance += Math.abs(dx);

    // Negative dx moves through items
    currentPos -= (dx / stepWidth) * 1.15;
    velocity = (-dx / stepWidth / dt) * 0.016;

    dragLastX = e.clientX;
    dragLastTime = now;
  });

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try {
      if (stage.hasPointerCapture(e.pointerId)) {
        stage.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    // Snap to nearest panel if moved slowly or released
    if (Math.abs(velocity) < 0.08) {
      velocity = 0;
      targetPos = Math.round(currentPos);
      isSnapping = true;
    }
  };

  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // Pause on hover
  stage.addEventListener('mouseenter', () => {
    isHovered = true;
  });

  stage.addEventListener('mouseleave', () => {
    isHovered = false;
  });

  // Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      targetPos = Math.round(currentPos) - 1;
      isSnapping = true;
      velocity = 0;
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      targetPos = Math.round(currentPos) + 1;
      isSnapping = true;
      velocity = 0;
    });
  }

  // Keyboard navigation
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      targetPos = Math.round(currentPos) - 1;
      isSnapping = true;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      targetPos = Math.round(currentPos) + 1;
      isSnapping = true;
    }
  });

  // Start engine
  requestAnimationFrame(animate);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConcaveCarousel);
} else {
  initConcaveCarousel();
}

function scrollToContact(e) {
  if (e) e.preventDefault();
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(contactSection, { offset: -70, duration: 1.1 });
    } else {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    window.location.href = 'index.html#contact';
  }
}
window.scrollToContact = scrollToContact;

/* ------------------------------------------------------------
   Header Enquiry Button -> Smooth Scroll & Focus Contact Form
   ------------------------------------------------------------ */
function scrollToContactForm(e) {
  if (e) e.preventDefault();
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(contactSection, { offset: -60, duration: 1.1 });
    } else {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      const input = document.getElementById('contactFullName');
      if (input) {
        input.focus();
        input.classList.add('focused-pulse');
        setTimeout(() => input.classList.remove('focused-pulse'), 1500);
      }
    }, 700);
  } else {
    window.location.href = 'index.html#contact';
  }
}
window.scrollToContactForm = scrollToContactForm;

/* ------------------------------------------------------------
   Open Product Modal from Footer (Smooth Scroll to #products + Open Modal)
   ------------------------------------------------------------ */
function openProductFromFooter(e, key) {
  if (e) e.preventDefault();
  const prodSec = document.getElementById('products');
  if (prodSec) {
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(prodSec, { offset: -70, duration: 1.0 });
    } else {
      prodSec.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      openExploreStepsModal(key);
    }, 450);
  } else {
    openExploreStepsModal(key);
  }
}

/* ------------------------------------------------------------
   Hero Section 3-Headline Sequential Rotating Animation
   Order:
   1. Finance Your Invoices, Orders, and Everyday Business Needs
   2. Keep Cash Flowing, Orders Moving, and Business Growing
   3. Business Finance from Purchase Orders to Payments
   ------------------------------------------------------------ */
function initHeroHeadlineRotator() {
  const slides = Array.from(document.querySelectorAll('.hero-h1-slide'));
  if (slides.length <= 1) return;

  let currentIndex = 0;
  const displayDuration = 3800; // ms visible per headline

  function nextSlide() {
    const currentSlide = slides[currentIndex];
    currentSlide.classList.remove('active');
    currentSlide.classList.add('exiting');

    setTimeout(() => {
      currentSlide.classList.remove('exiting');
    }, 650);

    currentIndex = (currentIndex + 1) % slides.length;
    const next = slides[currentIndex];
    next.classList.add('active');
  }

  // Rotate smoothly on interval
  setInterval(nextSlide, displayDuration);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroHeadlineRotator);
} else {
  initHeroHeadlineRotator();
}

/* ------------------------------------------------------------
   Interactive Working Capital Calculator Controller
   ------------------------------------------------------------ */
let currentCalcFacility = 'Invoice Financing';

function formatIndianCurrency(num) {
  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${cr} Crore${cr > 1 ? 's' : ''}`;
  } else if (num >= 100000) {
    const lk = (num / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${lk} Lakh${lk > 1 ? 's' : ''}`;
  }
  return `₹ ${num.toLocaleString('en-IN')}`;
}

function setCalcFacility(btn, facilityName) {
  currentCalcFacility = facilityName;
  const tabs = document.querySelectorAll('#wcFacilityTabs .wc-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  updateWorkingCapitalCalc();
}

function updateWorkingCapitalCalc() {
  const amountSlider = document.getElementById('calcAmountSlider');
  const roiSlider = document.getElementById('calcRoiSlider');
  const tenorSlider = document.getElementById('calcTenorSlider');
  
  const amountDisplay = document.getElementById('calcAmountDisplay');
  const roiDisplay = document.getElementById('calcRoiDisplay');
  const tenorDisplay = document.getElementById('calcTenorDisplay');
  const advanceDisplay = document.getElementById('calcAdvanceDisplay');
  const costDisplay = document.getElementById('calcCostDisplay');

  if (!amountSlider || !advanceDisplay) return;

  const amount = parseFloat(amountSlider.value) || 5000000;
  const roi = parseFloat(roiSlider ? roiSlider.value : 12);
  const tenor = parseInt(tenorSlider ? tenorSlider.value : 60, 10);

  if (amountDisplay) amountDisplay.textContent = formatIndianCurrency(amount);
  if (roiDisplay) roiDisplay.textContent = `${roi.toFixed(1)}% p.a.`;
  if (tenorDisplay) tenorDisplay.textContent = `${tenor} Days`;

  // Advance percentage based on facility
  let advanceRate = 0.90; // Default 90% for Invoice Financing
  if (currentCalcFacility === 'Purchase Order Financing') {
    advanceRate = 0.80; // 80% on PO
  } else if (currentCalcFacility === 'Working Capital Loan') {
    advanceRate = 0.85; // 85% on WC
  }

  const estimatedAdvance = Math.round(amount * advanceRate);
  advanceDisplay.textContent = formatIndianCurrency(estimatedAdvance);

  // Interest cost for the cycle = (Advance * (ROI / 100) * (Tenor / 365))
  const interestCost = Math.round(estimatedAdvance * (roi / 100) * (tenor / 365));
  if (costDisplay) {
    costDisplay.textContent = formatIndianCurrency(interestCost);
  }
}

function applyWithCalculatorEstimate() {
  const amountSlider = document.getElementById('calcAmountSlider');
  const roiSlider = document.getElementById('calcRoiSlider');
  const tenorSlider = document.getElementById('calcTenorSlider');
  const amount = amountSlider ? formatIndianCurrency(parseFloat(amountSlider.value)) : '₹ 50 Lakhs';
  const roi = roiSlider ? `${parseFloat(roiSlider.value).toFixed(1)}% p.a.` : '12.0% p.a.';
  const tenor = tenorSlider ? tenorSlider.value : '60';

  scrollToContactForm();

  // Populate contact form fields
  setTimeout(() => {
    const enquirySelect = document.getElementById('contactEnquiryType');
    if (enquirySelect) {
      enquirySelect.value = currentCalcFacility;
    }
    const messageBox = document.getElementById('contactMessage');
    if (messageBox) {
      messageBox.value = `Eligibility Assessment Request:\n- Required Facility: ${amount}\n- Facility Type: ${currentCalcFacility}\n- Desired ROI: ${roi}\n- Expected Tenor: ${tenor} Days\n\nPlease check our eligibility and contact me with preliminary terms.`;
    }
  }, 400);
}

function applyForProduct(facilityName) {
  scrollToContactForm();
  setTimeout(() => {
    const enquirySelect = document.getElementById('contactEnquiryType');
    if (enquirySelect) {
      enquirySelect.value = facilityName;
    }
    const messageBox = document.getElementById('contactMessage');
    if (messageBox && !messageBox.value) {
      messageBox.value = `I am interested in applying for ${facilityName}. Please contact me to assess our eligibility.`;
    }
  }, 400);
}

window.setCalcFacility = setCalcFacility;
window.updateWorkingCapitalCalc = updateWorkingCapitalCalc;
window.applyWithCalculatorEstimate = applyWithCalculatorEstimate;
window.applyForProduct = applyForProduct;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateWorkingCapitalCalc);
} else {
  updateWorkingCapitalCalc();
}
