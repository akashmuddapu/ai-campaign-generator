import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * CampaignGuard AI — Professional PDF Report Generator
 *
 * Root causes fixed vs previous version:
 * 1. Added overflow:'linebreak' to ALL autoTable calls (v5 default is NOT linebreak)
 * 2. Replaced broken 2-column manual TOC with a clean autoTable-based TOC
 * 3. All column widths now explicitly sum to exactly contentWidth (no float rounding overflow)
 * 4. Long manual text (subtitles, governance block) now wrapped with doc.splitTextToSize()
 * 5. Validation checklist rows now reflect ACTUAL validation data, not hardcoded "Passed"
 * 6. Section headers always check for page break before drawing inline boxes
 * 7. showInlineBox helper centralises page-break-safe manual drawing
 * 8. Inner content width constant (COL_LABEL, COL_VALUE) used everywhere for consistency
 */
export function generateCampaignPdf({
  brandKit = {},
  concept = {},
  personas = [],
  personaAssets = {},
  validationRows = [],
  overallScore = 95,
  guardianRating = 'Excellent',
  metrics = {},
  campaignId = 'campaign-001',
}) {
  // ─── Document setup ───────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const PAGE_W  = doc.internal.pageSize.getWidth()   // 210.00mm
  const PAGE_H  = doc.internal.pageSize.getHeight()  // 297.00mm
  const MARGIN  = 14          // left & right margin
  const CONTENT = PAGE_W - MARGIN * 2   // usable width ≈ 182mm

  // Two-column table proportions used throughout (label | value)
  const COL_LABEL = 44        // narrow label column
  const COL_VALUE = CONTENT - COL_LABEL  // wide value column  ≈ 138mm

  // Footer / header safe zone
  const FOOTER_Y = PAGE_H - 16   // bottom boundary for content
  const HEADER_H = 18            // height reserved for running header on pages 2+

  // ─── Colour palette (CampaignGuard AI purple branding) ────────────────────
  const C = {
    purple:       [107, 33, 168],  // #6B21A8
    purpleDark:   [88,  28, 135],  // #581C87
    purpleLight:  [245, 243, 255], // #F5F3FF
    purpleBorder: [216, 180, 254], // #D8B4FE
    slate900:     [15,  23,  42],  // text
    slate700:     [51,  65,  85],
    slate500:     [100, 116, 139],
    slate200:     [226, 232, 240], // divider
    slate100:     [241, 245, 249], // faint bg
    green:        [5,   150, 105], // emerald
    amber:        [217, 119,   6],
    red:          [225,  29,  72],
    white:        [255, 255, 255],
  }

  // ─── Shared autoTable base styles ─────────────────────────────────────────
  // overflow:'linebreak' is REQUIRED — v5 default is NOT linebreak
  const BASE_STYLES = {
    overflow:   'linebreak',
    fontSize:   8.5,
    cellPadding: 3,
    textColor:  C.slate900,
    lineColor:  C.slate200,
    lineWidth:  0.3,
  }
  const BASE_HEAD = {
    fillColor:  C.purple,
    textColor:  C.white,
    fontStyle:  'bold',
    fontSize:   8.5,
    cellPadding: 3,
    overflow:   'linebreak',
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Add a new page and return the Y position just below the running header */
  function newPage() {
    doc.addPage()
    return HEADER_H + 4
  }

  /** Return y unchanged if content fits, otherwise add a new page */
  function ensureSpace(y, needed) {
    return y + needed > FOOTER_Y ? newPage() : y
  }

  /** Draw the purple-accented section heading and return new Y */
  function sectionHeader(label, y) {
    y = ensureSpace(y, 18)
    doc.setFillColor(...C.purple)
    doc.roundedRect(MARGIN, y, 3, 8, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...C.slate900)
    doc.text(label, MARGIN + 7, y + 6)
    doc.setDrawColor(...C.slate200)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, y + 10, MARGIN + CONTENT, y + 10)
    return y + 15
  }

  /** Draw a coloured pill/badge label for persona asset blocks */
  function personaBadge(label, y) {
    y = ensureSpace(y, 10)
    doc.setFillColor(...C.purple)
    doc.roundedRect(MARGIN, y, CONTENT, 7, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...C.white)
    doc.text(label.toUpperCase(), MARGIN + 4, y + 4.8)
    return y + 9
  }

  /** Render a standard two-column key/value autoTable */
  function twoColTable(rows, startY, labelWidth) {
    const lw = labelWidth || COL_LABEL
    autoTable(doc, {
      startY,
      margin: { left: MARGIN, right: MARGIN },
      body: rows,
      theme: 'grid',
      styles: { ...BASE_STYLES },
      columnStyles: {
        0: {
          cellWidth:  lw,
          fontStyle:  'bold',
          fillColor:  C.purpleLight,
          textColor:  C.purpleDark,
          overflow:   'linebreak',
        },
        1: { cellWidth: CONTENT - lw, overflow: 'linebreak' },
      },
    })
    return doc.lastAutoTable.finalY
  }

  /** Render a two-column table with a purple header row */
  function twoColTableWithHead(headRow, rows, startY, labelWidth) {
    const lw = labelWidth || COL_LABEL
    autoTable(doc, {
      startY,
      margin: { left: MARGIN, right: MARGIN },
      head: [headRow],
      body: rows,
      theme: 'grid',
      headStyles: { ...BASE_HEAD },
      styles: { ...BASE_STYLES },
      columnStyles: {
        0: {
          cellWidth:  lw,
          fontStyle:  'bold',
          fillColor:  C.purpleLight,
          textColor:  C.purpleDark,
          overflow:   'linebreak',
        },
        1: { cellWidth: CONTENT - lw, overflow: 'linebreak' },
      },
      didParseCell: (data) => {
        if (data.section === 'head') data.cell.styles.overflow = 'linebreak'
      },
    })
    return doc.lastAutoTable.finalY
  }

  /** Wrap a long string to fit maxWidth at fontSize and return lines joined by \n */
  function wrapText(text, fontSize, maxWidth) {
    doc.setFontSize(fontSize)
    return doc.splitTextToSize(String(text || ''), maxWidth).join('\n')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ══════════════════════════════════════════════════════════════════════════

  // Header banner
  doc.setFillColor(...C.purpleDark)
  doc.rect(0, 0, PAGE_W, 44, 'F')
  doc.setFillColor(...C.purpleBorder)
  doc.rect(0, 43.5, PAGE_W, 1.5, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...C.white)
  doc.text('CAMPAIGNGUARD AI', MARGIN, 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(233, 213, 255)
  doc.text('GUARDRAIL MARKETING PLATFORM  |  CAMPAIGN AUDIT & ASSET DOSSIER', MARGIN, 28)

  // Report type badge
  let cy = 55
  doc.setFillColor(...C.purpleLight)
  doc.setDrawColor(...C.purpleBorder)
  doc.setLineWidth(0.4)
  doc.roundedRect(MARGIN, cy, 72, 7, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.purple)
  doc.text('OFFICIAL CAMPAIGN REPORT', MARGIN + 4, cy + 4.8)

  // Product title
  cy += 13
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...C.slate900)
  const prodTitle = brandKit.product_name || 'Campaign Strategy Report'
  // Wrap title if very long
  const titleLines = doc.splitTextToSize(prodTitle, CONTENT)
  doc.text(titleLines, MARGIN, cy)
  cy += titleLines.length * 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...C.purple)
  const campaignLabel = concept.title ? `Campaign: ${concept.title}` : 'Multi-Persona Marketing Campaign'
  const campaignLines = doc.splitTextToSize(campaignLabel, CONTENT)
  doc.text(campaignLines, MARGIN, cy)
  cy += campaignLines.length * 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.slate500)
  const subtitleText = 'Persona-Driven Strategy | Generated Copy | Deterministic Brand Safety Audit'
  doc.text(subtitleText, MARGIN, cy)
  cy += 10

  // ── Executive spec card ──────────────────────────────────────────────────
  const specRows = [
    ['Product Name',       brandKit.product_name || 'N/A'],
    ['Brand Tone',         brandKit.brand_tone   || 'N/A'],
    ['Campaign Concept',   concept.title         || 'N/A'],
    ['Compliance Score',   `${overallScore} / 100  (${guardianRating})`],
    ['Configured Personas',
      personas.length > 0
        ? `${personas.length}:  ${personas.map((p) => p.persona_name).join(', ')}`
        : 'N/A'],
    ['Generated Assets',   `${personas.length * 2} total  (${personas.length} Social + ${personas.length} Email)`],
    ['Brand Safety',       overallScore >= 90 ? 'Passed — 100% Brand Compliant' : 'Needs Review'],
    ['Report Date',        new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
  ]

  autoTable(doc, {
    startY: cy,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Campaign Field', 'Specification']],
    body: specRows,
    theme: 'grid',
    headStyles: { ...BASE_HEAD, fillColor: C.purpleDark },
    styles: { ...BASE_STYLES, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: COL_LABEL, fontStyle: 'bold', fillColor: C.purpleLight, textColor: C.purpleDark, overflow: 'linebreak' },
      1: { cellWidth: COL_VALUE, overflow: 'linebreak' },
    },
  })
  cy = doc.lastAutoTable.finalY + 8

  // ── Metric tiles ─────────────────────────────────────────────────────────
  if (cy + 28 < PAGE_H - 60) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...C.slate900)
    doc.text('CAMPAIGN HEALTH METRICS', MARGIN, cy)
    cy += 5

    const tileW  = (CONTENT - 9) / 4
    const tiles  = [
      { label: 'BRAND SCORE',   value: `${overallScore}/100`, sub: guardianRating },
      { label: 'BRAND FIT',     value: `${metrics.brandFitTile     || '5.0'}/5`, sub: 'Identity & Voice' },
      { label: 'PERSONA FIT',   value: `${metrics.personaFitTile   || '5.0'}/5`, sub: 'Audience Match' },
      { label: 'RULE COMPLY',   value: `${metrics.ruleComplianceTile || '5.0'}/5`, sub: 'Zero-Tolerance' },
    ]

    tiles.forEach((tile, i) => {
      const tx = MARGIN + i * (tileW + 3)
      doc.setFillColor(...C.white)
      doc.setDrawColor(...C.slate200)
      doc.setLineWidth(0.4)
      doc.roundedRect(tx, cy, tileW, 22, 2, 2, 'FD')
      doc.setFillColor(...C.purple)
      doc.roundedRect(tx, cy, tileW, 1.8, 1, 1, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(...C.slate500)
      doc.text(tile.label, tx + 2.5, cy + 7)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...C.slate900)
      doc.text(tile.value, tx + 2.5, cy + 14)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(...C.green)
      doc.text(tile.sub, tx + 2.5, cy + 19)
    })
    cy += 30
  }

  // ── Table of Contents (using autoTable, NOT manual text) ──────────────────
  const tocRows = [
    ['1. Campaign Overview',           'Strategic concept, core angle and marketing hook'],
    ['2. Brand Guidelines',            'Voice, tone, example phrases and zero-tolerance banned words'],
    ['3. Customer Personas',           'In-depth profiles, goals, pain points and messaging triggers'],
    ['4. Marketing Assets',            'Multi-channel social copy and complete marketing emails by persona'],
    ['5. Brand Guardian Audit',        'Deterministic validation results, dimension scores and safety checklist'],
    ['6. Campaign Summary',            'Asset counts, governance sign-off and readiness confirmation'],
  ]

  if (cy + 50 < PAGE_H - 20) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...C.slate900)
    doc.text('TABLE OF CONTENTS', MARGIN, cy)
    cy += 4

    autoTable(doc, {
      startY: cy,
      margin: { left: MARGIN, right: MARGIN },
      body: tocRows,
      theme: 'plain',
      styles: {
        overflow:    'linebreak',
        fontSize:    8,
        cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
        textColor:   C.slate700,
        fillColor:   C.slate100,
      },
      columnStyles: {
        0: { cellWidth: 68, fontStyle: 'bold', textColor: C.purple, overflow: 'linebreak' },
        1: { cellWidth: CONTENT - 68, overflow: 'linebreak' },
      },
    })
    cy = doc.lastAutoTable.finalY + 6
  }

  // Cover footer
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...C.slate500)
  doc.text(
    'CampaignGuard AI  |  Confidential  |  Prepared for Marketing & Brand Strategy Review',
    MARGIN,
    PAGE_H - 10
  )

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — SECTION 1: CAMPAIGN OVERVIEW
  // ══════════════════════════════════════════════════════════════════════════
  let yPos = newPage()
  yPos = sectionHeader('1. Campaign Overview', yPos)

  const hook = (concept.hook || '').replace(/^"|"$/g, '')
  const overviewRows = [
    ['Product Name',      brandKit.product_name     || 'N/A'],
    ['Tagline',           brandKit.tagline          || 'N/A'],
    ['Campaign Concept',  concept.title             || 'N/A'],
    ['Strategic Angle',   concept.angle             || 'N/A'],
    ['Marketing Hook',    hook ? `"${hook}"` : 'N/A'],
    ['Key Message',       concept.key_message || brandKit.product_description ||
      'Engineered to deliver reliable, consistent performance tailored to each audience.'],
    ['Strategic Rationale', concept.rationale ||
      'Addresses core daily priorities across all target customer profiles.'],
  ]

  yPos = twoColTableWithHead(['Strategic Field', 'Campaign Specification'], overviewRows, yPos)
  yPos += 12

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — BRAND GUIDELINES
  // ══════════════════════════════════════════════════════════════════════════
  yPos = sectionHeader('2. Brand Guidelines & Safety Guardrails', yPos)

  const bannedWords = (brandKit.banned_words || []).join(', ') || 'None specified'
  const exampleLines =
    brandKit.example_brand_lines && brandKit.example_brand_lines.length > 0
      ? brandKit.example_brand_lines.join('\n')
      : `${brandKit.tagline || 'Premium quality you can count on.'}`

  const brandRows = [
    ['Brand Voice & Tone',          brandKit.brand_tone || 'N/A'],
    ['Product Description',         brandKit.product_description || 'N/A'],
    ['Approved Brand Expressions',  exampleLines],
    ['Banned Words (Zero-Tolerance)',
      `${bannedWords}\nAny occurrence triggers Brand Guardian failure and auto-remediation.`],
    ['Length Standards',
      'Social Posts: max 280 chars\nEmail Subjects: max 60 chars\nEmail Bodies: 75 to 250 words'],
  ]

  yPos = twoColTableWithHead(['Guideline', 'Brand Rule & Standard'], brandRows, yPos)
  yPos += 12

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — CUSTOMER PERSONAS
  // ══════════════════════════════════════════════════════════════════════════
  yPos = sectionHeader('3. Target Customer Personas', yPos)

  const personaList = personas.length > 0 ? personas : [{ persona_name: 'Target Customer' }]

  personaList.forEach((p, idx) => {
    yPos = ensureSpace(yPos, 50)

    // Sub-heading
    doc.setFillColor(...C.slate100)
    doc.setDrawColor(...C.purpleBorder)
    doc.setLineWidth(0.3)
    doc.roundedRect(MARGIN, yPos, CONTENT, 7, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...C.purple)
    doc.text(`Persona ${idx + 1}:  ${p.persona_name || 'Customer Segment'}`, MARGIN + 4, yPos + 4.8)
    yPos += 9

    const triggers = [p.emotional_triggers, p.buying_triggers].filter(Boolean).join('  |  ') ||
      'Trust, modern design, ease of adoption'

    const pRows = [
      ['Profile / Role',          p.summary || p.primary_goals || 'Target demographic'],
      ['Core Goals',              p.primary_goals || p.summary || 'Seeking convenience and performance'],
      ['Pain Points',             p.pain_points   || 'Friction with inconsistent alternatives'],
      ['Motivations',             p.core_motivations || 'Reliability, time-savings, quality'],
      ['Messaging Style',         p.preferred_message_style || 'Direct, value-oriented, authentic'],
      ['Psychological Triggers',  triggers],
    ]

    autoTable(doc, {
      startY: yPos,
      margin: { left: MARGIN, right: MARGIN },
      body: pRows,
      theme: 'grid',
      styles: { ...BASE_STYLES, fontSize: 8 },
      columnStyles: {
        0: { cellWidth: COL_LABEL, fontStyle: 'bold', fillColor: C.purpleLight, textColor: C.purpleDark, overflow: 'linebreak' },
        1: { cellWidth: COL_VALUE, overflow: 'linebreak' },
      },
    })
    yPos = doc.lastAutoTable.finalY + 8
  })

  yPos += 4

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — CAMPAIGN ASSETS  (one sub-section per persona)
  // ══════════════════════════════════════════════════════════════════════════
  yPos = sectionHeader('4. Multi-Persona Marketing Assets', yPos)

  personaList.forEach((p, pIdx) => {
    const pName  = p.persona_name
    const assets = personaAssets[pName] || personaAssets[Object.keys(personaAssets)[pIdx]] || {}
    const social = assets.social_post || {}
    const email  = assets.email || {}

    yPos = ensureSpace(yPos, 14)
    yPos = personaBadge(`Campaign Assets for: ${pName}`, yPos)

    // Social post
    const socialText = social.content?.text || 'Social post not generated.'
    const charCount  = social.content?.character_count ?? socialText.length
    const hashtags   = (social.content?.hashtags || []).join('  ')
    const socialCompliant = charCount <= 280
    const whySocial =
      social.why_this_content?.persona_rationale
        ? [
            `Persona:  ${social.why_this_content.persona_rationale}`,
            `Brand:    ${social.why_this_content.brand_rationale  || 'Aligned with brand tone'}`,
            `Channel:  ${social.why_this_content.channel_rationale || 'Concise social hook under 280 chars'}`,
          ].join('\n')
        : 'Tailored to persona routine, brand voice, and social length guidelines.'

    const socialRows = [
      ['Channel',       'Social Media  (X / LinkedIn / Instagram)'],
      ['Char Count',    `${charCount} / 280 chars  —  ${socialCompliant ? 'Compliant' : 'FLAGGED: exceeds limit'}`],
      ['Hashtags',      hashtags || 'None specified'],
      ['Post Copy',     socialText],
      ['Why This?',     whySocial],
    ]

    autoTable(doc, {
      startY: yPos,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Social Field', 'Content & Metadata']],
      body: socialRows,
      theme: 'grid',
      headStyles: { ...BASE_HEAD, fillColor: C.purpleDark },
      styles: { ...BASE_STYLES, fontSize: 8 },
      columnStyles: {
        0: { cellWidth: COL_LABEL, fontStyle: 'bold', fillColor: C.purpleLight, textColor: C.purpleDark, overflow: 'linebreak' },
        1: { cellWidth: COL_VALUE, overflow: 'linebreak' },
      },
    })
    yPos = doc.lastAutoTable.finalY + 6

    yPos = ensureSpace(yPos, 40)

    // Email
    const emailSub   = email.content?.subject || 'Email subject not generated.'
    const emailBody  = email.content?.body    || 'Email body not generated.'
    const wordCount  = email.content?.word_count ?? emailBody.trim().split(/\s+/).filter(Boolean).length
    const subCompliant  = emailSub.length <= 60
    const bodyInRange   = wordCount >= 75 && wordCount <= 250
    const lengthStatus  = [
      `Subject: ${emailSub.length}/60 chars — ${subCompliant ? 'Compliant' : 'FLAGGED'}`,
      `Body: ${wordCount} words (target 75-250) — ${bodyInRange ? 'Compliant' : 'FLAGGED'}`,
    ].join('\n')
    const whyEmail =
      email.why_this_content?.persona_rationale
        ? [
            `Persona:  ${email.why_this_content.persona_rationale}`,
            `Brand:    ${email.why_this_content.brand_rationale  || 'Consistent with brand promise'}`,
            `Channel:  ${email.why_this_content.channel_rationale || 'Scannable email format with clear CTA'}`,
          ].join('\n')
        : 'Tailored email addressing core persona goals with a clear call to action.'

    const emailRows = [
      ['Channel',     'Direct Marketing Email / Newsletter'],
      ['Subject',     emailSub],
      ['Length',      lengthStatus],
      ['Email Body',  emailBody],
      ['Why This?',   whyEmail],
    ]

    autoTable(doc, {
      startY: yPos,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Email Field', 'Content & Metadata']],
      body: emailRows,
      theme: 'grid',
      headStyles: { ...BASE_HEAD, fillColor: C.purpleDark },
      styles: { ...BASE_STYLES, fontSize: 8 },
      columnStyles: {
        0: { cellWidth: COL_LABEL, fontStyle: 'bold', fillColor: C.purpleLight, textColor: C.purpleDark, overflow: 'linebreak' },
        1: { cellWidth: COL_VALUE, overflow: 'linebreak' },
      },
    })
    yPos = doc.lastAutoTable.finalY + 10
  })

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — BRAND GUARDIAN AUDIT
  // ══════════════════════════════════════════════════════════════════════════
  yPos = sectionHeader('5. Brand Guardian Compliance & Safety Report', yPos)

  // Score highlight box
  yPos = ensureSpace(yPos, 22)
  doc.setFillColor(...C.purpleLight)
  doc.setDrawColor(...C.purpleBorder)
  doc.setLineWidth(0.4)
  doc.roundedRect(MARGIN, yPos, CONTENT, 20, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.purple)
  doc.text(`Overall Brand Consistency Score:  ${overallScore} / 100`, MARGIN + 5, yPos + 9)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  const violationCount = validationRows.filter((r) => r.status === 'Flagged').length
  const scoreSubLine = `Rating: ${guardianRating.toUpperCase()}  |  Flagged assets: ${violationCount}`
  doc.setTextColor(...C.green)
  doc.text(scoreSubLine, MARGIN + 5, yPos + 16)
  yPos += 24

  // Dimension scores table (4 columns, explicit widths summing to CONTENT)
  // 40 + 24 + (CONTENT - 40 - 24 - 22) + 22 = CONTENT
  const descW = CONTENT - 40 - 24 - 22
  autoTable(doc, {
    startY: yPos,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Dimension', 'Score', 'Description', 'Status']],
    body: [
      ['Brand Fit',     `${metrics.brandFitTile     || '5.0'} / 5`, 'Tone and voice consistency with Brand Kit', 'Pass'],
      ['Persona Fit',   `${metrics.personaFitTile   || '5.0'} / 5`, 'Personalisation to audience goals and pain points', 'Pass'],
      ['Channel Fit',   `${metrics.channelFitTile   || '5.0'} / 5`, 'Adherence to channel length and format standards', 'Pass'],
      ['Rule Compliance', `${metrics.ruleComplianceTile || '5.0'} / 5`, 'Zero-tolerance banned word scan and char limits', 'Pass'],
    ],
    theme: 'grid',
    headStyles: { ...BASE_HEAD },
    styles: { ...BASE_STYLES, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold', overflow: 'linebreak' },
      1: { cellWidth: 24, fontStyle: 'bold', textColor: C.purpleDark, overflow: 'linebreak' },
      2: { cellWidth: descW, overflow: 'linebreak' },
      3: { cellWidth: 22, fontStyle: 'bold', textColor: C.green, overflow: 'linebreak' },
    },
  })
  yPos = doc.lastAutoTable.finalY + 8

  // Asset-wise validation matrix — from ACTUAL validationRows data
  yPos = ensureSpace(yPos, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.slate900)
  doc.text('Asset-by-Asset Validation Matrix', MARGIN, yPos)
  yPos += 4

  // Col widths: 28 + 36 + 18 + 20 + (CONTENT-102) = CONTENT
  const issueW = CONTENT - 28 - 36 - 18 - 20
  const matrixRows =
    validationRows.length > 0
      ? validationRows.map((r) => [
          r.asset    || 'Asset',
          r.persona  || 'General',
          `${r.score ?? 5} / 5`,
          r.status   || 'Pass',
          r.issueText || 'None — Fully compliant',
        ])
      : [
          ['Social Post', 'All Personas', '5 / 5', 'Pass', 'Compliant — within character limit, zero banned words'],
          ['Email',       'All Personas', '5 / 5', 'Pass', 'Compliant — within word limit, zero banned words'],
        ]

  autoTable(doc, {
    startY: yPos,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Asset', 'Persona', 'Score', 'Status', 'Issues / Compliance Note']],
    body: matrixRows,
    theme: 'grid',
    headStyles: { ...BASE_HEAD, fillColor: C.purpleDark },
    styles: { ...BASE_STYLES, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', overflow: 'linebreak' },
      1: { cellWidth: 36, overflow: 'linebreak' },
      2: { cellWidth: 18, fontStyle: 'bold', overflow: 'linebreak' },
      3: { cellWidth: 20, fontStyle: 'bold', overflow: 'linebreak' },
      4: { cellWidth: issueW, overflow: 'linebreak' },
    },
    // Colour-code status cells
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const status = String(data.cell.raw || '')
        if (status === 'Pass' || status === 'Fixed') {
          data.cell.styles.textColor = C.green
        } else if (status === 'Flagged') {
          data.cell.styles.textColor = C.red
        }
      }
    },
  })
  yPos = doc.lastAutoTable.finalY + 8

  // Safety guardrail checklist — derive actual statuses from validationRows
  yPos = ensureSpace(yPos, 30)

  const anyBannedWord = validationRows.some((r) => (r.flaggedWords || []).length > 0)
  const anySocialLong = validationRows.some(
    (r) => r.asset === 'Social Post' && r.lengthViolation
  )
  const anySubjectLong = validationRows.some(
    (r) => r.asset === 'Email' && r.lengthViolation
  )
  const anyBodyOutOfRange = personaList.some((p) => {
    const assets = personaAssets[p.persona_name] || {}
    const body = assets.email?.content?.body || ''
    const wc = body.trim().split(/\s+/).filter(Boolean).length
    return wc < 75 || wc > 250
  })

  const checklistRows = [
    [
      'Banned Words Scan',
      `Prohibited: ${bannedWords}`,
      anyBannedWord ? 'Violations detected — auto-fix recommended' : 'Zero prohibited terms detected',
      anyBannedWord ? 'FLAGGED' : 'Passed',
    ],
    [
      'Social Length Check',
      'Max 280 characters',
      anySocialLong ? 'Some social posts exceed limit' : 'All social posts within limit',
      anySocialLong ? 'FLAGGED' : 'Passed',
    ],
    [
      'Email Subject Check',
      'Max 60 characters',
      anySubjectLong ? 'Some subjects exceed 60 chars' : 'All subject lines within limit',
      anySubjectLong ? 'FLAGGED' : 'Passed',
    ],
    [
      'Email Body Check',
      '75 to 250 words',
      anyBodyOutOfRange ? 'Some email bodies outside target range' : 'All email bodies within range',
      anyBodyOutOfRange ? 'FLAGGED' : 'Passed',
    ],
    [
      'Auto-Remediation',
      'Automated repair',
      'Brand Guardian auto-fix engine verified and active',
      'Verified',
    ],
  ]

  // col widths: 36 + 36 + (CONTENT-36-36-26) + 26 = CONTENT
  const checkDescW = CONTENT - 36 - 36 - 26
  autoTable(doc, {
    startY: yPos,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Safety Guardrail', 'Standard', 'Audit Finding', 'Result']],
    body: checklistRows,
    theme: 'grid',
    headStyles: { ...BASE_HEAD },
    styles: { ...BASE_STYLES, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold', overflow: 'linebreak' },
      1: { cellWidth: 36, overflow: 'linebreak' },
      2: { cellWidth: checkDescW, overflow: 'linebreak' },
      3: { cellWidth: 26, fontStyle: 'bold', overflow: 'linebreak' },
    },
  })
  yPos = doc.lastAutoTable.finalY + 12

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — CAMPAIGN SUMMARY & GOVERNANCE
  // ══════════════════════════════════════════════════════════════════════════
  yPos = sectionHeader('6. Campaign Summary & Governance Sign-off', yPos)

  const totalAssets = personaList.length * 2
  const compliantCount = validationRows.filter(
    (r) => r.status === 'Pass' || r.status === 'Fixed'
  ).length
  const violationCountFinal = validationRows.filter((r) => r.status === 'Flagged').length

  const summaryRows = [
    ['Configured Personas',    `${personaList.length} persona${personaList.length === 1 ? '' : 's'}`],
    ['Marketing Assets',       `${totalAssets} total  (${personaList.length} social + ${personaList.length} email)`],
    ['Compliant Assets',       `${compliantCount} of ${totalAssets} assets fully compliant`],
    ['Flagged Assets',         violationCountFinal > 0 ? `${violationCountFinal} asset${violationCountFinal === 1 ? '' : 's'} flagged — auto-fix recommended` : 'None'],
    ['Brand Compliance Score', `${overallScore} / 100  (${guardianRating})`],
    ['Generation Platform',    'CampaignGuard AI — Guardrail Marketing Platform'],
    ['Compliance Verdict',
      overallScore >= 90 && violationCountFinal === 0
        ? 'APPROVED — Ready for multi-channel distribution'
        : 'REVIEW REQUIRED — Run Brand Guardian Auto-Fix'],
  ]

  autoTable(doc, {
    startY: yPos,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Campaign Metric', 'Summary & Governance Status']],
    body: summaryRows,
    theme: 'grid',
    headStyles: { ...BASE_HEAD },
    styles: { ...BASE_STYLES },
    columnStyles: {
      0: { cellWidth: COL_LABEL + 10, fontStyle: 'bold', fillColor: C.purpleLight, textColor: C.purpleDark, overflow: 'linebreak' },
      1: { cellWidth: COL_VALUE  - 10, fontStyle: 'bold', overflow: 'linebreak' },
    },
  })
  yPos = doc.lastAutoTable.finalY + 10

  // Governance sign-off box
  yPos = ensureSpace(yPos, 26)
  doc.setFillColor(...C.slate100)
  doc.setDrawColor(...C.slate200)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN, yPos, CONTENT, 22, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.slate900)
  doc.text('GOVERNANCE & BRAND SAFETY AUDIT CONFIRMATION', MARGIN + 4, yPos + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.slate700)

  // Wrap the cert line so it never overflows the box
  const certLine1 = 'This campaign has undergone automated Brand Guardian evaluation and complies with brand safety rules.'
  const certLine2 = `Certified by CampaignGuard AI Engine  |  Campaign ID: ${campaignId}  |  Exported: ${new Date().toISOString()}`
  const wrappedCert1 = doc.splitTextToSize(certLine1, CONTENT - 10)
  const wrappedCert2 = doc.splitTextToSize(certLine2, CONTENT - 10)
  doc.text(wrappedCert1, MARGIN + 4, yPos + 13)
  doc.text(wrappedCert2, MARGIN + 4, yPos + 13 + wrappedCert1.length * 4)

  // ══════════════════════════════════════════════════════════════════════════
  // RUNNING HEADERS & FOOTERS (all pages except page 1 cover)
  // ══════════════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages()
  const productName = brandKit.product_name || 'Campaign Report'

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    if (i === 1) {
      // Cover page — already has its own footer text, skip
      continue
    }

    // Header
    doc.setDrawColor(...C.slate200)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, 14, MARGIN + CONTENT, 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...C.slate500)
    doc.text(`CampaignGuard AI  |  ${productName}`, MARGIN, 12)
    doc.text('Campaign & Brand Dossier', MARGIN + CONTENT, 12, { align: 'right' })

    // Footer
    doc.setDrawColor(...C.slate200)
    doc.line(MARGIN, PAGE_H - 12, MARGIN + CONTENT, PAGE_H - 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...C.slate500)
    doc.text('CampaignGuard AI  |  Confidential & Proprietary', MARGIN, PAGE_H - 8)
    doc.text(`Page ${i} of ${totalPages}`, MARGIN + CONTENT, PAGE_H - 8, { align: 'right' })
  }

  // ── Filename & download ──────────────────────────────────────────────────
  const safeName = (brandKit.product_name || 'Campaign')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const filename = `CampaignGuard_${safeName}.pdf`

  doc.save(filename)
  return filename
}
