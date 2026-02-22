#!/usr/bin/env node
// slides-api.js — Google Slides manipulation helpers
const { google } = require("googleapis");
const { getAuth } = require("./auth");

async function createPresentation(title, folderId) {
  const auth = await getAuth();
  const slides = google.slides({ version: "v1", auth });
  const drive = google.drive({ version: "v3", auth });

  const res = await slides.presentations.create({ requestBody: { title } });
  const presentationId = res.data.presentationId;

  // Move to folder if specified
  if (folderId) {
    const file = await drive.files.get({ fileId: presentationId, fields: "parents" });
    const previousParents = (file.data.parents || []).join(",");
    await drive.files.update({
      fileId: presentationId,
      addParents: folderId,
      removeParents: previousParents,
      fields: "id, parents",
    });
  }

  return { presentationId, url: `https://docs.google.com/presentation/d/${presentationId}/edit` };
}

async function batchUpdate(presentationId, requests) {
  const auth = await getAuth();
  const slides = google.slides({ version: "v1", auth });
  return slides.presentations.batchUpdate({
    presentationId,
    requestBody: { requests },
  });
}

async function getPresentation(presentationId) {
  const auth = await getAuth();
  const slides = google.slides({ version: "v1", auth });
  return slides.presentations.get({ presentationId });
}

async function getThumbnail(presentationId, pageId) {
  const auth = await getAuth();
  const slides = google.slides({ version: "v1", auth });
  const res = await slides.presentations.pages.getThumbnail({
    presentationId,
    pageObjectId: pageId,
    "thumbnailProperties.mimeType": "PNG",
    "thumbnailProperties.thumbnailSize": "LARGE",
  });
  return res.data.contentUrl;
}

// Color helpers (0-1 range for API)
function rgb(r, g, b) {
  return { red: r / 255, green: g / 255, blue: b / 255 };
}

function emu(inches) {
  return Math.round(inches * 914400);
}

function pt(points) {
  return { magnitude: points, unit: "PT" };
}

// Slide builder helpers
function createSlideRequest(slideId, layoutId) {
  const req = { createSlide: { objectId: slideId } };
  if (layoutId) {
    req.createSlide.slideLayoutReference = { predefinedLayout: layoutId };
  }
  return req;
}

function createTextBox(slideId, boxId, text, x, y, width, height, opts = {}) {
  const requests = [];

  // Create shape
  requests.push({
    createShape: {
      objectId: boxId,
      shapeType: "TEXT_BOX",
      elementProperties: {
        pageObjectId: slideId,
        size: {
          width: { magnitude: emu(width), unit: "EMU" },
          height: { magnitude: emu(height), unit: "EMU" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: emu(x),
          translateY: emu(y),
          unit: "EMU",
        },
      },
    },
  });

  // Insert text
  if (text) {
    requests.push({
      insertText: { objectId: boxId, text, insertionIndex: 0 },
    });
  }

  // Style text
  if (opts.fontSize || opts.fontFamily || opts.color || opts.bold || opts.italic) {
    const style = {};
    const fields = [];
    if (opts.fontSize) {
      style.fontSize = pt(opts.fontSize);
      fields.push("fontSize");
    }
    if (opts.fontFamily) {
      style.fontFamily = opts.fontFamily;
      fields.push("fontFamily");
    }
    if (opts.color) {
      style.foregroundColor = { opaqueColor: { rgbColor: opts.color } };
      fields.push("foregroundColor");
    }
    if (opts.bold) {
      style.bold = true;
      fields.push("bold");
    }
    if (opts.italic) {
      style.italic = true;
      fields.push("italic");
    }

    requests.push({
      updateTextStyle: {
        objectId: boxId,
        style,
        textRange: { type: "ALL" },
        fields: fields.join(","),
      },
    });
  }

  // Paragraph alignment
  if (opts.alignment) {
    requests.push({
      updateParagraphStyle: {
        objectId: boxId,
        style: { alignment: opts.alignment },
        textRange: { type: "ALL" },
        fields: "alignment",
      },
    });
  }

  return requests;
}

function setSlideBackground(slideId, color) {
  return {
    updatePageProperties: {
      objectId: slideId,
      pageProperties: {
        pageBackgroundFill: {
          solidFill: { color: { rgbColor: color } },
        },
      },
      fields: "pageBackgroundFill.solidFill.color",
    },
  };
}

function createTable(slideId, tableId, rows, cols, x, y, width, height) {
  return {
    createTable: {
      objectId: tableId,
      rows,
      columns: cols,
      elementProperties: {
        pageObjectId: slideId,
        size: {
          width: { magnitude: emu(width), unit: "EMU" },
          height: { magnitude: emu(height), unit: "EMU" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: emu(x),
          translateY: emu(y),
          unit: "EMU",
        },
      },
    },
  };
}

function insertTableText(tableId, row, col, text) {
  return {
    insertText: {
      objectId: tableId,
      cellLocation: { rowIndex: row, columnIndex: col },
      text,
      insertionIndex: 0,
    },
  };
}

function insertImage(slideId, imageId, imageUrl, x, y, width, height) {
  return {
    createImage: {
      objectId: imageId,
      url: imageUrl,
      elementProperties: {
        pageObjectId: slideId,
        size: {
          width: { magnitude: emu(width), unit: "EMU" },
          height: { magnitude: emu(height), unit: "EMU" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: emu(x),
          translateY: emu(y),
          unit: "EMU",
        },
      },
    },
  };
}

module.exports = {
  createPresentation,
  batchUpdate,
  getPresentation,
  getThumbnail,
  rgb,
  emu,
  pt,
  createSlideRequest,
  createTextBox,
  setSlideBackground,
  createTable,
  insertTableText,
  insertImage,
};
