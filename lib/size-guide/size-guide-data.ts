export interface SizeConversionRow {
  eu: string
  usM: string
  uk: string
  cm: string
}

export interface SizeMeasurementsRow {
  size: string
  chest?: string
  shoulder?: string
  sleeve?: string
  length?: string
  wristCircumference?: string
  recommendedSize?: string
}

export interface RingSizeRow {
  us: string
  eu: string
  diameter: string
}

export const SIZE_GUIDE = {
  sneakers: {
    conversionTable: [
      { eu: "36", usM: "4", uk: "3", cm: "23" },
      { eu: "37", usM: "4.5", uk: "3.5", cm: "23.5" },
      { eu: "38", usM: "5", uk: "4", cm: "24" },
      { eu: "39", usM: "6", uk: "5", cm: "24.5" },
      { eu: "40", usM: "7", uk: "6", cm: "25" },
      { eu: "41", usM: "8", uk: "7", cm: "26" },
      { eu: "42", usM: "9", uk: "8", cm: "27" },
      { eu: "43", usM: "10", uk: "9", cm: "27.5" },
      { eu: "44", usM: "11", uk: "10", cm: "28" },
      { eu: "45", usM: "12", uk: "11", cm: "29" },
      { eu: "46", usM: "13", uk: "12", cm: "29.5" },
      { eu: "47", usM: "14", uk: "13", cm: "30" },
    ] as SizeConversionRow[],
    fitNotes: [
      "If you're between sizes, we usually recommend sizing up.",
      "Wide feet: consider half size up where applicable.",
      "Check each product's 'Size & Fit' section for model-specific guidance.",
    ],
  },
  jackets: {
    measurementsTable: [
      { size: "S", chest: "96-100", shoulder: "44", sleeve: "62", length: "68" },
      { size: "M", chest: "100-104", shoulder: "46", sleeve: "63", length: "70" },
      { size: "L", chest: "104-108", shoulder: "48", sleeve: "64", length: "72" },
      { size: "XL", chest: "108-112", shoulder: "50", sleeve: "65", length: "74" },
      { size: "XXL", chest: "112-118", shoulder: "52", sleeve: "66", length: "76" },
    ] as SizeMeasurementsRow[],
    howToMeasure: [
      "Chest: measure around fullest part",
      "Shoulder: edge to edge",
      "Sleeve: shoulder to wrist",
      "Length: from top of shoulder to hem",
    ],
    fitNotes: ["Prefer oversized fit: size up.", "Prefer tailored fit: true to size."],
  },
  vests: {
    measurementsTable: [
      { size: "S", chest: "96-100", length: "66" },
      { size: "M", chest: "100-104", length: "68" },
      { size: "L", chest: "104-108", length: "70" },
      { size: "XL", chest: "108-112", length: "72" },
      { size: "XXL", chest: "112-118", length: "74" },
    ] as SizeMeasurementsRow[],
    fitNotes: ["Layering: size up if you plan to wear over thick hoodies."],
  },
  watches: {
    notes: [
      "Case size is measured in millimeters (mm) — typically ranges from 36mm to 44mm.",
      "Wrist size is measured in centimeters (cm) around the widest part of your wrist.",
      "Most watch bracelets can be adjusted. Contact support if you need guidance on sizing.",
    ],
  },
  jewelry: {
    rings: {
      table: [
        { us: "5", eu: "49", diameter: "15.7" },
        { us: "6", eu: "52", diameter: "16.5" },
        { us: "7", eu: "54", diameter: "17.3" },
        { us: "8", eu: "57", diameter: "18.2" },
        { us: "9", eu: "59", diameter: "19.0" },
        { us: "10", eu: "62", diameter: "19.8" },
        { us: "11", eu: "64", diameter: "20.6" },
      ] as RingSizeRow[],
      howToMeasure: [
        "Wrap a strip of paper around your finger.",
        "Mark where the paper overlaps.",
        "Measure the length in millimeters and compare to the diameter column above.",
      ],
    },
    bracelets: {
      table: [
        { wristCircumference: "14-16", recommendedSize: "S" },
        { wristCircumference: "16-18", recommendedSize: "M" },
        { wristCircumference: "18-20", recommendedSize: "L" },
      ] as SizeMeasurementsRow[],
      howToMeasure: [
        "Measure your wrist circumference with a soft tape.",
        "Add 1-2 cm for a comfortable fit.",
        "If between sizes, we recommend sizing up.",
      ],
    },
  },
  bags: {
    notes: [
      "Dimensions (width × height × depth) are listed on each product page.",
      "Fit examples: phone / wallet / small notebook (general).",
      "If you need exact fit for an item, contact us.",
    ],
  },
}
