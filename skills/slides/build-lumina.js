#!/usr/bin/env node
const api = require("./slides-api");
const { google } = require("googleapis");
const { getAuth } = require("./auth");

const DARK = api.rgb(26, 26, 46); // #1A1A2E
const TEAL = api.rgb(15, 157, 157); // #0F9D9D
const CORAL = api.rgb(233, 69, 96); // #E94560
const LIGHT = api.rgb(245, 245, 245); // #F5F5F5
const WHITE = api.rgb(255, 255, 255);
const TEXT_DARK = api.rgb(45, 45, 45);
const SUBTLE = api.rgb(122, 122, 142); // #7A7A8E

// Lumina Drive folder
const FOLDER_ID = "1l4fxx6CslfIKScCZ-UkLygmk4tqN-i6H";

async function build() {
  console.log("Creating presentation...");
  const { presentationId, url } = await api.createPresentation(
    "LUMINA AI Platform — Proposal Deck",
    FOLDER_ID,
  );
  console.log("Created:", url);

  // Get default blank slide to delete later
  const pres = await api.getPresentation(presentationId);
  const defaultSlideId = pres.data.slides[0].objectId;

  const allRequests = [];

  // Helper to generate unique IDs
  let idCounter = 0;
  const uid = (prefix) => `${prefix}_${String(++idCounter).padStart(4, "0")}`;

  // ===================== SLIDE 1: Title =====================
  const s1 = uid("s");
  allRequests.push(api.createSlideRequest(s1, "BLANK"));
  allRequests.push(api.setSlideBackground(s1, DARK));
  // Teal accent line
  const s1Line = uid("line");
  allRequests.push({
    createShape: {
      objectId: s1Line,
      shapeType: "RECTANGLE",
      elementProperties: {
        pageObjectId: s1,
        size: {
          width: { magnitude: api.emu(3), unit: "EMU" },
          height: { magnitude: api.emu(0.04), unit: "EMU" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: api.emu(3.5),
          translateY: api.emu(2.5),
          unit: "EMU",
        },
      },
    },
  });
  allRequests.push({
    updateShapeProperties: {
      objectId: s1Line,
      shapeProperties: {
        shapeBackgroundFill: { solidFill: { color: { rgbColor: TEAL } } },
        outline: {
          outlineFill: { solidFill: { color: { rgbColor: TEAL } } },
          weight: { magnitude: 0.5, unit: "PT" },
        },
      },
      fields: "shapeBackgroundFill,outline",
    },
  });
  allRequests.push(
    ...api.createTextBox(s1, uid("tb"), "LUMINA AI Platform", 1, 1.2, 8, 1, {
      fontSize: 44,
      fontFamily: "Montserrat",
      bold: true,
      color: WHITE,
      alignment: "CENTER",
    }),
  );
  allRequests.push(
    ...api.createTextBox(s1, uid("tb"), "Intelligent Paid Media Co-Pilot", 1, 2.7, 8, 0.6, {
      fontSize: 22,
      fontFamily: "Open Sans",
      color: TEAL,
      alignment: "CENTER",
    }),
  );
  allRequests.push(
    ...api.createTextBox(
      s1,
      uid("tb"),
      "Prepared by Autom8ly  |  January 2026\nConfidential",
      1,
      4.2,
      8,
      0.8,
      { fontSize: 12, fontFamily: "Open Sans", color: SUBTLE, alignment: "CENTER" },
    ),
  );

  // ===================== SLIDE 2: The Opportunity =====================
  const s2 = uid("s");
  allRequests.push(api.createSlideRequest(s2, "BLANK"));
  allRequests.push(api.setSlideBackground(s2, DARK));
  allRequests.push(
    ...api.createTextBox(s2, uid("tb"), "The Challenge Facing Paid Media Teams", 0.5, 0.3, 9, 0.7, {
      fontSize: 28,
      fontFamily: "Montserrat",
      bold: true,
      color: WHITE,
      alignment: "CENTER",
    }),
  );
  // Three columns
  const cols2 = [
    {
      title: "⚡ Fragmentation",
      body: "Each platform presents data differently. Manual comparison wastes hours and misses cross-channel patterns.",
    },
    {
      title: "⏱️ Latency",
      body: "By the time underperformance is spotted, budget is already wasted. The notice → decide → edit cycle is too slow.",
    },
    {
      title: "🎯 Inconsistency",
      body: "Best practices exist but aren't applied uniformly. Attention splits across accounts, opportunities slip through.",
    },
  ];
  cols2.forEach((col, i) => {
    const x = 0.4 + i * 3.2;
    allRequests.push(
      ...api.createTextBox(s2, uid("tb"), col.title, x, 1.5, 2.8, 0.5, {
        fontSize: 20,
        fontFamily: "Montserrat",
        bold: true,
        color: CORAL,
        alignment: "CENTER",
      }),
    );
    allRequests.push(
      ...api.createTextBox(s2, uid("tb"), col.body, x, 2.2, 2.8, 2, {
        fontSize: 14,
        fontFamily: "Open Sans",
        color: api.rgb(200, 200, 210),
        alignment: "CENTER",
      }),
    );
  });

  // ===================== SLIDE 3: The Vision =====================
  const s3 = uid("s");
  allRequests.push(api.createSlideRequest(s3, "BLANK"));
  allRequests.push(api.setSlideBackground(s3, DARK));
  allRequests.push(
    ...api.createTextBox(s3, uid("tb"), "An AI Co-Pilot That Never Sleeps", 0.5, 0.5, 9, 0.7, {
      fontSize: 30,
      fontFamily: "Montserrat",
      bold: true,
      color: WHITE,
      alignment: "CENTER",
    }),
  );
  allRequests.push(
    ...api.createTextBox(
      s3,
      uid("tb"),
      "Observes  →  Understands  →  Recommends  →  Executes  →  Reports  →  Learns",
      0.3,
      2,
      9.4,
      0.7,
      { fontSize: 20, fontFamily: "Montserrat", bold: true, color: TEAL, alignment: "CENTER" },
    ),
  );
  allRequests.push(
    ...api.createTextBox(
      s3,
      uid("tb"),
      "LUMINA continuously monitors performance across all connected ad accounts,\nlearns each client's business context and goals, surfaces optimization\nopportunities with clear rationale, and improves over time.",
      1,
      3.2,
      8,
      1.5,
      { fontSize: 15, fontFamily: "Open Sans", color: api.rgb(200, 200, 210), alignment: "CENTER" },
    ),
  );

  // ===================== SLIDE 4: Crew8 Architecture =====================
  const s4 = uid("s");
  allRequests.push(api.createSlideRequest(s4, "BLANK"));
  allRequests.push(api.setSlideBackground(s4, LIGHT));
  allRequests.push(
    ...api.createTextBox(
      s4,
      uid("tb"),
      "Powered by Crew8 — Multi-Model AI Collaboration",
      0.5,
      0.3,
      9,
      0.6,
      { fontSize: 24, fontFamily: "Montserrat", bold: true, color: TEXT_DARK, alignment: "CENTER" },
    ),
  );

  // Architecture boxes
  const boxStyle = (id, label, x, y, w) => {
    const reqs = [];
    reqs.push({
      createShape: {
        objectId: id,
        shapeType: "ROUND_RECTANGLE",
        elementProperties: {
          pageObjectId: s4,
          size: {
            width: { magnitude: api.emu(w), unit: "EMU" },
            height: { magnitude: api.emu(0.65), unit: "EMU" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: api.emu(x),
            translateY: api.emu(y),
            unit: "EMU",
          },
        },
      },
    });
    reqs.push({
      updateShapeProperties: {
        objectId: id,
        shapeProperties: {
          shapeBackgroundFill: { solidFill: { color: { rgbColor: DARK } } },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: TEAL } } },
            weight: { magnitude: 2, unit: "PT" },
          },
        },
        fields: "shapeBackgroundFill,outline",
      },
    });
    reqs.push({ insertText: { objectId: id, text: label, insertionIndex: 0 } });
    reqs.push({
      updateTextStyle: {
        objectId: id,
        style: {
          fontSize: { magnitude: 12, unit: "PT" },
          fontFamily: "Montserrat",
          foregroundColor: { opaqueColor: { rgbColor: WHITE } },
          bold: true,
        },
        textRange: { type: "ALL" },
        fields: "fontSize,fontFamily,foregroundColor,bold",
      },
    });
    reqs.push({
      updateParagraphStyle: {
        objectId: id,
        style: { alignment: "CENTER" },
        textRange: { type: "ALL" },
        fields: "alignment",
      },
    });
    return reqs;
  };

  allRequests.push(...boxStyle(uid("box"), "Master Strategy Agent\n(Orchestration)", 3, 1.1, 4));
  allRequests.push(...boxStyle(uid("box"), "Platform Agents\n(Google / Meta)", 0.3, 2.5, 3));
  allRequests.push(...boxStyle(uid("box"), "Analytics Agent\n(Insights)", 3.5, 2.5, 3));
  allRequests.push(...boxStyle(uid("box"), "Creative Agent\n(Copy / Viz)", 6.7, 2.5, 3));
  allRequests.push(
    ...boxStyle(uid("box"), "Shared Context — Business Goals, Constraints, History", 1.5, 3.9, 7),
  );

  // Benefits
  allRequests.push(
    ...api.createTextBox(
      s4,
      uid("tb"),
      "✓ Multiple AI models validate every decision\n✓ Each agent specialized for its domain\n✓ Full transparency — every recommendation explained\n✓ New models integrated as they release",
      0.5,
      4.7,
      9,
      0.9,
      { fontSize: 11, fontFamily: "Open Sans", color: SUBTLE, alignment: "CENTER" },
    ),
  );

  // ===================== SLIDE 5: Core Capabilities =====================
  const s5 = uid("s");
  allRequests.push(api.createSlideRequest(s5, "BLANK"));
  allRequests.push(api.setSlideBackground(s5, LIGHT));
  allRequests.push(
    ...api.createTextBox(s5, uid("tb"), "What LUMINA Does", 0.5, 0.2, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );

  const caps = [
    [
      "📊 Data Ingestion",
      "OAuth connections to Google Ads & Meta.\nUnified data model. Real-time &\nscheduled sync.",
    ],
    [
      "🧠 Smart Recommendations",
      "Rule-based + AI pattern recognition.\nPrioritized action queue with\nimpact estimates.",
    ],
    [
      "⚙️ Automated Execution",
      "Human-approved change bundles.\nAuto-execute low-risk optimizations.\nFull rollback capability.",
    ],
    [
      "📈 Real-Time Reporting",
      "Performance dashboards. Automated\ninsight feeds. Client-ready\nreport generation.",
    ],
    [
      "🛡️ Search Term Guard",
      "AI-powered irrelevant term detection.\nSavings estimates. Bulk\nexclusion workflows.",
    ],
    [
      "💬 Conversational AI",
      'Natural language interaction.\nPlain-English summaries.\n"Lovable for paid media."',
    ],
  ];
  caps.forEach((cap, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 3.2;
    const y = 1.0 + row * 2.1;
    // Card background
    const cardId = uid("card");
    allRequests.push({
      createShape: {
        objectId: cardId,
        shapeType: "ROUND_RECTANGLE",
        elementProperties: {
          pageObjectId: s5,
          size: {
            width: { magnitude: api.emu(3), unit: "EMU" },
            height: { magnitude: api.emu(1.9), unit: "EMU" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: api.emu(x),
            translateY: api.emu(y),
            unit: "EMU",
          },
        },
      },
    });
    allRequests.push({
      updateShapeProperties: {
        objectId: cardId,
        shapeProperties: {
          shapeBackgroundFill: { solidFill: { color: { rgbColor: WHITE } } },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: api.rgb(220, 220, 230) } } },
            weight: { magnitude: 1, unit: "PT" },
          },
        },
        fields: "shapeBackgroundFill,outline",
      },
    });
    // Teal header strip
    const stripId = uid("strip");
    allRequests.push({
      createShape: {
        objectId: stripId,
        shapeType: "RECTANGLE",
        elementProperties: {
          pageObjectId: s5,
          size: {
            width: { magnitude: api.emu(3), unit: "EMU" },
            height: { magnitude: api.emu(0.05), unit: "EMU" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: api.emu(x),
            translateY: api.emu(y),
            unit: "EMU",
          },
        },
      },
    });
    allRequests.push({
      updateShapeProperties: {
        objectId: stripId,
        shapeProperties: {
          shapeBackgroundFill: { solidFill: { color: { rgbColor: TEAL } } },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: TEAL } } },
            weight: { magnitude: 0.5, unit: "PT" },
          },
        },
        fields: "shapeBackgroundFill,outline",
      },
    });
    allRequests.push(
      ...api.createTextBox(s5, uid("tb"), cap[0], x + 0.15, y + 0.15, 2.7, 0.4, {
        fontSize: 14,
        fontFamily: "Montserrat",
        bold: true,
        color: TEXT_DARK,
        alignment: "START",
      }),
    );
    allRequests.push(
      ...api.createTextBox(s5, uid("tb"), cap[1], x + 0.15, y + 0.6, 2.7, 1.2, {
        fontSize: 11,
        fontFamily: "Open Sans",
        color: SUBTLE,
        alignment: "START",
      }),
    );
  });

  // ===================== SLIDE 6: Business Model =====================
  const s6 = uid("s");
  allRequests.push(api.createSlideRequest(s6, "BLANK"));
  allRequests.push(api.setSlideBackground(s6, DARK));
  allRequests.push(
    ...api.createTextBox(s6, uid("tb"), "Built to Scale", 0.5, 0.3, 9, 0.7, {
      fontSize: 30,
      fontFamily: "Montserrat",
      bold: true,
      color: WHITE,
      alignment: "CENTER",
    }),
  );

  const stages = [
    ["Stage 1", "Agency Tool", "Pathfind with Strategy X clients", "Internal team"],
    ["Stage 2", "Agency SaaS", "License to other agencies", "Agency operators"],
    [
      "Stage 3",
      "Self-Serve Platform",
      "Direct access for business owners",
      "SMB owners, marketing directors",
    ],
  ];
  stages.forEach((st, i) => {
    const x = 0.5 + i * 3.2;
    const y = 1.5;
    const h = 2.2 + i * 0.3; // ascending height
    // Step box
    const stepId = uid("step");
    allRequests.push({
      createShape: {
        objectId: stepId,
        shapeType: "ROUND_RECTANGLE",
        elementProperties: {
          pageObjectId: s6,
          size: {
            width: { magnitude: api.emu(2.8), unit: "EMU" },
            height: { magnitude: api.emu(h), unit: "EMU" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: api.emu(x),
            translateY: api.emu(4.2 - h),
            unit: "EMU",
          },
        },
      },
    });
    const stageColor = api.rgb(15 + i * 30, 157 - i * 20, 157 - i * 20);
    allRequests.push({
      updateShapeProperties: {
        objectId: stepId,
        shapeProperties: {
          shapeBackgroundFill: { solidFill: { color: { rgbColor: stageColor } } },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: stageColor } } },
            weight: { magnitude: 0.5, unit: "PT" },
          },
        },
        fields: "shapeBackgroundFill,outline",
      },
    });

    allRequests.push(
      ...api.createTextBox(s6, uid("tb"), st[0], x + 0.1, 4.2 - h + 0.2, 2.6, 0.35, {
        fontSize: 12,
        fontFamily: "Montserrat",
        color: api.rgb(200, 230, 230),
        alignment: "CENTER",
      }),
    );
    allRequests.push(
      ...api.createTextBox(s6, uid("tb"), st[1], x + 0.1, 4.2 - h + 0.5, 2.6, 0.4, {
        fontSize: 18,
        fontFamily: "Montserrat",
        bold: true,
        color: WHITE,
        alignment: "CENTER",
      }),
    );
    allRequests.push(
      ...api.createTextBox(s6, uid("tb"), st[2], x + 0.1, 4.2 - h + 1.0, 2.6, 0.5, {
        fontSize: 11,
        fontFamily: "Open Sans",
        color: api.rgb(200, 220, 220),
        alignment: "CENTER",
      }),
    );
    allRequests.push(
      ...api.createTextBox(s6, uid("tb"), st[3], x + 0.1, 4.2 - h + 1.5, 2.6, 0.35, {
        fontSize: 10,
        fontFamily: "Open Sans",
        italic: true,
        color: SUBTLE,
        alignment: "CENTER",
      }),
    );
  });

  allRequests.push(
    ...api.createTextBox(
      s6,
      uid("tb"),
      "This proposal delivers a platform architected for Stage 3\nwhile providing immediate value at Stage 1.",
      1,
      4.5,
      8,
      0.8,
      {
        fontSize: 13,
        fontFamily: "Open Sans",
        italic: true,
        color: api.rgb(180, 180, 195),
        alignment: "CENTER",
      },
    ),
  );

  // ===================== SLIDE 7: Market Opportunity =====================
  const s7 = uid("s");
  allRequests.push(api.createSlideRequest(s7, "BLANK"));
  allRequests.push(api.setSlideBackground(s7, LIGHT));
  allRequests.push(
    ...api.createTextBox(s7, uid("tb"), "Why This Matters — Why Now", 0.5, 0.3, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );

  const points7 = [
    "AI capabilities have reached production-grade quality for media optimization",
    "Agencies struggle to scale human expertise across growing client bases",
    "Platform fragmentation is increasing, not decreasing",
    "First-mover advantage in AI-native media management is significant",
    "Aligned incentive model (managed service) ensures continuous improvement",
  ];
  points7.forEach((p, i) => {
    allRequests.push(
      ...api.createTextBox(s7, uid("tb"), "▸  " + p, 1, 1.3 + i * 0.75, 8, 0.6, {
        fontSize: 16,
        fontFamily: "Open Sans",
        color: TEXT_DARK,
        alignment: "START",
      }),
    );
  });

  // ===================== SLIDE 8: Tech Stack =====================
  const s8 = uid("s");
  allRequests.push(api.createSlideRequest(s8, "BLANK"));
  allRequests.push(api.setSlideBackground(s8, LIGHT));
  allRequests.push(
    ...api.createTextBox(s8, uid("tb"), "Technology Stack", 0.5, 0.2, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );

  // Table
  const t8 = uid("tbl");
  allRequests.push(api.createTable(s8, t8, 6, 3, 0.8, 1.0, 8.4, 2.5));
  const techRows = [
    ["Layer", "Technology", "Rationale"],
    ["Frontend", "React / Next.js", "Modern, fast, excellent ecosystem"],
    ["Backend", "Node.js / Python", "Flexible, strong API/ML support"],
    ["Database", "PostgreSQL + TimescaleDB", "Relational + time-series for metrics"],
    ["AI/ML", "OpenAI, Anthropic, Google", "Multi-model via Crew8"],
    ["Infrastructure", "AWS or GCP", "Scalable, compliant, global"],
  ];
  techRows.forEach((row, r) => {
    row.forEach((cell, c) => {
      allRequests.push(api.insertTableText(t8, r, c, cell));
    });
  });

  // AI-native callout
  const calloutId = uid("callout");
  allRequests.push({
    createShape: {
      objectId: calloutId,
      shapeType: "ROUND_RECTANGLE",
      elementProperties: {
        pageObjectId: s8,
        size: {
          width: { magnitude: api.emu(8.4), unit: "EMU" },
          height: { magnitude: api.emu(0.9), unit: "EMU" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: api.emu(0.8),
          translateY: api.emu(3.8),
          unit: "EMU",
        },
      },
    },
  });
  allRequests.push({
    updateShapeProperties: {
      objectId: calloutId,
      shapeProperties: {
        shapeBackgroundFill: { solidFill: { color: { rgbColor: DARK } } },
        outline: {
          outlineFill: { solidFill: { color: { rgbColor: TEAL } } },
          weight: { magnitude: 2, unit: "PT" },
        },
      },
      fields: "shapeBackgroundFill,outline",
    },
  });
  allRequests.push({
    insertText: {
      objectId: calloutId,
      text: "AI-Native Development:  3-5x code velocity  •  Real-time AI pair review  •  Auto-generated docs & tests",
      insertionIndex: 0,
    },
  });
  allRequests.push({
    updateTextStyle: {
      objectId: calloutId,
      style: {
        fontSize: { magnitude: 14, unit: "PT" },
        fontFamily: "Montserrat",
        foregroundColor: { opaqueColor: { rgbColor: TEAL } },
        bold: true,
      },
      textRange: { type: "ALL" },
      fields: "fontSize,fontFamily,foregroundColor,bold",
    },
  });
  allRequests.push({
    updateParagraphStyle: {
      objectId: calloutId,
      style: { alignment: "CENTER" },
      textRange: { type: "ALL" },
      fields: "alignment",
    },
  });

  // ===================== SLIDE 9: Scope of Work =====================
  const s9 = uid("s");
  allRequests.push(api.createSlideRequest(s9, "BLANK"));
  allRequests.push(api.setSlideBackground(s9, LIGHT));
  allRequests.push(
    ...api.createTextBox(s9, uid("tb"), "Development Phases", 0.5, 0.2, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );

  const phases = [
    ["Phase 0", "Discovery & Architecture", "2 weeks"],
    ["Phase 1", "Foundation & Infrastructure", "3 weeks"],
    ["Phase 2", "Ad Platform Integrations", "4 weeks"],
    ["Phase 3", "Core Platform Development", "4 weeks"],
    ["Phase 4", "AI Layer & Automation", "3 weeks"],
    ["Phase 5", "Reporting & Integrations", "3 weeks"],
    ["Phase 6", "QA, UAT & Launch", "2 weeks"],
    ["Buffer", "Contingency", "1-3 weeks"],
  ];
  const maxWeeks = 4;
  phases.forEach((ph, i) => {
    const y = 1.0 + i * 0.52;
    const weeks = ph[2].match(/(\d+)/)[1];
    const barWidth = (parseInt(weeks) / maxWeeks) * 4;

    allRequests.push(
      ...api.createTextBox(s9, uid("tb"), ph[0], 0.5, y, 1.2, 0.4, {
        fontSize: 11,
        fontFamily: "Montserrat",
        bold: true,
        color: TEAL,
        alignment: "START",
      }),
    );
    allRequests.push(
      ...api.createTextBox(s9, uid("tb"), ph[1], 1.7, y, 3.5, 0.4, {
        fontSize: 12,
        fontFamily: "Open Sans",
        color: TEXT_DARK,
        alignment: "START",
      }),
    );

    // Progress bar
    const barId = uid("bar");
    allRequests.push({
      createShape: {
        objectId: barId,
        shapeType: "ROUND_RECTANGLE",
        elementProperties: {
          pageObjectId: s9,
          size: {
            width: { magnitude: api.emu(barWidth), unit: "EMU" },
            height: { magnitude: api.emu(0.3), unit: "EMU" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: api.emu(5.5),
            translateY: api.emu(y + 0.05),
            unit: "EMU",
          },
        },
      },
    });
    const opacity = 0.5 + (i / phases.length) * 0.5;
    allRequests.push({
      updateShapeProperties: {
        objectId: barId,
        shapeProperties: {
          shapeBackgroundFill: { solidFill: { color: { rgbColor: TEAL }, alpha: opacity } },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: TEAL } } },
            weight: { magnitude: 0.5, unit: "PT" },
          },
        },
        fields: "shapeBackgroundFill,outline",
      },
    });

    allRequests.push(
      ...api.createTextBox(s9, uid("tb"), ph[2], 5.5 + barWidth + 0.15, y, 1.5, 0.4, {
        fontSize: 10,
        fontFamily: "Open Sans",
        color: SUBTLE,
        alignment: "START",
      }),
    );
  });

  // ===================== SLIDE 10: Timeline =====================
  const s10 = uid("s");
  allRequests.push(api.createSlideRequest(s10, "BLANK"));
  allRequests.push(api.setSlideBackground(s10, LIGHT));
  allRequests.push(
    ...api.createTextBox(s10, uid("tb"), "18-20 Week Delivery Timeline", 0.5, 0.2, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );
  allRequests.push(
    ...api.createTextBox(s10, uid("tb"), "Target Start: Mid-Late March 2026", 0.5, 0.7, 9, 0.4, {
      fontSize: 13,
      fontFamily: "Open Sans",
      color: SUBTLE,
      alignment: "CENTER",
    }),
  );

  // Gantt bars
  const ganttPhases = [
    { name: "Discovery", start: 1, end: 2, color: api.rgb(15, 157, 157) },
    { name: "Infrastructure", start: 3, end: 5, color: api.rgb(20, 140, 140) },
    { name: "Integrations", start: 5, end: 8, color: api.rgb(25, 125, 125) },
    { name: "Core Platform", start: 8, end: 11, color: api.rgb(30, 110, 110) },
    { name: "AI Layer", start: 11, end: 13, color: api.rgb(35, 95, 95) },
    { name: "Reporting", start: 13, end: 15, color: api.rgb(40, 80, 80) },
    { name: "QA & Launch", start: 16, end: 18, color: api.rgb(233, 69, 96) },
  ];

  const ganttLeft = 0.8;
  const ganttWidth = 8.4;
  const weekWidth = ganttWidth / 20;

  // Week numbers
  for (let w = 1; w <= 20; w++) {
    allRequests.push(
      ...api.createTextBox(
        s10,
        uid("wk"),
        `${w}`,
        ganttLeft + (w - 0.5) * weekWidth - 0.1,
        1.2,
        0.4,
        0.3,
        { fontSize: 8, fontFamily: "Open Sans", color: SUBTLE, alignment: "CENTER" },
      ),
    );
  }

  ganttPhases.forEach((ph, i) => {
    const y = 1.6 + i * 0.48;
    const x = ganttLeft + (ph.start - 1) * weekWidth;
    const w = (ph.end - ph.start + 1) * weekWidth;

    const barId = uid("gbar");
    allRequests.push({
      createShape: {
        objectId: barId,
        shapeType: "ROUND_RECTANGLE",
        elementProperties: {
          pageObjectId: s10,
          size: {
            width: { magnitude: api.emu(w), unit: "EMU" },
            height: { magnitude: api.emu(0.35), unit: "EMU" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: api.emu(x),
            translateY: api.emu(y),
            unit: "EMU",
          },
        },
      },
    });
    allRequests.push({
      updateShapeProperties: {
        objectId: barId,
        shapeProperties: {
          shapeBackgroundFill: { solidFill: { color: { rgbColor: ph.color } } },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: ph.color } } },
            weight: { magnitude: 0.5, unit: "PT" },
          },
        },
        fields: "shapeBackgroundFill,outline",
      },
    });
    allRequests.push({ insertText: { objectId: barId, text: ph.name, insertionIndex: 0 } });
    allRequests.push({
      updateTextStyle: {
        objectId: barId,
        style: {
          fontSize: { magnitude: 9, unit: "PT" },
          fontFamily: "Montserrat",
          foregroundColor: { opaqueColor: { rgbColor: WHITE } },
          bold: true,
        },
        textRange: { type: "ALL" },
        fields: "fontSize,fontFamily,foregroundColor,bold",
      },
    });
    allRequests.push({
      updateParagraphStyle: {
        objectId: barId,
        style: { alignment: "CENTER" },
        textRange: { type: "ALL" },
        fields: "alignment",
      },
    });
  });

  // Milestones
  const milestones = [
    { week: 2, label: "M1: Kickoff" },
    { week: 8, label: "M3: Data Flowing" },
    { week: 11, label: "M4: MVP Functional" },
    { week: 18, label: "M7: Launch 🚀" },
  ];
  milestones.forEach((ms) => {
    const x = ganttLeft + (ms.week - 0.5) * weekWidth;
    allRequests.push(
      ...api.createTextBox(s10, uid("ms"), "◆", x - 0.1, 4.7, 0.3, 0.3, {
        fontSize: 14,
        fontFamily: "Open Sans",
        color: CORAL,
        alignment: "CENTER",
      }),
    );
    allRequests.push(
      ...api.createTextBox(s10, uid("ms"), ms.label, x - 0.6, 5.0, 1.5, 0.4, {
        fontSize: 8,
        fontFamily: "Open Sans",
        bold: true,
        color: TEXT_DARK,
        alignment: "CENTER",
      }),
    );
  });

  // Submit first batch (API limit ~100 requests)
  console.log(`Submitting batch 1 (${allRequests.length} requests)...`);
  await api.batchUpdate(presentationId, allRequests);
  console.log("Batch 1 done");

  // ===================== BATCH 2 =====================
  const batch2 = [];

  // ===================== SLIDE 11: Investment =====================
  const s11 = uid("s");
  batch2.push(api.createSlideRequest(s11, "BLANK"));
  batch2.push(api.setSlideBackground(s11, DARK));
  batch2.push(
    ...api.createTextBox(s11, uid("tb"), "Investment", 0.5, 0.3, 9, 0.6, {
      fontSize: 30,
      fontFamily: "Montserrat",
      bold: true,
      color: WHITE,
      alignment: "CENTER",
    }),
  );
  batch2.push(
    ...api.createTextBox(s11, uid("tb"), "$250K – $285K", 1, 1.5, 8, 1, {
      fontSize: 52,
      fontFamily: "Montserrat",
      bold: true,
      color: CORAL,
      alignment: "CENTER",
    }),
  );
  batch2.push(
    ...api.createTextBox(s11, uid("tb"), "One-Time Development Investment", 1, 2.5, 8, 0.5, {
      fontSize: 16,
      fontFamily: "Open Sans",
      color: api.rgb(180, 180, 195),
      alignment: "CENTER",
    }),
  );
  batch2.push(
    ...api.createTextBox(s11, uid("tb"), "2.5% of Managed Ad Spend", 1, 3.3, 8, 0.8, {
      fontSize: 36,
      fontFamily: "Montserrat",
      bold: true,
      color: TEAL,
      alignment: "CENTER",
    }),
  );
  batch2.push(
    ...api.createTextBox(
      s11,
      uid("tb"),
      "Monthly Service Fee ($10K/month minimum)",
      1,
      4.1,
      8,
      0.5,
      { fontSize: 16, fontFamily: "Open Sans", color: api.rgb(180, 180, 195), alignment: "CENTER" },
    ),
  );
  batch2.push(
    ...api.createTextBox(
      s11,
      uid("tb"),
      "Infrastructure and AI API costs included in managed service fees.",
      1,
      4.8,
      8,
      0.4,
      { fontSize: 11, fontFamily: "Open Sans", italic: true, color: SUBTLE, alignment: "CENTER" },
    ),
  );

  // ===================== SLIDE 12: Payment Schedule =====================
  const s12 = uid("s");
  batch2.push(api.createSlideRequest(s12, "BLANK"));
  batch2.push(api.setSlideBackground(s12, LIGHT));
  batch2.push(
    ...api.createTextBox(s12, uid("tb"), "Milestone-Based Payment Schedule", 0.5, 0.2, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );
  batch2.push(
    ...api.createTextBox(s12, uid("tb"), "Based on $265K midpoint estimate", 0.5, 0.7, 9, 0.4, {
      fontSize: 13,
      fontFamily: "Open Sans",
      color: SUBTLE,
      alignment: "CENTER",
    }),
  );

  const t12 = uid("tbl");
  batch2.push(api.createTable(s12, t12, 7, 3, 1.5, 1.2, 7, 3.2));
  const payRows = [
    ["Milestone", "%", "Amount"],
    ["Contract Signature", "30%", "$79,500"],
    ["Infrastructure Ready", "20%", "$53,000"],
    ["Core MVP Functional", "25%", "$66,250"],
    ["Feature Complete", "15%", "$39,750"],
    ["Production Launch", "10%", "$26,500"],
    ["Total", "100%", "$265,000"],
  ];
  payRows.forEach((row, r) => {
    row.forEach((cell, c) => {
      batch2.push(api.insertTableText(t12, r, c, cell));
    });
  });

  batch2.push(
    ...api.createTextBox(
      s12,
      uid("tb"),
      "Final development amount ($250K–$285K) determined based on confirmed scope and integrations.",
      1,
      4.6,
      8,
      0.4,
      { fontSize: 10, fontFamily: "Open Sans", italic: true, color: SUBTLE, alignment: "CENTER" },
    ),
  );

  // ===================== SLIDE 13: Year 1 Economics =====================
  const s13 = uid("s");
  batch2.push(api.createSlideRequest(s13, "BLANK"));
  batch2.push(api.setSlideBackground(s13, LIGHT));
  batch2.push(
    ...api.createTextBox(s13, uid("tb"), "Example Economics — Year 1", 0.5, 0.2, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );
  batch2.push(
    ...api.createTextBox(
      s13,
      uid("tb"),
      "Scenario: $6M Annual Managed Ad Spend ($500K/month)",
      0.5,
      0.8,
      9,
      0.4,
      { fontSize: 14, fontFamily: "Open Sans", color: SUBTLE, alignment: "CENTER" },
    ),
  );

  const econItems = [
    ["Development (one-time)", "$265,000"],
    ["Monthly Service Fees ($12,500 × 12)", "$150,000"],
  ];
  econItems.forEach((item, i) => {
    const y = 1.6 + i * 0.7;
    batch2.push(
      ...api.createTextBox(s13, uid("tb"), item[0], 2, y, 4, 0.5, {
        fontSize: 16,
        fontFamily: "Open Sans",
        color: TEXT_DARK,
        alignment: "START",
      }),
    );
    batch2.push(
      ...api.createTextBox(s13, uid("tb"), item[1], 6.5, y, 2, 0.5, {
        fontSize: 16,
        fontFamily: "Montserrat",
        bold: true,
        color: TEXT_DARK,
        alignment: "END",
      }),
    );
  });

  // Total highlight box
  const totalBoxId = uid("totalbox");
  batch2.push({
    createShape: {
      objectId: totalBoxId,
      shapeType: "ROUND_RECTANGLE",
      elementProperties: {
        pageObjectId: s13,
        size: {
          width: { magnitude: api.emu(6.5), unit: "EMU" },
          height: { magnitude: api.emu(0.7), unit: "EMU" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: api.emu(2),
          translateY: api.emu(3.3),
          unit: "EMU",
        },
      },
    },
  });
  batch2.push({
    updateShapeProperties: {
      objectId: totalBoxId,
      shapeProperties: {
        shapeBackgroundFill: { solidFill: { color: { rgbColor: TEAL } } },
        outline: {
          outlineFill: { solidFill: { color: { rgbColor: TEAL } } },
          weight: { magnitude: 0.5, unit: "PT" },
        },
      },
      fields: "shapeBackgroundFill,outline",
    },
  });
  batch2.push({
    insertText: { objectId: totalBoxId, text: "Year 1 Total:  $415,000", insertionIndex: 0 },
  });
  batch2.push({
    updateTextStyle: {
      objectId: totalBoxId,
      style: {
        fontSize: { magnitude: 22, unit: "PT" },
        fontFamily: "Montserrat",
        foregroundColor: { opaqueColor: { rgbColor: WHITE } },
        bold: true,
      },
      textRange: { type: "ALL" },
      fields: "fontSize,fontFamily,foregroundColor,bold",
    },
  });
  batch2.push({
    updateParagraphStyle: {
      objectId: totalBoxId,
      style: { alignment: "CENTER" },
      textRange: { type: "ALL" },
      fields: "alignment",
    },
  });

  batch2.push(
    ...api.createTextBox(
      s13,
      uid("tb"),
      "At lower ad spend where 2.5% < $10K/month, the minimum fee applies: $120K annually.",
      1.5,
      4.3,
      7,
      0.4,
      { fontSize: 10, fontFamily: "Open Sans", italic: true, color: SUBTLE, alignment: "CENTER" },
    ),
  );

  // ===================== SLIDE 14: Engagement Model =====================
  const s14 = uid("s");
  batch2.push(api.createSlideRequest(s14, "BLANK"));
  batch2.push(api.setSlideBackground(s14, LIGHT));
  batch2.push(
    ...api.createTextBox(s14, uid("tb"), "Managed Service Partnership", 0.5, 0.2, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );

  // Left column
  batch2.push(
    ...api.createTextBox(s14, uid("tb"), "What We Do", 0.7, 1.0, 4, 0.5, {
      fontSize: 18,
      fontFamily: "Montserrat",
      bold: true,
      color: TEAL,
      alignment: "START",
    }),
  );
  const weDo = [
    "Develop, operate & maintain the platform",
    "24/7 monitoring and incident response",
    "Quarterly AI model updates & improvements",
    "Infrastructure scaling as you grow",
    "Priority feature requests",
  ];
  weDo.forEach((item, i) => {
    batch2.push(
      ...api.createTextBox(s14, uid("tb"), "▸  " + item, 0.7, 1.6 + i * 0.5, 4.3, 0.4, {
        fontSize: 13,
        fontFamily: "Open Sans",
        color: TEXT_DARK,
        alignment: "START",
      }),
    );
  });

  // Right column
  batch2.push(
    ...api.createTextBox(s14, uid("tb"), "What You Own", 5.3, 1.0, 4, 0.5, {
      fontSize: 18,
      fontFamily: "Montserrat",
      bold: true,
      color: TEAL,
      alignment: "START",
    }),
  );
  const youOwn = [
    "Business logic and client data",
    "Exclusive use in paid media domain",
    "All configurations & customizations",
    "Full audit trail & documentation",
  ];
  youOwn.forEach((item, i) => {
    batch2.push(
      ...api.createTextBox(s14, uid("tb"), "▸  " + item, 5.3, 1.6 + i * 0.5, 4.3, 0.4, {
        fontSize: 13,
        fontFamily: "Open Sans",
        color: TEXT_DARK,
        alignment: "START",
      }),
    );
  });

  batch2.push(
    ...api.createTextBox(
      s14,
      uid("tb"),
      "Aligned incentives — we succeed when you succeed.",
      1,
      4.5,
      8,
      0.5,
      { fontSize: 14, fontFamily: "Open Sans", italic: true, color: TEAL, alignment: "CENTER" },
    ),
  );

  console.log(`Submitting batch 2 (${batch2.length} requests)...`);
  await api.batchUpdate(presentationId, batch2);
  console.log("Batch 2 done");

  // ===================== BATCH 3 =====================
  const batch3 = [];

  // ===================== SLIDE 15: Team & Qualifications =====================
  const s15 = uid("s");
  batch3.push(api.createSlideRequest(s15, "BLANK"));
  batch3.push(api.setSlideBackground(s15, LIGHT));
  batch3.push(
    ...api.createTextBox(s15, uid("tb"), "Why Autom8ly", 0.5, 0.2, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );

  const quals = [
    [
      "🎮 EA CTO Experience",
      "Oversaw infrastructure during launches scaling to tens of millions of users. Built real-time systems handling billions of interactions.",
    ],
    [
      "🤖 Production AI Systems",
      "Deployed multi-model orchestration with <200ms latency. Built the Crew8 architecture powering LUMINA.",
    ],
    [
      "🏗️ Proven Platforms",
      "KnowledgeGenii, ComplianceGenii, and SalesGenii in production — battle-tested AI infrastructure.",
    ],
    [
      "⚡ AI-Native Development",
      "3-5x delivery speed vs. traditional methods. Real-time AI pair review. Auto-generated docs & tests.",
    ],
  ];
  quals.forEach((q, i) => {
    const y = 1.0 + i * 1.0;
    batch3.push(
      ...api.createTextBox(s15, uid("tb"), q[0], 0.7, y, 8.5, 0.4, {
        fontSize: 16,
        fontFamily: "Montserrat",
        bold: true,
        color: TEXT_DARK,
        alignment: "START",
      }),
    );
    batch3.push(
      ...api.createTextBox(s15, uid("tb"), q[1], 0.7, y + 0.4, 8.5, 0.5, {
        fontSize: 12,
        fontFamily: "Open Sans",
        color: SUBTLE,
        alignment: "START",
      }),
    );
  });

  batch3.push(
    ...api.createTextBox(
      s15,
      uid("tb"),
      "Team: Project Lead • Solutions Architect • Senior Full Stack • AI Developer • Integration Specialist • DevOps • QA",
      0.5,
      5.0,
      9,
      0.4,
      { fontSize: 10, fontFamily: "Open Sans", color: SUBTLE, alignment: "CENTER" },
    ),
  );

  // ===================== SLIDE 16: Integrations =====================
  const s16 = uid("s");
  batch3.push(api.createSlideRequest(s16, "BLANK"));
  batch3.push(api.setSlideBackground(s16, LIGHT));
  batch3.push(
    ...api.createTextBox(s16, uid("tb"), "Integration Roadmap", 0.5, 0.2, 9, 0.6, {
      fontSize: 26,
      fontFamily: "Montserrat",
      bold: true,
      color: TEXT_DARK,
      alignment: "CENTER",
    }),
  );

  // MVP column
  batch3.push(
    ...api.createTextBox(s16, uid("tb"), "MVP (Phase 1)", 0.7, 1.0, 4, 0.5, {
      fontSize: 18,
      fontFamily: "Montserrat",
      bold: true,
      color: TEAL,
      alignment: "START",
    }),
  );
  const mvpItems = [
    "✅  Google Ads",
    "✅  Meta Ads",
    "✅  Shopify",
    "✅  Google Analytics 4",
    "✅  HubSpot OR Salesforce",
  ];
  mvpItems.forEach((item, i) => {
    batch3.push(
      ...api.createTextBox(s16, uid("tb"), item, 0.7, 1.6 + i * 0.5, 4, 0.4, {
        fontSize: 14,
        fontFamily: "Open Sans",
        color: TEXT_DARK,
        alignment: "START",
      }),
    );
  });

  // Post-MVP column
  batch3.push(
    ...api.createTextBox(s16, uid("tb"), "Post-MVP Add-Ons", 5.3, 1.0, 4.5, 0.5, {
      fontSize: 18,
      fontFamily: "Montserrat",
      bold: true,
      color: TEAL,
      alignment: "START",
    }),
  );
  const addOns = [
    "➕  Microsoft + LinkedIn Ads — $35K",
    "➕  WooCommerce + Magento — $20K",
    "➕  Additional CRM — $12K",
    "➕  White-Label Package — $15K",
    "➕  Mobile App (iOS + Android) — $45K",
  ];
  addOns.forEach((item, i) => {
    batch3.push(
      ...api.createTextBox(s16, uid("tb"), item, 5.3, 1.6 + i * 0.5, 4.5, 0.4, {
        fontSize: 13,
        fontFamily: "Open Sans",
        color: TEXT_DARK,
        alignment: "START",
      }),
    );
  });

  // ===================== SLIDE 17: Next Steps =====================
  const s17 = uid("s");
  batch3.push(api.createSlideRequest(s17, "BLANK"));
  batch3.push(api.setSlideBackground(s17, DARK));
  batch3.push(
    ...api.createTextBox(s17, uid("tb"), "Next Steps", 0.5, 0.3, 9, 0.6, {
      fontSize: 30,
      fontFamily: "Montserrat",
      bold: true,
      color: WHITE,
      alignment: "CENTER",
    }),
  );

  const steps = [
    ["1", "Review & Questions", "Jan 30 – Feb 14"],
    ["2", "Scope Alignment & Contract", "Feb 17 – Mar 6"],
    ["3", "Contract Execution", "Mar 2 – 6"],
    ["4", "Project Kickoff", "Mar 16 – 27"],
  ];
  steps.forEach((step, i) => {
    const x = 0.5 + i * 2.4;
    // Circle number
    const circId = uid("circ");
    batch3.push({
      createShape: {
        objectId: circId,
        shapeType: "ELLIPSE",
        elementProperties: {
          pageObjectId: s17,
          size: {
            width: { magnitude: api.emu(0.6), unit: "EMU" },
            height: { magnitude: api.emu(0.6), unit: "EMU" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: api.emu(x + 0.8),
            translateY: api.emu(1.5),
            unit: "EMU",
          },
        },
      },
    });
    batch3.push({
      updateShapeProperties: {
        objectId: circId,
        shapeProperties: {
          shapeBackgroundFill: { solidFill: { color: { rgbColor: TEAL } } },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: TEAL } } },
            weight: { magnitude: 0.5, unit: "PT" },
          },
        },
        fields: "shapeBackgroundFill,outline",
      },
    });
    batch3.push({ insertText: { objectId: circId, text: step[0], insertionIndex: 0 } });
    batch3.push({
      updateTextStyle: {
        objectId: circId,
        style: {
          fontSize: { magnitude: 18, unit: "PT" },
          fontFamily: "Montserrat",
          foregroundColor: { opaqueColor: { rgbColor: WHITE } },
          bold: true,
        },
        textRange: { type: "ALL" },
        fields: "fontSize,fontFamily,foregroundColor,bold",
      },
    });
    batch3.push({
      updateParagraphStyle: {
        objectId: circId,
        style: { alignment: "CENTER" },
        textRange: { type: "ALL" },
        fields: "alignment",
      },
    });

    batch3.push(
      ...api.createTextBox(s17, uid("tb"), step[1], x, 2.3, 2.2, 0.6, {
        fontSize: 14,
        fontFamily: "Montserrat",
        bold: true,
        color: WHITE,
        alignment: "CENTER",
      }),
    );
    batch3.push(
      ...api.createTextBox(s17, uid("tb"), step[2], x, 3.0, 2.2, 0.4, {
        fontSize: 11,
        fontFamily: "Open Sans",
        color: SUBTLE,
        alignment: "CENTER",
      }),
    );
  });

  batch3.push(
    ...api.createTextBox(
      s17,
      uid("tb"),
      "This proposal is valid for 60 days from date of issue.",
      1,
      4.5,
      8,
      0.4,
      { fontSize: 11, fontFamily: "Open Sans", italic: true, color: SUBTLE, alignment: "CENTER" },
    ),
  );

  // ===================== SLIDE 18: Closing =====================
  const s18 = uid("s");
  batch3.push(api.createSlideRequest(s18, "BLANK"));
  batch3.push(api.setSlideBackground(s18, DARK));
  // Teal accent line
  const closeLine = uid("line");
  batch3.push({
    createShape: {
      objectId: closeLine,
      shapeType: "RECTANGLE",
      elementProperties: {
        pageObjectId: s18,
        size: {
          width: { magnitude: api.emu(3), unit: "EMU" },
          height: { magnitude: api.emu(0.04), unit: "EMU" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: api.emu(3.5),
          translateY: api.emu(2.9),
          unit: "EMU",
        },
      },
    },
  });
  batch3.push({
    updateShapeProperties: {
      objectId: closeLine,
      shapeProperties: {
        shapeBackgroundFill: { solidFill: { color: { rgbColor: TEAL } } },
        outline: {
          outlineFill: { solidFill: { color: { rgbColor: TEAL } } },
          weight: { magnitude: 0.5, unit: "PT" },
        },
      },
      fields: "shapeBackgroundFill,outline",
    },
  });

  batch3.push(
    ...api.createTextBox(s18, uid("tb"), "Let's Build the Future\nof Paid Media.", 1, 1.2, 8, 1.5, {
      fontSize: 36,
      fontFamily: "Montserrat",
      bold: true,
      color: WHITE,
      alignment: "CENTER",
    }),
  );
  batch3.push(
    ...api.createTextBox(s18, uid("tb"), "Autom8ly", 1, 3.2, 8, 0.6, {
      fontSize: 22,
      fontFamily: "Montserrat",
      color: TEAL,
      alignment: "CENTER",
    }),
  );
  batch3.push(
    ...api.createTextBox(
      s18,
      uid("tb"),
      "Mark Vange  —  mark@autom8ly.com\nautom8ly.com",
      1,
      3.9,
      8,
      0.8,
      { fontSize: 13, fontFamily: "Open Sans", color: api.rgb(180, 180, 195), alignment: "CENTER" },
    ),
  );
  batch3.push(
    ...api.createTextBox(
      s18,
      uid("tb"),
      "Confidential — Prepared for Lumina / Strategy X Digital",
      1,
      4.8,
      8,
      0.4,
      { fontSize: 10, fontFamily: "Open Sans", italic: true, color: SUBTLE, alignment: "CENTER" },
    ),
  );

  // Delete default blank slide
  batch3.push({ deleteObject: { objectId: defaultSlideId } });

  console.log(`Submitting batch 3 (${batch3.length} requests)...`);
  await api.batchUpdate(presentationId, batch3);
  console.log("Batch 3 done");

  // Share with Mark
  const auth = await getAuth();
  const drive = google.drive({ version: "v3", auth });
  await drive.permissions.create({
    fileId: presentationId,
    requestBody: { type: "user", role: "writer", emailAddress: "mark@autom8ly.com" },
  });
  console.log("Shared with mark@autom8ly.com");

  console.log("\n✅ DONE!");
  console.log("Presentation:", url);
  console.log("ID:", presentationId);
}

build().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
