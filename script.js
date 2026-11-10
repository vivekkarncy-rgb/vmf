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

// ==========================================================================
// Institutional Policy Modal Controller (Popup System)
// ==========================================================================
const policyRegistry = {
  'collections-recovery-policy': {
    title: "Collections & Recovery Policy",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Public</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Compliance &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Business, Credit &amp; Risk, Compliance &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead>
              <tr>
                <th style="width: 10%;">S.No.</th>
                <th>Regulatory Reference Circular</th>
                <th style="width: 25%;">Issue Date</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>(i)</td><td>Circular &ndash; Guidance Note on Credit Risk Management</td><td>September 20, 2001</td></tr>
              <tr><td>(ii)</td><td>Master Circular &ndash; Prudential norms on Income Recognition, Asset Classification and Provisioning pertaining to Advances</td><td>July 1, 2015</td></tr>
              <tr><td>(iii)</td><td>Master Circular on Wilful Defaulters</td><td>January 7, 2015</td></tr>
              <tr><td>(iv)</td><td>Circular on Recovery Agents engaged by Banks</td><td>April 24, 2008</td></tr>
              <tr><td>(v)</td><td>Framework for Revitalizing Distressed Assets in the Economy &ndash; Guidelines on Joint Lenders&rsquo; Forum (JLF) and Corrective Action Plan (CAP)</td><td>February 26, 2014</td></tr>
              <tr><td>(vi)</td><td>Framework for Revival and Rehabilitation of Micro, Small and Medium Enterprises (MSMEs)</td><td>March 17, 2016</td></tr>
              <tr><td>(vii)</td><td>Prudential Norms on Change in Ownership of Borrowing Entities (Outside Strategic Debt Restructuring Scheme)</td><td>September 24, 2015</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="policy-section-title">1. Introduction</div>
      <p>The Collections &amp; Recovery Policy of VMF Finance Limited (hereafter referred as &ldquo;the Company&rdquo; or &ldquo;VMF&rdquo;) shall aim at making the recovery process faster, so that Gross NPA level is maintained as per the risk appetite of the Company.</p>
      <p>It is essential for a sound NPA management system to have functionality allowing for quick identification of non-performing advances, their containment at minimum levels and ensuring that their impingement on financials of the Company is minimum.</p>

      <div class="policy-section-title">2. Objectives &amp; Principles</div>
      <p>The quality and performances of advances have a direct bearing on the profitability of VMF. Despite an efficient credit appraisal, disbursement and monitoring mechanism, problems can still arise due to various factors and give scope for Non-Performing Assets (NPA). These factors may be internal or external.</p>
      <p><strong>Key objectives of the policy are:</strong></p>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>Strengthening the management and recovery of NPAs and proactive initiatives to closely monitor existing accounts.</li>
        <li>Present system of early identification and reporting of all existing and potential problem loans in preventing NPA incidence.</li>
        <li>Loan Review Mechanism triggered on detection of early warning signals for effective correction.</li>
        <li>Collection, recovery and resolution of loans through rehabilitation, compromise settlements etc.</li>
        <li>Cleansing of NPA portfolio through judicious write-offs.</li>
        <li>Improving internal efficiency of the recovery machinery and enhancing Company profitability.</li>
      </ul>
      <p><strong>Guiding principles:</strong> Recovery based on legal and acceptable practices; treat defaulters with respect and dignity; strictly non-coercive tactics; prior written notice before legal or recovery action/repossession; repossession only for recovery of dues in a fair and transparent manner.</p>

      <div class="policy-section-title">3. Policy Review &amp; Approval Process</div>
      <p>Reviewed and updated at least annually by Head-Credit with sign-off from Head-Risk and Compliance and MD &amp; CEO, submitted to Risk Management Committee of the Board (&ldquo;RMCB&rdquo;) for recommendation and Board approval.</p>

      <div class="policy-section-title">4. Key Definitions</div>
      <p><strong>Default:</strong> Asset classified as NPA in accordance with the Credit Management Policy.</p>
      <p><strong>Non-performing assets (NPA):</strong> Loan/advance where interest/instalment remains overdue for &gt; 90 days for Term Loans; account remains &lsquo;out of order&rsquo; for OD/CC; bill remains overdue for &gt; 90 days; crop loan overdues (1 or 2 seasons); securitization liquidity facility &gt; 90 days; derivative contracts positive MTM &gt; 90 days; any amount overdue &gt; 90 days for other accounts.</p>
      <p><strong>&lsquo;Out of Order&rsquo; status:</strong> Continuous outstanding balance in excess of sanctioned limit/drawing power, or no credits continuously for 90 days / insufficient credits to cover interest.</p>
      <p><strong>Overdue:</strong> Any amount due not paid on the due date fixed by the Company.</p>

      <div class="policy-section-title">5. Collections</div>
      <p><strong>5.1. Introduction:</strong> Built around dignity, respect, courtesy, fair treatment and persuasion. Repayment schedules fixed taking into account paying capacity and cash flow patterns.</p>
      <p><strong>5.2. Collection Mechanisms:</strong> Prior written notice required before legal measures or repossession. Hypothecated asset repossession followed by 7-day sale notice; SARFAESI asset sale followed by 30-day notice with publication in two leading newspapers (one local vernacular). Opportunity given to borrower to reclaim repossessed assets within 7 days upon full settlement of arrears.</p>
      <p><strong>5.3. Retail &amp; MSME Guidelines:</strong> Contacts made at customer's place of choice/residence/business; identity verification with VMF authority letter; customer privacy respected; calling hours strictly between <strong>0700 hrs and 1900 hrs</strong>; avoiding inappropriate occasions like bereavement.</p>

      <div class="policy-section-title">6. Recovery &amp; Resolution Mechanism</div>
      <p><strong>SARFAESI Act:</strong> Authorised Officer (AO) appointed. Demand notice issued post-NPA; 7 days to reply to objections; 30 days notice of sale; maximum 6 months turnaround for entire proceedings.</p>
      <p><strong>Willful Defaulters:</strong> Deliberate non-payment despite capacity, diversion of funds, or siphoning. Classified irrespective of amount internally; accounts &ge; &rupee;25 lac reported quarterly to CIBIL and RBI. Executive Risk Committee (ERC) reviews cases for criminal prosecution.</p>
      <p><strong>Tools for Recovery:</strong> Restructuring (5&ndash;7 years viability window), Corrective Action Plan (CAP) for MSMEs (Rectification within 6 months; Restructuring for Standard/SMA/Sub-Standard with promoter personal guarantee), Settlements/Compromise (OTS: minimum 25% upfront, balance in 1 yr with PLR interest). OTS Approval Matrix: &lt; INR 5,000 Head Credit; &ge; INR 5,000 Credit Committee. Forced sale value benchmarks; RMCB approval for deviations.</p>
      <p><strong>Legal Action:</strong> SARFAESI Act, 2002; arbitration under Arbitration and Conciliation Act, 2015; Civil Courts / DRT; winding up petitions and IBC insolvency proceedings.</p>
      <p><strong>Write-off:</strong> Permitted when borrower has no attachable assets or income. Approved by RMCB and ratified by the Board.</p>

      <div class="policy-section-title">Annexure 1: Roles &amp; Responsibilities of Recovery Agents</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>Identity cards mandatory; role limited strictly to entrusted NPA accounts.</li>
        <li>Representatives must have undergone training and obtained certificates from <strong>IIBF</strong>.</li>
        <li>Infrastructure for recording conversations with borrowers.</li>
        <li>Recoveries accepted by cheques and drafts only in favour of Company &ndash; strictly zero cash.</li>
        <li>Pre-employment Police verification and mandatory re-verification every 2 years.</li>
        <li>Strict adherence to Company's Model Code of Conduct.</li>
      </ul>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Business, Credit &amp; Risk, Compliance</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'directors-fit-proper-policy': {
    title: "Directors Fit & Proper Policy",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Public</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Compliance &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Management &amp; Directors; Compliance &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead><tr><th>Regulatory Reference Circular</th><th>Issue Date</th></tr></thead>
            <tbody>
              <tr><td>RBI/2014-15/299 DNBR (PD) CC.No.002/03.10.001/2014-15</td><td>November 10, 2014</td></tr>
              <tr><td>RBI/2014-15/552 DNBR (PD) CC.No. 029/03.10.001/2014-15</td><td>April 10, 2015</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="policy-section-title">1. Preamble &amp; Purpose</div>
      <p>Framed under the &lsquo;Revised Regulatory Framework for NBFC&rsquo; issued by RBI. Ensures Directors responsible for steering VMF are fit and proper, possessing requisite qualifications, technical expertise, integrity, and track record.</p>

      <div class="policy-section-title">2. Policy Procedures</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>Due diligence process to determine suitability at appointment and renewal.</li>
        <li>Information and declarations obtained in Annexure 1 format.</li>
        <li>Annual declaration obtained from all Directors every year as on <strong>31st March</strong> confirming information has not undergone change.</li>
        <li>Execution of <strong>&lsquo;Deed of Covenant&rsquo;</strong> with nominated/elected Directors (Annexure 2).</li>
        <li>Nomination and Remuneration Committee (NRC) constituted under Companies Act, 2013.</li>
      </ul>

      <div class="policy-section-title">Fit &amp; Proper Evaluation Criteria</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>No disqualification under Companies Act, 2013 or Stock Exchange agreements.</li>
        <li>No past or pending civil, criminal, economic offence, taxation, or regulatory proceedings (SEBI, IRDA, MCA, etc.).</li>
        <li>No investigations at the instance of Government Agencies.</li>
        <li>No prosecution/conviction for violation of economic laws and regulations.</li>
      </ul>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Compliance Officer</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'fair-practices-code': {
    title: "Fair Practices Code (FPC)",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Public</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Compliance Officer &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Business &amp; Investments, Credit &amp; Risk, Operations &amp; Legal &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead><tr><th>Regulatory Reference Circular</th><th>Issue Date</th></tr></thead>
            <tbody>
              <tr><td>RBI/DoR/2023-24/106 Master Direction &ndash; Scale Based Regulation Directions, 2023</td><td>October 19, 2023</td></tr>
              <tr><td>RBI/2015-16/16 Master Circular &ndash; Fair Practices Code, 2015</td><td>July 01, 2015</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="policy-section-title">Introduction &amp; Core Standards</div>
      <p>Formulated in line with RBI guidelines to promote fair, transparent, and ethical customer practices across loan origination, processing, servicing, and collections.</p>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li><strong>Applications &amp; Processing:</strong> Communications in English or vernacular. Loan applications include necessary comparison information, required document checklists, and written acknowledgements specifying disposal timeframes.</li>
        <li><strong>Appraisal &amp; Sanctions:</strong> Written Sanction Letter conveys sanctioned amount, annualized interest rate, terms and conditions. Loan agreements furnished with all enclosures. Full compliance with RBI circular on <strong>&lsquo;Key Facts Statement (KFS) for Loans &amp; Advances&rsquo; dated April 15, 2024</strong>.</li>
        <li><strong>Disbursement &amp; Rate Changes:</strong> Notice given of changes in terms; rate and charge changes applied strictly <strong>prospectively</strong>. Release of all securities upon loan closure.</li>
        <li><strong>Excessive Interest Regulation:</strong> Board-approved interest rate model based on cost of funds, margin, and risk premium. Disclosed on website and sanction letter. Strictly annualized rates. <strong>Zero capitalization of penal charges</strong>.</li>
        <li><strong>Non-Harassment:</strong> Non-interference in customer affairs; no muscle power or odd-hour calls; staff trained for professional courtesy.</li>
        <li><strong>Grievance Redressal:</strong> Display of Grievance Redressal Officer (GRO) contact details. Unresolved complaints beyond 30 days appealable to Regional Office of DNBS, RBI.</li>
      </ul>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Compliance Officer</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'grievance-redressal': {
    title: "Customer Grievance Redressal Policy & Ombudsman Scheme",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Public</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Compliance Team &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Management &amp; Directors; Compliance &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead><tr><th>Regulatory Reference</th><th>Subject</th></tr></thead>
            <tbody>
              <tr><td>RBI/2012-13/50 DBOD No.Leg.BC. 21 /09.07.006/2012-13</td><td>Grievance Redressal Mechanism in NBFCs</td></tr>
              <tr><td>Reserve Bank &ndash; Integrated Ombudsman Scheme, 2021</td><td>Alternative Dispute Redressal Mechanism</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="policy-callout-green">
        <strong>Coverage under Integrated Ombudsman Scheme, 2021:</strong> Covers customers of all Deposit taking NBFCs and NBFCs with asset size &ge; &rupee;100 crore with customer interface.
      </div>

      <div class="policy-section-title">Principal Nodal Officer Details</div>
      <div class="policy-table-wrapper">
        <table>
          <thead>
            <tr><th>Nodal Officer</th><th>Designation &amp; Jurisdiction</th><th>Office Address</th><th>Contact Numbers</th><th>Email ID</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mr. Srinivasa Rao Palla</strong></td>
              <td>Principal Nodal Officer (All India)</td>
              <td>Plot No. 43, The Park View, 5th Floor, Sy.No.55 to 58, Lumbini Avenue, Gachibowli, Hyderabad &ndash; 500032</td>
              <td>Mobile: <strong>+91 9989166675</strong><br>Landline: <strong>040-42011067</strong></td>
              <td><code style="color: #15803D; font-weight: 700; background: #DCFCE7; padding: 2px 6px; border-radius: 4px;">compliance@vmffinance.com</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="policy-section-title">Procedure for Filing Complaint &amp; Ombudsman Powers</div>
      <p>Complainants may lodge grievances online at <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" style="color: #05244F; font-weight: 700; text-decoration: underline;">https://cms.rbi.org.in</a> or write to the Centralized Receipt and Processing Centre (CRPC), RBI if unresolved by VMF within 30 days.</p>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>Regulated Entity must file written response within <strong>15 days</strong>.</li>
        <li>Ombudsman compensation powers: up to <strong>&rupee; 20 Lakh</strong> for consequential loss + up to <strong>&rupee; 1 Lakh</strong> for loss of time, expenses, harassment and mental anguish.</li>
        <li>Appeals before Appellate Authority within <strong>30 days</strong> of Award receipt.</li>
      </ul>

      <div class="policy-section-title">Official Addresses of all 22 RBI Ombudsmen Across India</div>
      <div class="policy-table-wrapper">
        <table>
          <thead>
            <tr><th>No.</th><th>Centre</th><th>Office Address</th><th>STD / Tel</th><th>Email</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td><strong>Ahmedabad</strong></td><td>C/o RBI, 4th Floor, "Riverfront House", Behind H.K. Arts College, Riverfront Road - West, Ahmedabad - 380 009</td><td>079-26582357</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>2</td><td><strong>Bengaluru</strong></td><td>C/o RBI, 10/3/8, Nrupathunga Road, Bengaluru - 560 001</td><td>080-22277660</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>3</td><td><strong>Bhopal</strong></td><td>C/o RBI, Hoshangabad Road, Post Box No. 32, Bhopal - 462 011</td><td>0755-2573772</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>4</td><td><strong>Bhubaneswar</strong></td><td>C/o RBI, Pt. Jawaharlal Nehru Marg, Bhubaneswar - 751 001</td><td>0674-2396420</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>5</td><td><strong>Chandigarh</strong></td><td>C/o RBI, 4th Floor, Sector 17, Chandigarh</td><td>0172-2721109</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>6</td><td><strong>Chennai</strong></td><td>C/o RBI, Fort Glacis, Chennai - 600 001</td><td>044-25395964</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>7</td><td><strong>Dehradun</strong></td><td>C/o RBI, 74/1 G.M.V.N. Building, 1st floor, Rajpur Road, Dehradun - 248 001</td><td>0135-2742006</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>8</td><td><strong>Guwahati</strong></td><td>C/o RBI, Station Road, Pan Bazar, Guwahati - 781 001</td><td>0361-2542556</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>9</td><td><strong>Hyderabad</strong></td><td>C/o RBI, 6-1-56, Secretariat Road, Saifabad, Hyderabad - 500 004</td><td>040-23210013</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>10</td><td><strong>Jaipur</strong></td><td>C/o RBI, 4th floor Rambagh Circle, Tonk Road, Jaipur - 302 004</td><td>0141-2577931</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>11</td><td><strong>Jammu</strong></td><td>C/o RBI, Rail Head Complex, Jammu - 180 012</td><td>0191-2477905</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>12</td><td><strong>Kanpur</strong></td><td>C/o RBI, M. G. Road, Post Box No. 82, Kanpur - 208 001</td><td>0512-2305174</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>13</td><td><strong>Kolkata</strong></td><td>C/o RBI, 15, Netaji Subhash Road, Kolkata - 700 001</td><td>033-22310217</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>14</td><td><strong>Mumbai (I)</strong></td><td>C/o RBI, 4th Floor, Byculla Office Building, Opp. Mumbai Central Railway Station, Mumbai - 400 008</td><td>022-23022028</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>15</td><td><strong>Mumbai (II)</strong></td><td>C/o RBI, 4th Floor, Byculla Office Building, Opp. Mumbai Central Railway Station, Mumbai - 400 008</td><td>022-23001483</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>16</td><td><strong>Patna</strong></td><td>C/o RBI, Patna - 800 001</td><td>0612-2322569</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>17</td><td><strong>New Delhi (I)</strong></td><td>C/o RBI, Sansad Marg, New Delhi</td><td>011-23725445</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>18</td><td><strong>New Delhi (II)</strong></td><td>C/o RBI, Sansad Marg, New Delhi</td><td>011-23724856</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>19</td><td><strong>New Delhi (III)</strong></td><td>C/o RBI, Sansad Marg, New Delhi</td><td>011-23715393</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>20</td><td><strong>Raipur</strong></td><td>C/o RBI, 54/949, Shubhashish Parisar, Satya Prem Vihar, Mahadev Ghat Road, Raipur - 492 013</td><td>0771-2244246</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>21</td><td><strong>Ranchi</strong></td><td>C/o RBI, 4th Floor, Pragati Sadan, RRDA Building, Kutchery Road, Ranchi - 834 001</td><td>0651-8521346222</td><td>crpc@rbi.org.in</td></tr>
            <tr><td>22</td><td><strong>Thiruvananthapuram</strong></td><td>C/o RBI, Bakery Junction, Thiruvananthapuram - 695 033</td><td>0471-2326769</td><td>crpc@rbi.org.in</td></tr>
          </tbody>
        </table>
      </div>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Compliance Officer</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'interest-rate-policy': {
    title: "Interest Rate Model & Schedule of Charges",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Confidential</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Head of Credit &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Business &amp; Investments, Credit &amp; Risk, Operations, Accounts &amp; Finance &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead><tr><th>Regulatory Reference</th><th>Subject</th></tr></thead>
            <tbody><tr><td>Regulation 45.11 &amp; 45.12 of RBI Master Directions &ndash; Scale Based Regulation Directions, 2023</td><td>Regulation of excessive interest charged by NBFCs</td></tr></tbody>
          </table>
        </div>
      </div>

      <div class="policy-callout-green">
        <strong style="font-size: 15px;">Marginal Cost of Funds based Lending Rate (MCLR): 12.00%</strong><br>
        The current MCLR is <strong>12.00%</strong>. Loans offered cannot be lower than MCLR without Credit Committee prior approval. Reset frequency is quarterly by the Whole Time Director.
      </div>

      <div class="policy-section-title">Schedule of Indicative Lending Rates</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Lending Assets / Sector</th><th>Range of Annualized Interest Rate (p.a.)</th><th>Effective Indicative Ceiling</th></tr></thead>
          <tbody>
            <tr><td><strong>A) MSME / SME Companies</strong></td><td>Up to 6% p.a. over and above MCLR</td><td><strong>Up to 18.00% p.a.</strong></td></tr>
            <tr><td><strong>B) Supply Chain Finance &ndash; Sales Invoice Financing</strong></td><td>Up to 12% p.a. over and above MCLR</td><td><strong>Up to 24.00% p.a.</strong></td></tr>
            <tr><td><strong>C) Supply Chain Finance &ndash; Purchase Invoice Financing</strong></td><td>Up to 8% p.a. over and above MCLR</td><td><strong>Up to 20.00% p.a.</strong></td></tr>
            <tr><td><strong>D) Working Capital Finance</strong></td><td>Up to 6% p.a. over and above MCLR</td><td><strong>Up to 18.00% p.a.</strong></td></tr>
          </tbody>
        </table>
      </div>

      <div class="policy-subsection-title">Comprehensive Schedule of Ancillary Charges</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Fee Component</th><th>Applicable Rate / Range</th><th>Terms &amp; Governance</th></tr></thead>
          <tbody>
            <tr><td><strong>Appraisal &amp; Upfront Charges</strong></td><td>0% &ndash; 3% of loan amount</td><td>Agreed on case-by-case basis; communicated in term sheet.</td></tr>
            <tr><td><strong>Security Deposit / Reserves</strong></td><td>Up to 30% of loan amount</td><td>Deposit, escrow account, DSRA, or ISRA.</td></tr>
            <tr><td><strong>Backend Charges</strong></td><td>Up to 0% &ndash; 2% of loan amount</td><td>Waiver subject to Investment Committee approval.</td></tr>
            <tr><td><strong>Prepayment Charges</strong></td><td>Up to 0% &ndash; 4% of prepayment</td><td>Waiver subject to Investment Committee approval.</td></tr>
            <tr><td><strong>Penal / Default Charges</strong></td><td>1% &ndash; 2% per month on defaulted amount</td><td>Charged for period of default; up to 2% p.a. for non-financial defaults. Non-capitalized.</td></tr>
            <tr><td><strong>Delayed Documentation Fee</strong></td><td>0% &ndash; 2% per month of loan amount</td><td>Levied if documents not executed within 30&ndash;75 days of term sheet.</td></tr>
            <tr><td><strong>Legal &amp; Diligence Cost</strong></td><td>At actuals</td><td>Borne by borrower (or Company in special cases).</td></tr>
            <tr><td><strong>Operational / Banking Charges</strong></td><td>At actuals</td><td>Cheque bounce, part disbursement, cheque swaps, RTGS, No Due Certificate, NOC.</td></tr>
          </tbody>
        </table>
      </div>

      <div class="policy-section-title">Responsibility Matrix</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Action</th><th>Owner</th><th>Review Frequency</th></tr></thead>
          <tbody>
            <tr><td>Review of VMF MCLR</td><td>Business Team</td><td>Quarterly</td></tr>
            <tr><td>Review of Risks and Charges</td><td>Credit Team</td><td>Annual / As needed</td></tr>
          </tbody>
        </table>
      </div>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Head of Credit</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'whistle-blower-policy': {
    title: "Whistle Blower Policy & Vigil Mechanism",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Public</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Compliance &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Management &amp; Directors; Compliance &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead><tr><th>Regulatory Reference</th><th>Issue Date</th></tr></thead>
            <tbody><tr><td>Circular RBI/2006-2007/328</td><td>April 18, 2007</td></tr></tbody>
          </table>
        </div>
      </div>

      <div class="policy-section-title">1. Introduction &amp; Objectives</div>
      <p>The Company has adopted the Code of Ethics &amp; Business Conduct, which lays down the principles and standards governing the actions of the Company and its employees. Any actual or potential violation of the Code, howsoever insignificant, is a matter of serious concern. Formulated under Section 177 of the Companies Act, 2013 and RBI guidelines, this Policy enables directors and employees to report genuine concerns, actual or suspected fraud, or unethical conduct without fear of punishment or unfair treatment.</p>

      <div class="policy-section-title">2. Scope of Malpractices Covered</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>Abuse of authority and breach of contract.</li>
        <li>Negligence causing substantial and specific danger to public health and safety.</li>
        <li>Manipulation of company data/records and procurement fraud.</li>
        <li>Financial irregularities, deficiencies in internal controls, deliberate error in preparation of financial statements, or misrepresentation.</li>
        <li>Wastage or misappropriation of company funds/assets.</li>
        <li>Proliferation of confidential/proprietary commercial information.</li>
        <li>Deliberate violation of law/regulation or breach of approved Company Policy.</li>
      </ul>

      <div class="policy-section-title">3. Reporting Procedure &amp; Channels (Annexure I)</div>
      <p>All Protected Disclosures should be in writing, typed or legibly written in English, forwarded under a covering letter bearing the identity of the Whistle Blower. Anonymous disclosures will not be entertained.</p>
      
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Designated Authority</th><th>Contact Person</th><th>Address &amp; Office</th><th>Official Email ID</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>Nodal Officer</strong></td>
              <td>Mr. Srinivasa Rao Palla</td>
              <td>6&ndash;3&ndash;883/2/A, Tejaswi Plaza, Panjagutta, Hyderabad, Telangana &ndash; 500082</td>
              <td><code style="color: #15803D; font-weight: 700; background: #DCFCE7; padding: 2px 6px; border-radius: 4px;">srinivas.palla@vmffinance.com</code></td>
            </tr>
            <tr>
              <td><strong>Chairman of the Board</strong></td>
              <td>Mr. Siva Krishna Kolli</td>
              <td>6&ndash;3&ndash;883/2/A, Tejaswi Plaza, Panjagutta, Hyderabad, Telangana &ndash; 500082</td>
              <td><code style="color: #15803D; font-weight: 700; background: #DCFCE7; padding: 2px 6px; border-radius: 4px;">krishna@vmffinance.com</code></td>
            </tr>
            <tr>
              <td><strong>General Compliance Reporting</strong></td>
              <td>Compliance Desk (24 Hours)</td>
              <td>VMF Finance Limited, Panjagutta, Hyderabad &ndash; 500082</td>
              <td><code style="color: #15803D; font-weight: 700; background: #DCFCE7; padding: 2px 6px; border-radius: 4px;">compliance@vmffinance.com</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="policy-section-title">4. Investigation Process &amp; SLAs</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>Nodal Officer in consultation with Director determines validity of complaint within <strong>10 working days</strong>.</li>
        <li>Investigation Committee completes the inquiry within <strong>30 working days</strong> (not to exceed 90 days).</li>
        <li>Board / Audit Committee makes decision based on findings and takes prompt corrective disciplinary action.</li>
        <li>Documentation, evidence, and investigation reports maintained for a minimum of <strong>3 years</strong>.</li>
        <li>Nodal Officer submits quarterly compliance reports to the Board/Audit Committee.</li>
      </ul>

      <div class="policy-section-title">5. Whistle Blower Protection</div>
      <p>The identity of the Whistle Blower is kept strictly confidential. VMF guarantees complete protection against retaliation, threat, intimidation, transfer, demotion, or refusal of promotion. Protection is not available for knowingly false or malicious allegations, which will attract severe disciplinary action.</p>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Compliance Officer</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'kyc-aml-policy': {
    title: "KYC and Anti-Money Laundering (AML) Policy",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Public</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Head of Credit &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Business &amp; Investments, Credit &amp; Risk, Operations &amp; Legal &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead><tr><th>Regulatory Reference</th><th>Circular / Direction</th></tr></thead>
            <tbody><tr><td>RBI/DBR/2015-16/18</td><td>Master Direction DBR.AML.BC.No.81/14.01.001/2015-16 &amp; PMLA Rules, 2005</td></tr></tbody>
          </table>
        </div>
      </div>

      <div class="policy-section-title">1. Objectives &amp; Four Key Pillars</div>
      <p>Prevents VMF from being used intentionally or unintentionally by criminal elements for money laundering or terrorist financing. Four core elements:</p>
      <ol style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li><strong>Customer Acceptance Policy (CAP)</strong></li>
        <li><strong>Customer Identification Procedures (CIP)</strong></li>
        <li><strong>Monitoring of Transactions</strong></li>
        <li><strong>Risk Management</strong></li>
      </ol>

      <div class="policy-section-title">2. Customer Acceptance Guidelines</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>No loan account opened in anonymous, fictitious, or Benami names.</li>
        <li>No account opened where Customer Due Diligence (CDD) cannot be applied due to non-cooperation or unreliable documents.</li>
        <li>Screening ensures identity does not match any person/entity on RBI / UN Security Council sanctions lists.</li>
        <li>Digital signatures on e-documents verified per Information Technology Act, 2000.</li>
        <li>Decision-making functions are never outsourced.</li>
      </ul>

      <div class="policy-section-title">3. Risk Level Categorization</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Risk Category</th><th>Profile Characteristics</th><th>Due Diligence Standard</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>Level-I (Low Risk)</strong></td>
              <td>Well-governed corporates, salaried employees with defined salary structures, Government employees, statutory bodies, self-employed with steady track record.</td>
              <td>Standard Customer Due Diligence (CDD)</td>
            </tr>
            <tr>
              <td><strong>Level-II (Medium Risk)</strong></td>
              <td>Higher than average risk based on industry background, country of origin, complex transaction volume.</td>
              <td>Enhanced Due Diligence (EDD)</td>
            </tr>
            <tr>
              <td><strong>Level-III (High Risk)</strong></td>
              <td>Politically Exposed Persons (PEPs) within or outside country, non-face-to-face clients, trusts, societies, NGOs, charities, high net-worth individuals, obscure funding sources.</td>
              <td>Intensive Enhanced Due Diligence; Credit Committee approval required for PEP accounts.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="policy-section-title">4. Periodic Updation of KYC (RBI Mandate)</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Risk Tier</th><th>Mandatory KYC Re-verification Frequency</th></tr></thead>
          <tbody>
            <tr><td><strong>High Risk Customers</strong></td><td>Once in every <strong>2 years</strong></td></tr>
            <tr><td><strong>Medium Risk Customers</strong></td><td>Once in every <strong>8 years</strong></td></tr>
            <tr><td><strong>Low Risk Customers</strong></td><td>Once in every <strong>10 years</strong></td></tr>
          </tbody>
        </table>
      </div>

      <div class="policy-section-title">5. Video-Customer Identification Procedure (V-CIP)</div>
      <p>Undertaken in compliance with Clause 18 of amended KYC Master Direction for customer on-boarding, conversion of OTP-based e-KYC accounts, and periodic KYC updation. Banking Correspondents (BCs) may facilitate at customer end, but ultimate due diligence responsibility remains with VMF.</p>

      <div class="policy-section-title">6. Statutory Reporting to FIU-IND &amp; Record Maintenance</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li><strong>Cash Transaction Reports (CTR):</strong> Individual cash transactions &gt; &rupee;10 Lakhs (or integrally connected) submitted monthly to Director, FIU-IND by 15th of succeeding month.</li>
        <li><strong>Suspicious Transaction Reports (STR):</strong> Submitted to FIU-IND within 7 working days of establishing suspicion without tipping off the client.</li>
        <li><strong>Counterfeit Currency Reports (CCR):</strong> Detection of fake Indian currency reported by 15th of succeeding month.</li>
        <li><strong>Principal Officer:</strong> Designated senior officer operating from Head Office responsible for FIU-IND liaison and fraud reporting. Address: <em>Director, FIU-IND, 6th Floor, Hotel Samrat, Chanakyapuri, New Delhi &ndash; 110021</em>.</li>
        <li><strong>Designated Director:</strong> Nominated by the Board to ensure overall PMLA compliance. (Principal Officer cannot be Designated Director).</li>
        <li><strong>Record Preservation:</strong> All transaction records and client identity records preserved for a minimum of <strong>10 years</strong>.</li>
      </ul>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Head of Credit</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'independent-directors-policy': {
    title: "Policy for Independent Directors",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Public</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Compliance &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Management &amp; Directors; Compliance &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead><tr><th>Regulatory Reference</th><th>Circular / Direction</th></tr></thead>
            <tbody><tr><td>RBI/DOR/2025-26/149</td><td>DOR.HGG.GOV. No.68/29.67.001/2025-26 &amp; Companies Act, 2013</td></tr></tbody>
          </table>
        </div>
      </div>

      <div class="policy-section-title">1. Introduction &amp; Independence Standards</div>
      <p>An Independent Director is a non-executive director with no relationship of any kind with VMF, its Group, or Management that might influence or reasonably be perceived to influence their capacity to exercise independent judgment. Governed under Section 149 read with Schedule IV of the Companies Act, 2013.</p>

      <div class="policy-section-title">2. Criteria of Independence (Section 149(6))</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>Person of integrity possessing relevant expertise and experience.</li>
        <li>Not a promoter of the company or its holding, subsidiary, or associate company; not related to promoters or directors.</li>
        <li>No pecuniary relationship (other than director remuneration or transactions &le; 10% of total income) during the preceding 2 financial years or current year.</li>
        <li>Relatives do not hold securities &gt; &rupee;50 Lakhs or &gt; 2% of paid-up capital; not indebted &gt; &rupee;50 Lakhs; have not provided guarantees &gt; &rupee;50 Lakhs.</li>
        <li>Neither director nor relative has held position of KMP/employee in preceding 3 years, nor been partner/employee of the statutory audit firm or legal/consulting firm with transactions &ge; 10% gross turnover.</li>
        <li>Does not hold, together with relatives, 2% or more of total voting power.</li>
      </ul>

      <div class="policy-section-title">3. Terms of Appointment &amp; Directorship Limits</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>Appointed for a consecutive term of up to <strong>5 years</strong>; eligible for reappointment upon special resolution.</li>
        <li>Maximum tenure: <strong>2 consecutive terms</strong> (cooling-off period of 3 years before subsequent eligibility).</li>
        <li>Subject to statutory cap of maximum <strong>20 company directorships</strong>. Not liable to retire by rotation.</li>
        <li>Formalized via Letter of Appointment specified in Schedule IV of the Act.</li>
        <li>Company maintains <strong>Directors&rsquo; and Officers&rsquo; (D&amp;O) Liability Insurance</strong> covering the full term of appointment.</li>
      </ul>

      <div class="policy-section-title">4. Roles, Duties &amp; Annual Independent Meeting</div>
      <p>Independent Directors hold at least <strong>one meeting each financial year</strong> without the presence of non-independent directors or management to evaluate Board performance, Chairperson performance, and timeliness of information flow. They oversee auditor independence, examine financial statements, evaluate internal financial controls, and recommend CSR policies under Schedule VII.</p>

      <div class="policy-section-title">Annexure 1: Declaration of Independence Format</div>
      <p style="font-size: 13.5px; color: #475569;">Annual declaration executed confirming compliance with all criteria under Section 149(6) of the Companies Act, 2013 addressed to Board of Directors, VMF Finance Limited, 6&ndash;3&ndash;883/2/A, Tejaswi Plaza, Panjagutta, Hyderabad, Telangana &ndash; 500082.</p>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Compliance Officer</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'privacy-policy': {
    title: "Privacy Policy & Digital Lending Data Protection",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Public</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Head of Credit &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Compliance, IT &amp; Operations &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead><tr><th>Regulatory Framework</th><th>Legislation / Circular</th></tr></thead>
            <tbody>
              <tr><td>IT Rules 2011</td><td>Information Technology (Reasonable Security Practices and Sensitive Personal Data) Rules, 2011</td></tr>
              <tr><td>IT Rules 2021</td><td>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</td></tr>
              <tr><td>RBI Digital Lending</td><td>Reserve Bank of India (Digital Lending) Directions, 2025</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="policy-section-title">1. Corporate Identity &amp; Scope</div>
      <p>Owned and operated by VMF Finance Limited, registered office: <em>6&ndash;3&ndash;883/2/A, Tejaswi Plaza, Panjagutta, Hyderabad, Telangana &ndash; 500082</em>; Website: <a href="https://www.vmffinance.com" target="_blank" rel="noopener noreferrer" style="color: #05244F; font-weight: 700;">www.vmffinance.com</a>.</p>

      <div class="policy-section-title">2. Information Collected &amp; Device Permission Restraints</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li><strong>Provided by User:</strong> Name, address, date of birth, contact details, PAN, redacted Aadhaar, employment and financial data, bank statements.</li>
        <li><strong>Collected with Consent:</strong> Device metadata, installed application metadata (for credit scoring), transactional SMS from 6-digit alphanumeric senders, camera/microphone strictly for Video KYC, GPS for address validation.</li>
        <li><strong>Strict Exclusion:</strong> VMF explicitly does <strong>NOT access mobile phone files and media, contact lists, call logs, or telephony functions</strong>.</li>
      </ul>

      <div class="policy-section-title">3. Data Retention &amp; SOP for Data Purge</div>
      <p>Customer data retained during account validity and as required under statutory norms. System and application audit logs maintained for at least <strong>8 years</strong> per RBI directives. Users may request data modification/deletion through the VMF app or website; requests processed via VMF&rsquo;s Standard Operating Procedure for Data Purge within <strong>30&ndash;90 days</strong>.</p>

      <div class="policy-section-title">4. Mandatory Reporting to all 4 Licensed CICs</div>
      <p>All credit facilities availed through VMF, regardless of size or tenor, are reported to all four licensed Credit Information Companies in India: <strong>TransUnion CIBIL</strong>, <strong>Experian</strong>, <strong>CRIF High Mark</strong>, and <strong>Equifax</strong>.</p>

      <div class="policy-section-title">5. Authorised List of Third-Party Service Providers</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Third-Party Service Provider</th><th>Type of Service Provided</th><th>Data Shared</th></tr></thead>
          <tbody>
            <tr><td><strong>Protean eGov Technologies Limited</strong></td><td>Online PAN verification services</td><td>Personal Identifiable Information (PII) Data</td></tr>
            <tr><td><strong>Equifax Credit Information Services Pvt Ltd</strong></td><td>Credit information products</td><td>Personal Identifiable Information (PII) Data</td></tr>
            <tr><td><strong>TransUnion CIBIL Limited</strong></td><td>Credit information products</td><td>Personal Identifiable Information (PII) Data</td></tr>
            <tr><td><strong>Perfios Software Solutions Private Limited</strong></td><td>VKYC, Bank Statement Analysis, GST Data</td><td>Personal Identifiable Information (PII) Data</td></tr>
            <tr><td><strong>CERSAI</strong> (Central Registry of Securitisation Asset Reconstruction &amp; Security Interest of India)</td><td>Centralized registry to record, verify, and track security interests on assets</td><td>Personal Identifiable Information (PII) Data</td></tr>
            <tr><td><strong>Experian Credit Information Co. of India Pvt Ltd</strong></td><td>Credit information utility</td><td>Personal Identifiable Information (PII) Data</td></tr>
            <tr><td><strong>Digiotech Solutions Private Limited</strong></td><td>Electronic/Physical NACH mandate registrations, UPI Autopay</td><td>Personal Identifiable Information (PII) Data</td></tr>
          </tbody>
        </table>
      </div>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Head of Credit</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'related-party-transactions': {
    title: "Related Party Transactions Framework",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Private</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Compliance &bull; 
          <strong>Date of Last Review:</strong> 01-Oct-2026 &bull; 
          <strong>Applicable Departments:</strong> Management &amp; Directors; Compliance &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
        <div class="policy-table-wrapper" style="margin-top: 14px;">
          <table>
            <thead><tr><th>Regulatory Reference</th><th>Circular / Direction</th></tr></thead>
            <tbody><tr><td>RBI/2025-26/179</td><td>DOR.CRE.REC.380/07-02-008/2025-26 &amp; Section 188 Companies Act, 2013</td></tr></tbody>
          </table>
        </div>
      </div>

      <div class="policy-section-title">1. Introduction &amp; Arm's Length Governance</div>
      <p>Related Party Transactions (RPTs) refer to transactions defined under Section 188 of the Companies Act, 2013 with related parties under Section 2(76) &amp; 2(77), and Accounting Standard AS-18. Framework ensures high corporate governance, arm&rsquo;s-length pricing, and conflict-of-interest prevention.</p>

      <div class="policy-section-title">2. Approval Process &amp; Shareholder Thresholds</div>
      <p>Board consent is mandatory for all RPTs. Transactions exceeding the statutory thresholds below require prior shareholder approval by Ordinary Resolution:</p>

      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Nature of Transaction</th><th>Statutory Threshold Limit</th></tr></thead>
          <tbody>
            <tr><td>Sale, purchase or supply of any goods or materials</td><td><strong>10% or more of Turnover</strong> of the Company</td></tr>
            <tr><td>Selling or otherwise disposing of, or buying, property of any kind</td><td><strong>10% or more of Net Worth</strong> of the Company</td></tr>
            <tr><td>Leasing of property of any kind</td><td><strong>10% or more of Turnover</strong> of the Company</td></tr>
            <tr><td>Availing or rendering of any services</td><td><strong>10% or more of Turnover</strong> of the Company</td></tr>
            <tr><td>Appointment to any office or place of profit in company/subsidiary/associate</td><td>Monthly remuneration exceeding <strong>&rupee; 2,50,000/-</strong></td></tr>
            <tr><td>Remuneration for underwriting subscription of securities / derivatives</td><td>Exceeding <strong>1% of Net Worth</strong></td></tr>
          </tbody>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748B;">*Turnover and Net Worth computed on basis of audited financial statements of preceding financial year. Unapproved transactions must be ratified within 3 months or become voidable.</p>

      <div class="policy-section-title">3. Exemptions &amp; Omnibus Approvals</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li>Transactions entered in the ordinary course of business on an arm&rsquo;s length basis are exempt from Board/shareholder approval under Section 188.</li>
        <li>Transactions between holding company and wholly-owned subsidiary whose accounts are consolidated are exempt.</li>
        <li><strong>Audit Committee Omnibus Approval:</strong> Granted for repetitive ordinary-course transactions for up to 1 financial year. Where need cannot be foreseen, omnibus approval permitted up to <strong>&rupee; 1 Crore per transaction</strong>. Omnibus approval prohibited for selling/disposing company undertakings.</li>
      </ul>

      <div class="policy-section-title">4. Director &amp; KMP Disclosure Obligations (Annexure 1)</div>
      <p>Every Director and Key Managerial Personnel must submit an annual declaration disclosing: list of relatives, partnership firms, private companies (as director/member), public companies (where holding &gt; 2% shares with relatives), and bodies corporate whose boards act on their instructions. Interested directors must abstain from participating or voting on relevant agenda items.</p>

      <div class="policy-section-title">Annexure &ndash; I: Version Control Table</div>
      <div class="policy-table-wrapper">
        <table>
          <thead><tr><th>Version</th><th>Approval Date</th><th>Effective Date</th><th>Details</th><th>Owner</th><th>Approved By</th></tr></thead>
          <tbody><tr><td><strong>2026_V1</strong></td><td>01-Oct-2026</td><td>01-Oct-2026</td><td>First Release</td><td>Compliance Officer</td><td>Board of Directors</td></tr></tbody>
        </table>
      </div>`
  },
  'underwriting-policy': {
    title: "Underwriting & Credit Management Policy",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Version: 2026_V1</span>
          <span class="policy-badge policy-badge-green">Effective Date: 01-Oct-2026</span>
          <span class="policy-badge policy-badge-gray">Confidentiality: Public</span>
          <span class="policy-badge policy-badge-navy">Board Approved</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Policy Owner:</strong> Credit Committee &bull; 
          <strong>Applicable:</strong> Credit &amp; Risk, Underwriting &bull; 
          <strong>Reviewed &amp; Approved by:</strong> Board of Directors
        </div>
      </div>

      <div class="policy-section-title">Cash-Flow &amp; Transaction Discipline</div>
      <p>A business&rsquo;s ability to generate cash flow, fulfil purchase orders, collect receivables, and meet repayment obligations is central to sound credit underwriting. VMF evaluates real-world commercial transactions, audited financial records, banking conduct, buyer relationships, and transaction velocity rather than relying merely on static physical real estate.</p>

      <div class="policy-section-title">Multi-Factor Evaluation Criteria</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li><strong>Commercial Authenticity:</strong> Genuine invoices, verified purchase orders, e-way bills, and debtor acceptance.</li>
        <li><strong>Debtor Creditworthiness:</strong> Financial strength, payment track record, and rating of corporate anchor / buyers.</li>
        <li><strong>Banking Conduct:</strong> 12 months bank statements verifying debit/credit turnaround, return ratios, and cash-flow alignment.</li>
        <li><strong>KYC &amp; Promoter Integrity:</strong> Assessment of promoter pedigree, civil litigation checks, CIBIL commercial records, and statutory GST compliance.</li>
      </ul>

      <div class="policy-callout-box">
        *Security, personal/corporate guarantees, receivable assignment, or escrow/DSRA mechanisms may be required depending on facility structure. Every financing proposal is subject to due diligence, credit sanction, and mutually agreed definitive documentation.
      </div>`
  },
  'statutory-declarations': {
    title: "Statutory Regulatory Declarations & Caveat",
    content: `<div class="policy-doc-control-card">
        <div class="policy-badge-row">
          <span class="policy-badge policy-badge-navy">Registration: RBI Certified</span>
          <span class="policy-badge policy-badge-green">Status: Active NBFC-ICC</span>
          <span class="policy-badge policy-badge-gray">Scale: Base Layer</span>
        </div>
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.6;">
          <strong>Corporate Identity Number (CIN):</strong> U67120TG1994PLC168008 &bull; 
          <strong>RBI Certificate of Registration (CoR):</strong> N-09.00484 &bull; 
          <strong>Date of Registration:</strong> 09 February 1994
        </div>
      </div>

      <div class="policy-section-title">Corporate Identity &amp; Statutory Registration</div>
      <ul style="padding-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li><strong>Legal Name:</strong> VMF Finance Limited</li>
        <li><strong>Corporate Identity Number (CIN):</strong> U67120TG1994PLC168008</li>
        <li><strong>RBI Certificate of Registration (CoR):</strong> N-09.00484</li>
        <li><strong>Date of Incorporation / Registration:</strong> 09 February 1994</li>
        <li><strong>Classification:</strong> Non-Banking Financial Company &ndash; Investment &amp; Credit Company (NBFC-ICC), Non-Deposit Taking</li>
        <li><strong>Regulatory Layer:</strong> Base Layer under RBI Scale-Based Regulation (SBR)</li>
      </ul>

      <div class="policy-callout-box">
        <strong>Statutory Regulatory Disclaimer:</strong> VMF Finance Limited is registered with the Reserve Bank of India under Section 45-IA of the RBI Act, 1934. The Reserve Bank of India does not accept any responsibility or guarantee about the present position as to the financial soundness of the Company or for the correctness of any of the statements or representations made or opinions expressed by the Company and for discharge of liability by the Company.
      </div>`
  }
};

function openPolicyModal(policyId) {
  const policy = policyRegistry[policyId] || policyRegistry['underwriting-policy'];
  const modal = document.getElementById('policyModal');
  const titleEl = document.getElementById('policyModalTitle');
  const bodyEl = document.getElementById('policyModalBody');

  if (titleEl) titleEl.innerText = policy.title;
  if (bodyEl) {
    bodyEl.innerHTML = policy.content;
    bodyEl.scrollTop = 0;
  }

  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis) {
      try { lenis.stop(); } catch (err) {}
    }
  }
}

function closePolicyModal() {
  const modal = document.getElementById('policyModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis) {
      try { lenis.start(); } catch (err) {}
    }
  }
}

function closePolicyModalOnBackdrop(e) {
  if (e.target && e.target.id === 'policyModal') {
    closePolicyModal();
  }
}

// Policies Nav Dropdown Controller
function initPolicyDropdown() {
  const dropdown = document.getElementById('policyNavDropdown');
  const trigger = document.getElementById('policyDropdownTrigger');

  if (!dropdown || !trigger) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

function closeDropdowns() {
  const dropdown = document.getElementById('policyNavDropdown');
  const trigger = document.getElementById('policyDropdownTrigger');
  if (dropdown) dropdown.classList.remove('open');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

window.closeDropdowns = closeDropdowns;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPolicyDropdown);
} else {
  initPolicyDropdown();
}

window.openPolicyModal = openPolicyModal;
window.closePolicyModal = closePolicyModal;
window.closePolicyModalOnBackdrop = closePolicyModalOnBackdrop;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePolicyModal();
  }
});


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
    section.style.visibility = 'visible';

    // Entrance Scrub: High base visibility + smooth settle
    gsap.fromTo(section,
      { opacity: 0.85, y: 15 },
      {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 98%',
          end: 'top 70%',
          scrub: 0.3,
          onUpdate: (self) => {
            if (self.progress >= 0.85) {
              section.style.transform = '';
              section.style.opacity = '1';
            }
          },
          onLeave: () => {
            section.style.transform = '';
            section.style.opacity = '1';
          },
          onEnterBack: () => {
            section.style.opacity = '1';
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
      width: 390,
      height: 270,
      cardDistance: 16,
      verticalDistance: 20,
      depth: 36,
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

function initChatbotScrollFix() {
  const chatMessages = document.getElementById('chatMessages');
  const chatWindow = document.getElementById('vmfChatWindow');
  
  if (chatMessages) {
    chatMessages.addEventListener('wheel', function(e) {
      e.stopPropagation();
      const delta = e.deltaY;
      const atTop = this.scrollTop <= 0 && delta < 0;
      const atBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 1 && delta > 0;
      
      if (!atTop && !atBottom) {
        this.scrollTop += delta;
        e.preventDefault();
      }
    }, { passive: false });
  }

  if (chatWindow) {
    chatWindow.addEventListener('wheel', function(e) {
      if (chatMessages && e.target !== chatMessages && !chatMessages.contains(e.target)) {
        e.stopPropagation();
        chatMessages.scrollTop += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbotScrollFix);
} else {
  initChatbotScrollFix();
}

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

function getChatTimestamp() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function appendChatMsg(sender, htmlContent) {
  const msgContainer = document.getElementById('chatMessages');
  if (!msgContainer) return;
  
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
  msgDiv.innerHTML = `
    <div class="chat-bubble">
      ${htmlContent}
      <span class="chat-time">${getChatTimestamp()}</span>
    </div>
  `;
  
  msgContainer.appendChild(msgDiv);
  msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'smooth' });
}

function showTypingIndicator() {
  const msgContainer = document.getElementById('chatMessages');
  if (!msgContainer || document.getElementById('chatTypingIndicator')) return;

  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg bot-msg';
  typingDiv.id = 'chatTypingIndicator';
  typingDiv.innerHTML = `
    <div class="chat-typing-bubble" aria-label="Underwriting Desk is typing">
      <span class="chat-typing-dot"></span>
      <span class="chat-typing-dot"></span>
      <span class="chat-typing-dot"></span>
    </div>
  `;
  msgContainer.appendChild(typingDiv);
  msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'smooth' });

  const statusEl = document.querySelector('.chat-bot-status');
  if (statusEl) {
    statusEl.innerHTML = `<span class="chat-online-dot typing-pulse"></span> Typing...`;
  }
}

function removeTypingIndicator() {
  const typingEl = document.getElementById('chatTypingIndicator');
  if (typingEl) typingEl.remove();

  const statusEl = document.querySelector('.chat-bot-status');
  if (statusEl) {
    statusEl.innerHTML = `<span class="chat-online-dot"></span> Online`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   Conversational Step-by-Step Query Session State
   ============================================================ */
let chatQuerySession = {
  active: false,
  step: 0, // 1: Name, 2: Email, 3: Phone, 4: Message
  data: {
    name: '',
    email: '',
    phone: '',
    message: ''
  }
};

function setChatPlaceholder(text) {
  const input = document.getElementById('chatUserInput');
  if (input) input.placeholder = text;
}

function resetChatPlaceholder() {
  setChatPlaceholder("Type your question or doubt...");
}

function cancelChatQuery() {
  chatQuerySession.active = false;
  chatQuerySession.step = 0;
  chatQuerySession.data = { name: '', email: '', phone: '', message: '' };
  resetChatPlaceholder();
  showChatMainMenu(false);
}

function appendInteractiveOptions(options) {
  const msgContainer = document.getElementById('chatMessages');
  if (!msgContainer || !options || !options.length) return;

  const chipsDiv = document.createElement('div');
  chipsDiv.className = 'chat-quick-chips chat-followup-chips';
  
  chipsDiv.innerHTML = options.map(opt => {
    if (opt.action === 'call') {
      return `<button type="button" class="chat-chip chat-chip-call" onclick="handleQuickChip('agent')">
        <span>Call Now (+91 40 2335 1234)</span>
      </button>`;
    }
    if (opt.action === 'cancel_query') {
      return `<button type="button" class="chat-chip chat-chip-back" onclick="cancelChatQuery()">
        <span>Back to List</span>
      </button>`;
    }
    if (opt.action === 'main_menu') {
      return `<button type="button" class="chat-chip chat-chip-back" onclick="showChatMainMenu(true)">
        <span>Back to List</span>
      </button>`;
    }
    if (opt.action === 'query' || opt.key === 'query') {
      return `<button type="button" class="chat-chip chat-chip-action" onclick="handleQuickChip('query')">
        <span>${opt.label || 'Send a Query to Team'}</span>
      </button>`;
    }
    if (opt.action === 'apply') {
      return `<button type="button" class="chat-chip chat-chip-action" onclick="(() => { scrollToContactForm(); toggleChatbot(); })()">
        <span>${opt.label || 'Apply Online'}</span>
      </button>`;
    }
    if (opt.action === 'calc') {
      return `<button type="button" class="chat-chip chat-chip-action" onclick="(() => { scrollToCalculator(); toggleChatbot(); })()">
        <span>${opt.label || 'Open Calculator'}</span>
      </button>`;
    }
    return `<button type="button" class="chat-chip" onclick="handleQuickChip('${opt.key}')">
      <span>${opt.label}</span>
    </button>`;
  }).join('');

  msgContainer.appendChild(chipsDiv);
  msgContainer.scrollTo({ top: msgContainer.scrollHeight, behavior: 'smooth' });
}

function sendBotReply(htmlContent, followUps = [], delayMs = 500) {
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    appendChatMsg('bot', htmlContent);

    if (followUps && followUps.length > 0) {
      appendInteractiveOptions(followUps);
    }
  }, delayMs);
}

function showChatMainMenu(echoUser = true) {
  // Reset any active query step when returning to main menu
  chatQuerySession.active = false;
  chatQuerySession.step = 0;
  resetChatPlaceholder();

  if (echoUser) {
    appendChatMsg('user', 'Back to List');
  }
  
  const botIntro = `<strong>VMF Credit &amp; Underwriting Desk:</strong><br>
  Select any credit solution or support topic below, or type your custom inquiry:`;

  const mainFollowUps = [
    { key: 'invoice', label: 'Invoice Financing' },
    { key: 'po', label: 'Purchase Order Financing' },
    { key: 'wc', label: 'Working Capital Loans' },
    { key: 'docs', label: 'Required Documents Checklist' },
    { key: 'eligibility', label: 'Eligibility & Limits' },
    { key: 'rates', label: 'Pricing & Sanction Turnaround' },
    { key: 'query', label: 'Send a Query to Team' },
    { action: 'apply', label: 'Apply Online' },
    { action: 'call', label: 'Call Now (+91 40 2335 1234)' }
  ];

  sendBotReply(botIntro, mainFollowUps, 450);
}

function copyChatPhone(text, btn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (btn) {
        const prev = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => { btn.innerText = prev; }, 1800);
      }
    }).catch(() => {});
  }
}

function handleQuickChip(topic) {
  let userText = "";
  let botReply = "";
  let followUps = [];

  if (topic === 'query') {
    // Start step-by-step conversational query flow
    chatQuerySession.active = true;
    chatQuerySession.step = 1;
    chatQuerySession.data = { name: '', email: '', phone: '', message: '' };
    setChatPlaceholder("Type your full name...");

    userText = "Send a Query to Team";
    botReply = `<strong>Send a Query to VMF Team (Step 1 of 4):</strong><br>
    I will guide you step by step to submit your financing requirement directly to our Credit &amp; Underwriting Team.<br><br>
    To begin, please type your <strong>Full Name</strong> below:`;

    followUps = [
      { action: 'cancel_query', label: 'Cancel & Back to List' }
    ];
  } else if (topic === 'invoice') {
    userText = "Tell me about Invoice Financing (Receivables Discounting)";
    botReply = `<strong>Invoice Financing (Receivables Discounting):</strong><br>
    Convert verified receivables from corporate buyers into immediate capital without waiting 30–120 days.<br><br>
    &bull; <strong>Immediate Advance:</strong> Up to 90% of verified invoice face value.<br>
    &bull; <strong>Tenure Flexibility:</strong> 30 to 120 days aligned with corporate buyer credit terms.<br>
    &bull; <strong>Rapid Appraisal:</strong> In-principle sanction within 24–48 business hours.<br>
    &bull; <strong>Repayment Mechanism:</strong> Automatic settlement upon buyer invoice realization.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Apply for Invoice Financing</button>`;
    
    followUps = [
      { key: 'docs', label: 'Required Documents' },
      { action: 'calc', label: 'Calculate Advance' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  } else if (topic === 'po') {
    userText = "How does Purchase Order (PO) Financing work?";
    botReply = `<strong>Purchase Order (PO) Financing:</strong><br>
    Secure upfront funding to procure raw materials and execute verified corporate orders without capital lag.<br><br>
    &bull; <strong>Funding Quantum:</strong> Up to 80% of confirmed purchase order value.<br>
    &bull; <strong>Supplier Direct Disbursement:</strong> Capital disbursed directly to approved material vendors.<br>
    &bull; <strong>Collateral Structure:</strong> Primarily underwritten against buyer creditworthiness and PO validity.<br>
    &bull; <strong>Target Borrowers:</strong> MSME manufacturers, EPC contractors, and corporate suppliers.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Apply for PO Financing</button>`;

    followUps = [
      { key: 'docs', label: 'Required Documents Checklist' },
      { action: 'apply', label: 'Apply for PO Financing' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  } else if (topic === 'wc') {
    userText = "What are your Working Capital Loans?";
    botReply = `<strong>Structured Working Capital Loans:</strong><br>
    Dependable revolving credit lines designed to bridge operational gaps, manage seasonal inventory, and support regular payroll.<br><br>
    &bull; <strong>Facility Ticket Sizes:</strong> From ₹5 Lakhs to ₹5 Crores+.<br>
    &bull; <strong>Transparent Interest:</strong> Interest calculated strictly on the utilized amount, not the sanctioned limit.<br>
    &bull; <strong>Tenure &amp; Renewal:</strong> Flexible short-term cycles with prompt periodic renewals.<br>
    &bull; <strong>Zero Structural Lock-in:</strong> Repay early without punitive exit penalties.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Check Working Capital Eligibility</button>`;

    followUps = [
      { action: 'calc', label: 'Open Working Capital Calculator' },
      { key: 'eligibility', label: 'Eligibility Parameters' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  } else if (topic === 'docs') {
    userText = "What documents are required to apply?";
    botReply = `<strong>Standard Documentation Checklist:</strong><br>
    &bull; <strong>1. Entity KYC:</strong> PAN, Certificate of Incorporation / Partnership Deed, Udyam MSME Registration.<br>
    &bull; <strong>2. Promoter KYC:</strong> PAN, Aadhaar of Directors / Partners.<br>
    &bull; <strong>3. Financial Records:</strong> Last 12 months GST returns (GSTR-3B &amp; GSTR-1), 6–12 months primary bank statements.<br>
    &bull; <strong>4. Financial Statements:</strong> Audited Balance Sheets and P&amp;L accounts for the last 2 financial years.<br>
    &bull; <strong>5. Commercial Trade Proof:</strong> Invoices with proof of delivery or verified Purchase Orders from buyers.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Submit Documents Online</button>`;

    followUps = [
      { action: 'apply', label: 'Start Application' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  } else if (topic === 'eligibility') {
    userText = "What are the eligibility criteria and parameters?";
    botReply = `<strong>Eligibility &amp; Appraisal Parameters:</strong><br>
    &bull; <strong>Entity Form:</strong> MSMEs, Private Limited Companies, LLPs, and registered Partnerships.<br>
    &bull; <strong>Operational Vintage:</strong> Minimum 1–2 years of continuous commercial operations.<br>
    &bull; <strong>Buyer Quality:</strong> Regular transactions with established corporate, institutional, or government buyers.<br>
    &bull; <strong>Banking Discipline:</strong> Clean repayment conduct with healthy cash flow velocity.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Check Your Eligibility Now</button>`;

    followUps = [
      { action: 'apply', label: 'Fill Eligibility Form' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Underwriting Desk' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  } else if (topic === 'rates') {
    userText = "What are the interest rates, charges, and turnaround times?";
    botReply = `<strong>Pricing &amp; Sanction Transparency:</strong><br>
    &bull; <strong>Indicative Interest Rates (ROI):</strong> 9.0% to 20.0% p.a., customized according to transaction risk and buyer credit rating.<br>
    &bull; <strong>Sanction Turnaround:</strong> In-principle terms within 24 to 48 hours upon documentation receipt.<br>
    &bull; <strong>Disbursement:</strong> Immediate credit into verified bank account once agreement is executed.<br>
    &bull; <strong>Full Disclosure:</strong> Zero hidden charges; all fees and processing terms are clearly detailed in your sanction letter.<br><br>
    <button class="chat-action-btn" onclick="scrollToCalculator()">Open ROI Calculator</button>`;

    followUps = [
      { action: 'calc', label: 'Calculate Terms in Calculator' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now for Custom Quote' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  } else if (topic === 'turnaround') {
    userText = "How fast is sanction and disbursement?";
    botReply = `<strong>Sanction &amp; Disbursal Speed:</strong><br>
    &bull; <strong>In-Principle Sanction:</strong> Delivered within <strong>24 to 48 business hours</strong> upon receipt of primary banking &amp; GST records.<br>
    &bull; <strong>Quick Disbursement:</strong> Funds disbursed directly into your business account promptly after verification.<br>
    &bull; <strong>Digital Processing:</strong> Minimum paperwork friction via streamlined underwriting.`;

    followUps = [
      { action: 'apply', label: 'Apply for Rapid Sanction' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  } else if (topic === 'apply') {
    userText = "How do I apply for financing online?";
    botReply = `<strong>Quick 3-Step Online Application:</strong><br>
    1. Fill in your business details in our application form below.<br>
    2. Upload basic KYC and banking statements for instant appraisal.<br>
    3. Review transparent sanction terms and draw down funds directly.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Go to Application Form</button>`;

    followUps = [
      { action: 'apply', label: 'Open Application Form' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  } else if (topic === 'agent' || topic === 'call') {
    userText = "Connect me with Underwriting Desk / Call Now";
    botReply = `<strong>VMF Commercial Credit &amp; Underwriting Desk:</strong><br>
    Our commercial credit officers are on duty to review your business requirement directly.<br><br>
    <div class="chat-advisor-card">
      <div style="font-weight: 700; color: #05244F; font-size: 14.5px; margin-bottom: 4px;">Direct Underwriting Line</div>
      <div class="chat-advisor-row">
        <strong>Phone:</strong> <a href="tel:+914023351234" style="color: #15803D; font-weight: 700; text-decoration: underline;">+91 40 2335 1234</a>
        <button class="chat-copy-btn" onclick="copyChatPhone('+914023351234', this)">Copy</button>
      </div>
      <div class="chat-advisor-row"><strong>Email:</strong> <a href="mailto:credit@vmffinance.com" style="color: #05244F; font-weight: 600;">credit@vmffinance.com</a></div>
      <div class="chat-advisor-row"><strong>Operating Hours:</strong> Mon – Fri: 9:30 AM – 6:30 PM IST</div>
      <div class="chat-advisor-row"><strong>Corporate Office:</strong> Lumbini Avenue, Gachibowli, Hyderabad – 500032</div>
    </div>
    <a href="tel:+914023351234" class="chat-call-direct-btn">
      <span>Call +91 40 2335 1234 Now</span>
    </a>`;

    followUps = [
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'main_menu', label: 'Back to List' },
      { action: 'apply', label: 'Fill Online Application' }
    ];
  }

  appendChatMsg('user', userText);
  sendBotReply(botReply, followUps, 550);
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

  // If user requests to cancel or go back at any point:
  if (lower === 'back' || lower === 'cancel' || lower === 'exit' || lower === 'menu' || lower === 'stop') {
    cancelChatQuery();
    return;
  }

  // ============================================================
  // CONVERSATIONAL STEP-BY-STEP QUERY FLOW (Like a form in chat)
  // ============================================================
  if (chatQuerySession.active) {
    // Step 1: Collecting Full Name
    if (chatQuerySession.step === 1) {
      if (q.length < 2) {
        sendBotReply("Please enter your full name (minimum 2 letters) so our team knows who to address:", [
          { action: 'cancel_query', label: 'Cancel & Back to List' }
        ], 350);
        return;
      }
      chatQuerySession.data.name = q;
      chatQuerySession.step = 2;
      setChatPlaceholder("Type your business email (e.g. name@company.com)...");

      const botReply = `<strong>Step 2 of 4: Business Email</strong><br>
      Nice to meet you, <strong>${escapeHtml(q)}</strong>! What is your <strong>Business Email Address</strong>? Our underwriting desk will send you loan sanction terms and documentation requirements here:`;

      sendBotReply(botReply, [
        { action: 'cancel_query', label: 'Cancel & Back to List' }
      ], 450);
      return;
    }

    // Step 2: Collecting Email Address
    if (chatQuerySession.step === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(q)) {
        sendBotReply("That doesn't appear to be a valid email format. Please type your business email (e.g. name@company.com):", [
          { action: 'cancel_query', label: 'Cancel & Back to List' }
        ], 350);
        return;
      }
      chatQuerySession.data.email = q;
      chatQuerySession.step = 3;
      setChatPlaceholder("Type your 10-digit phone number...");

      const botReply = `<strong>Step 3 of 4: Phone Number</strong><br>
      Thank you! What is your <strong>10-digit Phone Number</strong> so our credit underwriting team can reach you directly?`;

      sendBotReply(botReply, [
        { action: 'cancel_query', label: 'Cancel & Back to List' }
      ], 450);
      return;
    }

    // Step 3: Collecting Phone Number
    if (chatQuerySession.step === 3) {
      const phoneDigits = q.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        sendBotReply("Please enter a valid 10-digit phone number (e.g. 9876543210):", [
          { action: 'cancel_query', label: 'Cancel & Back to List' }
        ], 350);
        return;
      }
      chatQuerySession.data.phone = phoneDigits.slice(-10);
      chatQuerySession.step = 4;
      setChatPlaceholder("Type your financing requirement or message...");

      const botReply = `<strong>Step 4 of 4: Your Query / Requirement</strong><br>
      Almost done! Please share your <strong>Message or Financing Requirement</strong> (e.g., funding amount needed, invoice financing tenure, order details, or specific question):`;

      sendBotReply(botReply, [
        { action: 'cancel_query', label: 'Cancel & Back to List' }
      ], 450);
      return;
    }

    // Step 4: Collecting Message / Requirement & Transmitting to Team
    if (chatQuerySession.step === 4) {
      if (q.length < 4) {
        sendBotReply("Please provide a brief description of your financing requirement or inquiry (min 4 characters):", [
          { action: 'cancel_query', label: 'Cancel & Back to List' }
        ], 350);
        return;
      }
      chatQuerySession.data.message = q;

      const finalPayload = {
        ticketId: 'VMF-QRY-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
        name: chatQuerySession.data.name,
        email: chatQuerySession.data.email,
        phone: chatQuerySession.data.phone,
        message: chatQuerySession.data.message,
        timestamp: new Date().toISOString(),
        displayTime: getChatTimestamp(),
        source: 'VMF Conversational Chatbot'
      };

      // Reset conversational session
      chatQuerySession.active = false;
      chatQuerySession.step = 0;
      resetChatPlaceholder();

      // 1. Persist to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('vmf_admin_queries') || '[]');
        existing.unshift(finalPayload);
        localStorage.setItem('vmf_admin_queries', JSON.stringify(existing));
      } catch (err) {
        console.warn('[Chatbot] LocalStorage save warning:', err);
      }

      // 2. Dispatch to admin backend API
      fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      }).then(res => res.json()).then(data => {
        console.log('[VMF TEAM] Query successfully logged on server:', data);
      }).catch(err => {
        console.log('[VMF TEAM] Query recorded in browser:', finalPayload);
      });

      // 3. Render Confirmation Docket in chat
      const confirmationDocket = `<div class="chat-query-receipt">
        <div class="chat-receipt-badge">Query Delivered to Team</div>
        <div class="chat-receipt-title">Reference Docket: ${finalPayload.ticketId}</div>
        <p class="chat-receipt-desc">
          Thank you, <strong>${escapeHtml(finalPayload.name)}</strong>! Your query has been successfully transmitted directly to the VMF Credit &amp; Underwriting Team (<strong>credit@vmffinance.com</strong>). An underwriting officer will review your details and connect with you within 2 business hours.
        </p>
        <div class="chat-receipt-details">
          <div><strong>Full Name:</strong> ${escapeHtml(finalPayload.name)}</div>
          <div><strong>Email Address:</strong> ${escapeHtml(finalPayload.email)}</div>
          <div><strong>Phone Number:</strong> +91 ${escapeHtml(finalPayload.phone)}</div>
          <div><strong>Requirement:</strong> "${escapeHtml(finalPayload.message)}"</div>
          <div><strong>Transmitted At:</strong> ${finalPayload.displayTime}</div>
          <div><strong>Status:</strong> Assigned to Credit Underwriting Officer</div>
        </div>
      </div>`;

      sendBotReply(confirmationDocket, [
        { key: 'query', label: 'Send Another Query' },
        { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
        { action: 'main_menu', label: 'Back to List' }
      ], 600);
      return;
    }
  }

  // ============================================================
  // NORMAL CONDITIONAL STATEMENTS ROUTING
  // ============================================================
  let botReply = '';
  let followUps = [];

  // Conditional Logic Branch 1: Back to list / Menu
  if (lower.includes('back') || lower.includes('list') || lower.includes('menu') || lower.includes('option') || lower.includes('topics') || lower.includes('start') || lower.includes('restart')) {
    showChatMainMenu(false);
    return;
  }

  // Conditional Logic Branch 2: Send Query / Team / Admin / Message
  if (lower.includes('query') || lower.includes('team') || lower.includes('admin') || lower.includes('message') || lower.includes('enquiry') || lower.includes('inquiry') || lower.includes('ask') || lower.includes('reach out') || lower.includes('ticket') || lower.includes('send') || lower.includes('mail')) {
    handleQuickChip('query');
    return;
  }

  // Conditional Logic Branch 3: Call / Agent / Phone / Human
  if (lower.includes('call') || lower.includes('agent') || lower.includes('human') || lower.includes('phone') || lower.includes('talk') || lower.includes('speak') || lower.includes('number') || lower.includes('officer') || lower.includes('dial') || lower.includes('contact')) {
    botReply = `<strong>Connecting to VMF Credit &amp; Underwriting Desk:</strong><br>
    Our commercial credit officers are ready to assist you directly:<br><br>
    <div class="chat-advisor-card">
      <div style="font-weight: 700; color: #05244F; font-size: 14.5px;">Underwriting &amp; Commercial Lending Desk</div>
      <div class="chat-advisor-row">
        <strong>Direct Line:</strong> <a href="tel:+914023351234" style="color: #15803D; font-weight: 700;">+91 40 2335 1234</a>
        <button class="chat-copy-btn" onclick="copyChatPhone('+914023351234', this)">Copy</button>
      </div>
      <div class="chat-advisor-row"><strong>Email:</strong> <a href="mailto:credit@vmffinance.com" style="color: #05244F;">credit@vmffinance.com</a></div>
      <div class="chat-advisor-row"><strong>Desk Hours:</strong> Mon – Fri: 9:30 AM – 6:30 PM IST</div>
    </div>
    <a href="tel:+914023351234" class="chat-call-direct-btn">
      <span>Call +91 40 2335 1234 Now</span>
    </a>`;

    followUps = [
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'apply', label: 'Fill Application Form' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 4: Invoice Financing
  else if (lower.includes('invoice') || lower.includes('bill') || lower.includes('receivable') || lower.includes('discount')) {
    botReply = `<strong>Invoice Financing (Receivables Discounting):</strong><br>
    Advance up to 90% against verified invoices from approved corporate buyers, bridging 30–120 day payment terms with 24–48h disbursal.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Apply for Invoice Financing</button>`;

    followUps = [
      { key: 'docs', label: 'Invoice Documents' },
      { action: 'calc', label: 'Calculate Advance' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 5: PO Financing
  else if (lower.includes('purchase order') || lower.includes('po') || lower.includes('order') || lower.includes('procure') || lower.includes('supplier')) {
    botReply = `<strong>Purchase Order (PO) Financing:</strong><br>
    Advance capital up to 80% to procure raw materials and execute verified client contracts without straining cash flow.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Apply for PO Financing</button>`;

    followUps = [
      { key: 'docs', label: 'Required PO Documents' },
      { action: 'apply', label: 'Apply for PO Financing' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 6: Working Capital
  else if (lower.includes('working capital') || lower.includes('revolving') || lower.includes('cash flow') || lower.includes('daily') || lower.includes('limit')) {
    botReply = `<strong>Working Capital Loans:</strong><br>
    Revolving facility from ₹5 Lakhs to ₹5 Crores+ structured around your operational turnover with transparent interest charged only on drawn limits.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Check Eligibility</button>`;

    followUps = [
      { action: 'calc', label: 'Open Working Capital Calculator' },
      { key: 'eligibility', label: 'Eligibility Parameters' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 7: Documents & KYC
  else if (lower.includes('document') || lower.includes('kyc') || lower.includes('paper') || lower.includes('gst') || lower.includes('bank statement')) {
    botReply = `<strong>Required Documentation Checklist:</strong><br>
    &bull; Business KYC (PAN, GSTIN, Udyam MSME Registration)<br>
    &bull; Promoter KYC (PAN, Aadhaar)<br>
    &bull; 12 months GST returns (GSTR-3B &amp; GSTR-1)<br>
    &bull; 6–12 months primary bank statements<br>
    &bull; Audited balance sheets (2 years) &amp; Trade invoices/POs.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Upload / Apply</button>`;

    followUps = [
      { action: 'apply', label: 'Submit Documents Online' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 8: Eligibility Criteria
  else if (lower.includes('eligib') || lower.includes('qualif') || lower.includes('criteria') || lower.includes('who can') || lower.includes('am i eligible')) {
    botReply = `<strong>Eligibility Parameters:</strong><br>
    &bull; Registered Indian MSME, Pvt Ltd, or LLP with 1–2+ years operational vintage.<br>
    &bull; Verified commercial trade with established corporate or institutional buyers.<br>
    &bull; Satisfactory banking record and prompt repayment conduct.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Assess My Eligibility</button>`;

    followUps = [
      { action: 'apply', label: 'Fill Eligibility Form' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Underwriting Desk' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 9: Rates & Pricing
  else if (lower.includes('rate') || lower.includes('interest') || lower.includes('roi') || lower.includes('charge') || lower.includes('fee') || lower.includes('cost') || lower.includes('percent')) {
    botReply = `<strong>Pricing &amp; Rates (ROI):</strong><br>
    &bull; Competitive risk-based ROI ranging from <strong>9.0% to 20.0% p.a.</strong><br>
    &bull; Transparent documented sanction letter with zero hidden charges.<br><br>
    <button class="chat-action-btn" onclick="scrollToCalculator()">Open Working Capital Calculator</button>`;

    followUps = [
      { action: 'calc', label: 'Calculate Interest & Terms' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now for Custom Quote' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 10: Sanction Turnaround / Time
  else if (lower.includes('time') || lower.includes('fast') || lower.includes('turnaround') || lower.includes('how long') || lower.includes('disburs') || lower.includes('speed')) {
    botReply = `<strong>Sanction &amp; Disbursement Speed:</strong><br>
    &bull; Initial appraisal turnaround within <strong>24 to 48 business hours</strong> upon complete documentation.<br>
    &bull; Direct disbursal into your verified business bank account promptly upon agreement signing.`;

    followUps = [
      { action: 'apply', label: 'Apply for Rapid Sanction' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 11: Apply / Online Form
  else if (lower.includes('apply') || lower.includes('form') || lower.includes('register') || lower.includes('submit')) {
    botReply = `<strong>Apply Online for Facility:</strong><br>
    Click below to navigate directly to our quick online application form.<br><br>
    <button class="chat-action-btn" onclick="scrollToContactForm()">Go to Application Form</button>`;

    followUps = [
      { action: 'apply', label: 'Open Application Form' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 12: Greetings
  else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('morning') || lower.includes('afternoon') || lower.includes('evening') || lower.includes('namaste')) {
    botReply = `<strong>Hello! Welcome to VMF Finance Limited.</strong><br>
    How can our commercial credit and underwriting team assist your business today? Select an option below or type your question:`;

    followUps = [
      { key: 'invoice', label: 'Invoice Financing' },
      { key: 'po', label: 'Purchase Order Financing' },
      { key: 'wc', label: 'Working Capital Loans' },
      { key: 'docs', label: 'Required Documents' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Conditional Logic Branch 13: Careers
  else if (lower.includes('career') || lower.includes('job') || lower.includes('hiring') || lower.includes('work with us') || lower.includes('resume') || lower.includes('cv')) {
    botReply = `<strong>Careers at VMF Finance:</strong><br>
    We are always seeking talented professionals across credit underwriting, enterprise sales, risk management, and fintech engineering.<br><br>
    &bull; Select <strong>Careers</strong> in the enquiry form or email your profile to <a href="mailto:careers@vmffinance.com" style="color: #2D7B39; font-weight: 600;">careers@vmffinance.com</a>.`;

    followUps = [
      { action: 'apply', label: 'Open Enquiry Form' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }
  // Fallback
  else {
    botReply = `Thank you for your inquiry! VMF Finance Limited provides institutional <strong>Invoice Financing</strong>, <strong>PO Financing</strong>, and <strong>Working Capital Loans</strong> for MSMEs.<br><br>
    Please select an option below, send a query directly to our team, or call our underwriting desk:`;

    followUps = [
      { key: 'invoice', label: 'Invoice Financing' },
      { key: 'po', label: 'Purchase Order Financing' },
      { key: 'docs', label: 'Check Documents' },
      { key: 'query', label: 'Send a Query to Team' },
      { action: 'call', label: 'Call Now (+91 40 2335 1234)' },
      { action: 'main_menu', label: 'Back to List' }
    ];
  }

  sendBotReply(botReply, followUps, 600);
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

function equalizeTestimonialsHeight() {
  const card = document.getElementById('testimonialCard');
  const quoteEl = document.getElementById('testiQuote');
  const authorEl = document.getElementById('testiAuthor');
  const roleEl = document.getElementById('testiRole');
  if (!card || !quoteEl) return;

  const prevMinHeight = card.style.minHeight;
  card.style.minHeight = '0px';

  const origIdx = currentTestimonialIdx;
  let maxH = 0;

  testimonialsData.forEach(item => {
    quoteEl.innerText = item.quote;
    if (authorEl) authorEl.innerText = item.author;
    if (roleEl) roleEl.innerText = item.role;
    const h = card.offsetHeight;
    if (h > maxH) maxH = h;
  });

  const currentItem = testimonialsData[origIdx];
  quoteEl.innerText = currentItem.quote;
  if (authorEl) authorEl.innerText = currentItem.author;
  if (roleEl) roleEl.innerText = currentItem.role;

  if (maxH > 0) {
    card.style.minHeight = maxH + 'px';
  } else if (prevMinHeight) {
    card.style.minHeight = prevMinHeight;
  }
}

function initTestimonialsAutoScroll() {
  const card = document.getElementById('testimonialCard');
  const controls = document.querySelector('.testimonial-controls');

  equalizeTestimonialsHeight();

  window.addEventListener('resize', () => {
    clearTimeout(window.__testiResizeTimer);
    window.__testiResizeTimer = setTimeout(equalizeTestimonialsHeight, 150);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(equalizeTestimonialsHeight).catch(() => {});
  }

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
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M20.1 9.221c-1.81 0-2.55-1.28-1.65-2.85.52-.91.21-2.07-.7-2.59l-1.73-.99c-.79-.47-1.81-.19-2.28.6l-.11.19c-.9 1.57-2.38 1.57-3.29 0l-.11-.19a1.641 1.641 0 00-2.26-.6l-1.73.99c-.91.52-1.22 1.69-.7 2.6.91 1.56.17 2.84-1.64 2.84-1.04 0-1.9.85-1.9 1.9v1.76c0 1.04.85 1.9 1.9 1.9 1.81 0 2.55 1.28 1.64 2.85-.52.91-.21 2.07.7 2.59l1.73.99c.79.47 1.81.19 2.28-.6l.11-.19c.9-1.57 2.38-1.57 3.29 0l.11.19c.47.79 1.49 1.07 2.28.6l1.73-.99c.91-.52 1.22-1.69.7-2.59-.91-1.57-.17-2.85 1.64-2.85 1.04 0 1.9-.85 1.9-1.9v-1.76a1.92 1.92 0 00-1.91-1.9zm-8.1 6.03c-1.79 0-3.25-1.46-3.25-3.25s1.46-3.25 3.25-3.25 3.25 1.46 3.25 3.25-1.46 3.25-3.25 3.25z"/></svg>`
  },
  {
    id: 'automotive',
    title: '<span class="title-line">Auto Components &</span><span class="title-line">Industrial</span>',
    subtitle: 'Tier-1 & Tier-2 automotive ancillaries & precision assemblies',
    image: 'assets/industry-2.jpg',
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M21.75 7.998c0 .41-.34.75-.75.75H3c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.02l.38-1.81c.36-1.75 1.11-3.36 4.09-3.36h7.02c2.98 0 3.73 1.61 4.09 3.36l.38 1.81H21c.41 0 .75.34.75.75zM22.182 13.66c-.15-1.65-.59-3.41-3.8-3.41H5.621c-3.21 0-3.64 1.76-3.8 3.41l-.56 6.09c-.07.76.18 1.52.7 2.09.53.58 1.28.91 2.08.91h1.88c1.62 0 1.93-.93 2.13-1.54l.2-.6c.23-.69.29-.86 1.19-.86h5.12c.9 0 .93.1 1.19.86l.2.6c.2.61.51 1.54 2.13 1.54h1.88c.79 0 1.55-.33 2.08-.91.52-.57.77-1.33.7-2.09l-.56-6.09zm-13.18 2.09h-3c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3c.41 0 .75.34.75.75s-.34.75-.75.75zm9 0h-3c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3c.41 0 .75.34.75.75s-.34.75-.75.75z"/></svg>`
  },
  {
    id: 'textiles',
    title: '<span class="title-line">Textiles & Consumer</span><span class="title-line">Products</span>',
    subtitle: 'Yarn spinning, weaving, finished apparel & fashion exports',
    image: 'assets/industry-3.jpg',
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M16 8.75c-.41 0-.75-.34-.75-.75V4.5c0-1.08-.67-1.75-1.75-1.75h-3c-1.08 0-1.75.67-1.75 1.75V8c0 .41-.34.75-.75.75s-.75-.34-.75-.75V4.5c0-1.91 1.34-3.25 3.25-3.25h3c1.91 0 3.25 1.34 3.25 3.25V8c0 .41-.34.75-.75.75z"/> <path d="M8 17.78a.749.749 0 110-1.5h11.76c.3 0 .53-.26.5-.56l-.68-5.69C19.34 8.09 19 6.5 15.6 6.5H8.4c-3.4 0-3.74 1.59-3.97 3.53l-.9 7.5C3.24 19.99 4 22 7.51 22h8.98c3.16 0 4.09-1.63 4.04-3.75a.49.49 0 00-.5-.47H8z"/></svg>`
  },
  {
    id: 'fmcg',
    title: '<span class="title-line">FMCG & Wholesale</span><span class="title-line">Distribution</span>',
    subtitle: 'High-frequency inventory financing & merchant supply chains',
    image: 'assets/industry-4.jpg',
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M22.36 8.27l-.29-2.77c-.42-3.02-1.79-4.25-4.72-4.25H6.59c-2.94 0-4.3 1.23-4.73 4.28l-.27 2.75c-.1 1.07.19 2.11.82 2.92.76.99 1.93 1.55 3.23 1.55 1.26 0 2.47-.63 3.23-1.64A3.754 3.754 0 0012 12.75c1.29 0 2.42-.6 3.11-1.6.77.99 1.96 1.6 3.2 1.6 1.33 0 2.53-.59 3.28-1.63.6-.8.87-1.81.77-2.85zM11.35 16.66a2.495 2.495 0 00-2.23 2.49v2.74c0 .27.22.49.49.49h4.77c.27 0 .49-.22.49-.49V19.5c.01-2.09-1.22-3.08-3.52-2.84z"/> <path d="M21.37 14.398v2.98c0 2.76-2.24 5-5 5a.49.49 0 01-.49-.49v-2.39c0-1.28-.39-2.28-1.15-2.96-.67-.61-1.58-.91-2.71-.91-.25 0-.5.01-.77.04a3.485 3.485 0 00-3.13 3.48v2.74c0 .27-.22.49-.49.49-2.76 0-5-2.24-5-5v-2.96a1 1 0 011.34-.94c.27.09.54.16.82.2.12.02.25.04.37.04.16.02.32.03.48.03 1.16 0 2.3-.43 3.2-1.17.86.74 1.98 1.17 3.16 1.17 1.19 0 2.29-.41 3.15-1.15.9.73 2.02 1.15 3.16 1.15.18 0 .36-.01.53-.03a4.818 4.818 0 001.21-.26.997.997 0 011.32.94z"/></svg>`
  },
  {
    id: 'agriculture',
    title: '<span class="title-line">Agriculture & Food</span><span class="title-line">Processing</span>',
    subtitle: 'Cold chain storage, agro-commodities & packaged food products',
    image: 'assets/industry-5.jpg',
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M16.17 10.06H7.83c-1.18 0-1.59-.79-.9-1.75l4.17-5.84c.49-.7 1.31-.7 1.8 0l4.17 5.84c.69.96.28 1.75-.9 1.75z"/> <path d="M17.59 17.999H6.41c-1.58 0-2.12-1.05-1.19-2.33l3.99-5.61h5.58l3.99 5.61c.93 1.28.39 2.33-1.19 2.33zM12.75 18v4c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-4h1.5z"/></svg>`
  },
  {
    id: 'pharma',
    title: '<span class="title-line">Pharmaceuticals &</span><span class="title-line">Healthcare</span>',
    subtitle: 'Active ingredients, formulations, diagnostic tools & medical equipment',
    image: 'assets/industry-6.jpg',
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M22 7.81v4.69h-4.08c-.12-.01-.38-.16-.44-.27l-1.04-1.97c-.41-.78-1.12-1.22-1.88-1.18-.76.04-1.41.55-1.74 1.38l-1.38 3.46-.2-.52c-.49-1.27-1.89-2.23-3.27-2.23L2 11.2V7.81C2 4.17 4.17 2 7.81 2h8.38C19.83 2 22 4.17 22 7.81z"/> <path d="M22 16.189v-2.19h-4.08c-.67 0-1.46-.48-1.77-1.07l-1.04-1.97c-.28-.53-.68-.5-.9.05l-2.3 5.81c-.25.65-.67.65-.93 0l-1.14-2.88c-.27-.7-1.11-1.27-1.86-1.27l-5.98.03v3.49c0 3.58 2.1 5.74 5.63 5.8.11.01.23.01.34.01h8c.15 0 .3 0 .44-.01 3.51-.08 5.59-2.23 5.59-5.8zM2 12.7v3.31c-.02-.32-.03-.66-.03-1.01v-2.3H2z"/></svg>`
  },
  {
    id: 'infrastructure',
    title: '<span class="title-line">Infrastructure &</span><span class="title-line">Building Materials</span>',
    subtitle: 'Structural steel, precast concrete, cement & engineering contracting',
    image: 'assets/industry-7.jpg',
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M10.6 4.15c0 .19-.16.35-.35.35H9.12C6.96 4.5 5.2 6.26 5.2 8.42v9.23c0 .19-.16.35-.35.35h-.7C2.96 18 2 17.04 2 15.85V4.15C2 2.96 2.96 2 4.15 2h4.3c1.19 0 2.15.96 2.15 2.15zM22 4.15v11.7c0 1.19-.96 2.15-2.15 2.15h-.63c-.19 0-.35-.16-.35-.35V8.42c0-2.16-1.76-3.92-3.92-3.92h-1.2c-.19 0-.35-.16-.35-.35 0-1.19.96-2.15 2.15-2.15h4.3C21.04 2 22 2.96 22 4.15z"/> <path d="M14.95 6H9.12C7.78 6 6.7 7.08 6.7 8.42v11.16C6.7 20.92 7.78 22 9.12 22h1.63c.28 0 .5-.22.5-.5V19c0-.41.34-.75.75-.75s.75.34.75.75v2.5c0 .28.22.5.5.5h1.71c1.33 0 2.41-1.08 2.41-2.41V8.42c0-1.34-1.08-2.42-2.42-2.42zM14 14.75h-4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4c.41 0 .75.34.75.75s-.34.75-.75.75zm0-3h-4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4c.41 0 .75.34.75.75s-.34.75-.75.75z"/></svg>`
  },
  {
    id: 'chemicals',
    title: '<span class="title-line">Chemicals, Paper &</span><span class="title-line">Packaging</span>',
    subtitle: 'Specialty polymers, corrugated packaging & sustainable materials',
    image: 'assets/industry-8.jpg',
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M17.6 5.311l-5.65-3.04a2.02 2.02 0 00-1.91 0L4.4 5.311c-.41.23-.67.67-.67 1.15 0 .49.25.93.67 1.15l5.65 3.04a2 2 0 001.9 0l5.65-3.04c.41-.22.67-.66.67-1.15 0-.48-.26-.92-.67-1.15zM9.12 11.71L3.87 9.09A1.286 1.286 0 002 10.24v4.96c0 .86.48 1.63 1.25 2.02l5.25 2.62c.18.09.38.14.58.14.23 0 .47-.07.68-.19.38-.24.61-.65.61-1.1v-4.96c-.01-.86-.49-1.63-1.25-2.02zM20 10.24v2.46c-.48-.14-.99-.2-1.5-.2-1.36 0-2.69.47-3.74 1.31-1.44 1.13-2.26 2.84-2.26 4.69 0 .49.06.98.19 1.45-.15-.02-.3-.08-.44-.17-.38-.23-.61-.64-.61-1.09v-4.96c0-.86.48-1.63 1.24-2.02l5.25-2.62A1.286 1.286 0 0120 10.24z"/> <path d="M21.98 15.67a4.46 4.46 0 00-3.48-1.65c-1.06 0-2.04.37-2.81.99A4.448 4.448 0 0014 18.52 4.5 4.5 0 0015.66 22h.01c.77.64 1.76 1.02 2.83 1.02 1.14 0 2.17-.42 2.96-1.12A4.5 4.5 0 0023 18.52c0-1.08-.38-2.08-1.02-2.85zm-1.22 2.29l-2.4 2.22c-.14.13-.33.2-.51.2-.19 0-.38-.07-.53-.22l-1.11-1.11a.754.754 0 010-1.06c.29-.29.77-.29 1.06 0l.6.6 1.87-1.73c.3-.28.78-.26 1.06.04.29.31.27.78-.04 1.06z"/></svg>`
  },
  {
    id: 'logistics',
    title: '<span class="title-line">Logistics, Transport</span><span class="title-line">& Warehousing</span>',
    subtitle: 'Commercial freight fleets, multimodal hubs & fulfillment storage',
    image: 'assets/industry-9.jpg',
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M21.5 15.5c.28 0 .5.22.5.5v1c0 1.66-1.34 3-3 3 0-1.65-1.35-3-3-3s-3 1.35-3 3h-2c0-1.65-1.35-3-3-3s-3 1.35-3 3c-1.66 0-3-1.34-3-3v-2c0-.55.45-1 1-1h9.5a2.5 2.5 0 002.5-2.5V6c0-.55.45-1 1-1h.84c.72 0 1.38.39 1.74 1.01l.64 1.12c.09.16-.03.37-.22.37a2.5 2.5 0 00-2.5 2.5v3a2.5 2.5 0 002.5 2.5h2.5z"/> <path d="M8 22a2 2 0 100-4 2 2 0 000 4zM16 22a2 2 0 100-4 2 2 0 000 4zM22 12.53V14h-3c-.55 0-1-.45-1-1v-3c0-.55.45-1 1-1h1.29l1.45 2.54c.17.3.26.64.26.99zM13.08 2H5.69C3.65 2 2 3.65 2 5.69v6.38c0 .55.45 1 1 1h9.15c1.02 0 1.85-.83 1.85-1.85v-8.3c0-.51-.41-.92-.92-.92zm-3.01 5.07L7.98 9.09c-.15.14-.34.21-.52.21-.19 0-.38-.07-.52-.21l-1.01-.96a.758.758 0 01-.02-1.07c.28-.3.76-.3 1.06-.02l.49.47 1.57-1.52c.3-.29.77-.28 1.06.02.29.3.28.77-.02 1.06z"/></svg>`
  },
  {
    id: 'techservices',
    title: '<span class="title-line">IT & Professional</span><span class="title-line">Services</span>',
    subtitle: 'Enterprise software exports, digital consulting & engineering R&D',
    image: 'assets/industry-10.jpg',
    iconSvg: `<svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="M21 10H3c-.55 0-1 .45-1 1v5.19c0 .2.01.4.03.6.2 3.08 2.1 4.98 5.18 5.18.2.02.4.03.6.03h8.38c.2 0 .4-.01.6-.03 3.08-.2 4.98-2.1 5.18-5.18.02-.2.03-.4.03-.6V11c0-.55-.45-1-1-1zM8 16.15c.34.5.8.91 1.33 1.18.38.18.53.63.34 1.01-.13.26-.4.41-.67.41-.11 0-.23-.03-.33-.08-.78-.38-1.44-.97-1.91-1.68-.4-.6-.4-1.38 0-1.98.47-.71 1.13-1.3 1.91-1.68.37-.19.82-.04 1 .33.19.38.04.83-.34 1.01-.53.27-.99.68-1.33 1.18-.06.09-.06.21 0 .3zm9.45.84c-.48.71-1.14 1.3-1.91 1.68a.742.742 0 01-1-.33.745.745 0 01.33-1.01c.54-.27 1-.68 1.33-1.18a.24.24 0 000-.3c-.33-.5-.79-.91-1.33-1.18a.745.745 0 01-.33-1.01c.18-.37.63-.52 1-.33.77.38 1.43.97 1.91 1.68.4.6.4 1.38 0 1.98zM22 7.81V8c0 .55-.45 1-1 1L3 9.01c-.55 0-1-.45-1-1v-.2c0-.2.01-.4.03-.6.2-3.08 2.1-4.98 5.18-5.18.2-.02.4-.03.6-.03h8.38c.2 0 .4.01.6.03 3.08.2 4.98 2.1 5.18 5.18.02.2.03.4.03.6z"/></svg>`
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

function scrollToCalculator(e) {
  if (e) e.preventDefault();
  const calcSection = document.getElementById('calculator');
  if (calcSection) {
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.scrollTo(calcSection, { offset: -60, duration: 1.1 });
    } else {
      calcSection.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    window.location.href = 'index.html#calculator';
  }
}
window.scrollToCalculator = scrollToCalculator;

/* ------------------------------------------------------------
   Open Product Modal from Footer (Directly Opens Modal Without Scroll)
   ------------------------------------------------------------ */
function openProductFromFooter(e, key) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  openExploreStepsModal(key);
}

/* ------------------------------------------------------------
   Hero Section Question & Answer Rotator (Random Transition)
   Rotates randomly between distinct 2-line MSME financing questions
   ------------------------------------------------------------ */
function initHeroHeadlineRotator() {
  const slides = Array.from(document.querySelectorAll('.hero-h1-slide'));
  const descSlides = Array.from(document.querySelectorAll('.hero-p-slide'));
  if (slides.length <= 1) return;

  const displayDuration = 4500; // ms visible per question/answer pair

  function nextSlide() {
    let currentIdx = slides.findIndex(s => s.classList.contains('active'));
    if (currentIdx === -1) currentIdx = 0;

    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * slides.length);
    } while (nextIndex === currentIdx && slides.length > 1);

    const currentSlide = slides[currentIdx];
    const currentDesc = descSlides[currentIdx];

    currentSlide.classList.remove('active');
    currentSlide.classList.add('exiting');
    if (currentDesc) {
      currentDesc.classList.remove('active');
      currentDesc.classList.add('exiting');
    }

    setTimeout(() => {
      currentSlide.classList.remove('exiting');
      if (currentDesc) currentDesc.classList.remove('exiting');
    }, 650);

    const next = slides[nextIndex];
    const nextDesc = descSlides[nextIndex];

    next.classList.add('active');
    if (nextDesc) nextDesc.classList.add('active');
  }

  // Rotate smoothly on interval with random selection
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
      messageBox.value = `Eligibility Assessment Request:\n- Required Facility: ${amount}\n- Facility Type: ${currentCalcFacility}\n- Desired ROI: ${roi}\n- Expected Tenure: ${tenor} Days\n\nPlease check our eligibility and contact me with preliminary terms.`;
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

/* ------------------------------------------------------------
   Desktop Background Pipeline Flow Track (1 -> 2 -> 3 -> 4 -> 5 -> 6)
   ------------------------------------------------------------ */
function updatePipelineFlowTrack() {
  const wrap = document.querySelector('.pro-pipeline-wrap');
  const svg = document.querySelector('.pro-pipeline-flow-svg');
  if (!wrap || !svg) return;

  const c1 = wrap.querySelector('.pro-pipeline-card[data-step="1"]');
  const c2 = wrap.querySelector('.pro-pipeline-card[data-step="2"]');
  const c3 = wrap.querySelector('.pro-pipeline-card[data-step="3"]');
  const c4 = wrap.querySelector('.pro-pipeline-card[data-step="4"]');
  const c5 = wrap.querySelector('.pro-pipeline-card[data-step="5"]');
  const c6 = wrap.querySelector('.pro-pipeline-card[data-step="6"]');

  if (!c1 || !c2 || !c3 || !c4 || !c5 || !c6) return;

  const wrapRect = wrap.getBoundingClientRect();
  const getBox = (el) => {
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - wrapRect.left,
      y: r.top + r.height / 2 - wrapRect.top,
      left: r.left - wrapRect.left,
      right: r.right - wrapRect.left,
      top: r.top - wrapRect.top,
      bottom: r.bottom - wrapRect.top,
      width: r.width,
      height: r.height
    };
  };

  const p1 = getBox(c1);
  const p2 = getBox(c2);
  const p3 = getBox(c3);
  const p4 = getBox(c4);
  const p5 = getBox(c5);
  const p6 = getBox(c6);

  svg.setAttribute('width', wrapRect.width);
  svg.setAttribute('height', wrapRect.height);
  svg.setAttribute('viewBox', `0 0 ${wrapRect.width} ${wrapRect.height}`);

  const basePath = svg.querySelector('.pro-pipeline-flow-base');
  const flowPath = svg.querySelector('.pro-pipeline-flow-path');
  const arrowsGroup = svg.querySelector('.pro-pipeline-flow-arrows');

  // Mobile Single-Column Flow Line (1 -> 2 -> 3 -> 4 -> 5 -> 6)
  if (window.innerWidth <= 680) {
    svg.style.display = 'block';
    const cards = [c1, c2, c3, c4, c5, c6];
    const boxes = cards.map(getBox);
    const lineX = boxes[0].left + 50;
    const startY = boxes[0].top + 50;
    const endY = boxes[boxes.length - 1].bottom - 30;

    const d = `M ${lineX} ${startY} L ${lineX} ${endY}`;
    if (basePath) basePath.setAttribute('d', d);
    if (flowPath) flowPath.setAttribute('d', d);

    // Mobile: hide arrow icons, keep only the connection line
    if (arrowsGroup) {
      arrowsGroup.innerHTML = '';
    }
    return;
  }

  // Tablet: Hide complex serpentine on intermediate widths
  if (window.innerWidth <= 1024) {
    svg.style.display = 'none';
    return;
  }

  svg.style.display = 'block';

  const row1Y = p1.y;
  const row2Y = p4.y;
  const turnX = Math.min(wrapRect.width - 12, Math.max(p3.right + 26, p4.right + 26));
  const radius = Math.min(32, Math.abs(row2Y - row1Y) / 2);

  // Serpentine Path: 1 -> 2 -> 3 -> 4 -> 5 -> 6
  const d = `
    M ${p1.x} ${row1Y}
    L ${turnX - radius} ${row1Y}
    Q ${turnX} ${row1Y} ${turnX} ${row1Y + radius}
    L ${turnX} ${row2Y - radius}
    Q ${turnX} ${row2Y} ${turnX - radius} ${row2Y}
    L ${p6.x} ${row2Y}
  `.replace(/\s+/g, ' ').trim();

  if (basePath) basePath.setAttribute('d', d);
  if (flowPath) flowPath.setAttribute('d', d);

  // Directional Arrow Badges in each gap
  if (arrowsGroup) {
    const arrows = [
      // Gap 1 -> 2 (Right)
      { x: (p1.right + p2.left) / 2, y: row1Y, dir: 'right' },
      // Gap 2 -> 3 (Right)
      { x: (p2.right + p3.left) / 2, y: row1Y, dir: 'right' },
      // Right Curve Turn (Down from 3 to 4)
      { x: turnX, y: (row1Y + row2Y) / 2, dir: 'down' },
      // Gap 4 -> 5 (Left from 4 to 5)
      { x: (p4.left + p5.right) / 2, y: row2Y, dir: 'left' },
      // Gap 5 -> 6 (Left from 5 to 6)
      { x: (p5.left + p6.right) / 2, y: row2Y, dir: 'left' }
    ];

    arrowsGroup.innerHTML = arrows.map(a => {
      let icon = '';
      if (a.dir === 'right') {
        icon = `<path d="M ${a.x - 3} ${a.y - 4} L ${a.x + 3} ${a.y} L ${a.x - 3} ${a.y + 4}" stroke="#15803D" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (a.dir === 'down') {
        icon = `<path d="M ${a.x - 4} ${a.y - 3} L ${a.x} ${a.y + 3} L ${a.x + 4} ${a.y - 3}" stroke="#15803D" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (a.dir === 'left') {
        icon = `<path d="M ${a.x + 3} ${a.y - 4} L ${a.x - 3} ${a.y} L ${a.x + 3} ${a.y + 4}" stroke="#15803D" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      return `
        <g class="pro-pipeline-arrow-marker">
          <circle cx="${a.x}" cy="${a.y}" r="11" fill="#FFFFFF" stroke="#BBF7D0" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(5,36,79,0.06))"/>
          ${icon}
        </g>
      `;
    }).join('');
  }
}

let pipelineResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(pipelineResizeTimer);
  pipelineResizeTimer = setTimeout(updatePipelineFlowTrack, 80);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updatePipelineFlowTrack, 150);
  });
} else {
  setTimeout(updatePipelineFlowTrack, 150);
}
window.updatePipelineFlowTrack = updatePipelineFlowTrack;

/* ============================================================
   Desktop Halftone Side Rails Scroll Controller
   Starts at Section 2 (#products) and ends at last section with smooth blend
   ============================================================ */
function initDesktopSideRails() {
  const rails = document.querySelectorAll('.fixed-side-rail');
  const sec2 = document.getElementById('products');
  const footer = document.querySelector('.site-footer');
  if (!rails.length) return;

  function updateSideRails() {
    if (window.innerWidth < 1200) {
      rails.forEach(r => {
        r.classList.remove('visible');
        r.classList.add('rail-hidden');
      });
      return;
    }

    let isVisible = false;

    // Starts when user scrolls down to Section 2 (#products)
    if (sec2) {
      const sec2Rect = sec2.getBoundingClientRect();
      if (sec2Rect.top <= window.innerHeight * 0.75) {
        isVisible = true;
      }
    } else if (window.scrollY >= 500) {
      isVisible = true;
    }

    // Ends when reaching the footer after the last section
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.top <= window.innerHeight * 0.75) {
        isVisible = false;
      }
    }

    rails.forEach(r => {
      r.classList.toggle('visible', isVisible);
      r.classList.toggle('rail-hidden', !isVisible);
    });
  }

  window.addEventListener('scroll', updateSideRails, { passive: true });
  window.addEventListener('resize', updateSideRails, { passive: true });
  if (typeof lenis !== 'undefined' && lenis) {
    lenis.on('scroll', updateSideRails);
  }
  updateSideRails();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDesktopSideRails);
} else {
  initDesktopSideRails();
}
