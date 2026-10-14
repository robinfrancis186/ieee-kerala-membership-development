export const IEEE_DAY = {
  year: 2026,
  opens: "2026-10-04",
  closes: "2026-10-17",
  source: "https://ieeeday.org/special-activities-offers/",
  checkedOn: "2026-10-14"
};

export const ieeeDayOffers = [
  {
    id: "ieee",
    society: "IEEE Membership",
    deals: [{ audience: "professional", kind: "discount", headline: "US$30 offer", who: "Joining IEEE as a professional member for 2027", code: "IEEEDAY2630" }],
    note: "From the IEEE Day 2026 offers graphic. Not listed on the offers web page at last check."
  },
  {
    id: "sps",
    society: "IEEE Signal Processing Society",
    deals: [{ audience: "both", kind: "discount", headline: "50% off", who: "Professional or student joining for 2027", code: "IEEEDAY26SPS" }]
  },
  {
    id: "computer-society",
    society: "IEEE Computer Society",
    deals: [
      { audience: "student", kind: "free", headline: "Free", who: "Student membership for 2027", code: "CSIEEEDAYSTU26" },
      { audience: "professional", kind: "discount", headline: "50% off", who: "New professional membership for 2027", code: "CSIEEEDAY26" }
    ]
  },
  {
    id: "ims",
    society: "IEEE Instrumentation and Measurement Society",
    deals: [{ audience: "both", kind: "free", headline: "Free", who: "Professional or student joining for 2027", code: "IEEEDAY26IMS" }]
  },
  {
    id: "edsoc",
    society: "IEEE Education Society",
    deals: [
      { audience: "student", kind: "free", headline: "Free", who: "Student joining for 2027", code: "IEEEDAY26EDSOCS" },
      { audience: "professional", kind: "discount", headline: "50% off", who: "Professional joining for 2027", code: "IEEEDAY26EDSOC" }
    ],
    note: "The offers graphic shows only the professional code; the student code is from the offers web page."
  },
  {
    id: "comsoc",
    society: "IEEE Communications Society",
    deals: [
      { audience: "student", kind: "free", headline: "Free", who: "New student or graduate student membership for 2027, essential membership only", code: "IEEEDAYCOMSOC-S" },
      { audience: "professional", kind: "discount", headline: "50% off", who: "New professional membership for 2027", code: "IEEEDAYCOMSOC50" }
    ]
  },
  {
    id: "vts",
    society: "IEEE Vehicular Technology Society",
    deals: [{ audience: "both", kind: "free", headline: "Free", who: "New and reinstating Society members for 2027", code: "IEEEDAY26VTS" }]
  },
  {
    id: "pes",
    society: "IEEE Power & Energy Society",
    deals: [{ audience: "professional", kind: "discount", headline: "50% off", who: "Professional joining for 2027", code: "IEEEDAY26PES" }]
  },
  {
    id: "eds",
    society: "IEEE Electron Devices Society",
    deals: [{ audience: "both", kind: "free", headline: "Free", who: "Professional or student joining for 2027", code: "IEEEDAY2026EDS" }]
  },
  {
    id: "aps",
    society: "IEEE Antennas and Propagation Society",
    deals: [{ audience: "both", kind: "free", headline: "Free", who: "Professional or student joining for 2027", code: "IEEEDAY26AP" }]
  },
  {
    id: "bts",
    society: "IEEE Broadcast Technology Society",
    deals: [{ audience: "both", kind: "free", headline: "Free", who: "Professional or student joining for 2027, only for those joining IEEE", code: "IEEEDAY26BTS" }]
  },
  {
    id: "eps",
    society: "IEEE Electronics Packaging Society",
    deals: [{ audience: "both", kind: "free", headline: "Free", who: "Professional or student joining for 2027", code: "IEEEDAY26EPS" }]
  },
  {
    id: "grss",
    society: "IEEE Geoscience and Remote Sensing Society",
    deals: [{ audience: "both", kind: "discount", headline: "50% off", who: "Professional or student joining for 2027", code: "IEEEDAY26GRSS" }]
  },
  {
    id: "embs",
    society: "IEEE Engineering in Medicine & Biology Society",
    deals: [{ audience: "both", kind: "free", headline: "Free", who: "Professional or student joining for 2027, essential membership", code: "IEEEDAY26EMBS" }]
  },
  {
    id: "ssit",
    society: "IEEE Society on Social Implications of Technology",
    deals: [{ audience: "both", kind: "discount", headline: "50% off", who: "Professional or student joining for 2027", code: "IEEEDAY26SSIT" }]
  },
  {
    id: "its",
    society: "IEEE Information Theory Society",
    deals: [
      { audience: "student", kind: "free", headline: "Free", who: "Student joining for 2027, essential package only", code: "IEEEDAY26ITS-S" },
      { audience: "professional", kind: "discount", headline: "US$5", who: "Professional joining for 2027, essential package only", code: "IEEEDAY26ITS" }
    ],
    note: "The offers graphic lists US$5 for both grades; the offers web page lists student membership as free with its own code."
  },
  {
    id: "tems",
    society: "IEEE Technology and Engineering Management Society",
    deals: [
      { audience: "both", kind: "free", headline: "Free", who: "Professional or student joining for 2027", code: "IEEEDAY26TEMNEW" },
      { audience: "renewing", kind: "discount", headline: "50% off", who: "Renewing professional or student members for 2027", code: "IEEEDAY26TEM" }
    ]
  }
];

export function filterOffers(offers, filter = "all") {
  const matches = (deal) => (filter === "student-free" && deal.kind === "free" && ["student", "both"].includes(deal.audience))
    || (filter === "professional-free" && deal.kind === "free" && ["professional", "both"].includes(deal.audience))
    || (filter === "discount" && deal.kind === "discount");
  return filter === "all" ? offers : offers.filter((offer) => offer.deals.some(matches));
}

export function ieeeDayStatus(now = new Date(), { opens, closes } = IEEE_DAY) {
  const start = new Date(`${opens}T00:00:00`);
  const end = new Date(`${closes}T23:59:59`);
  if (now < start) return { state: "upcoming", daysLeft: null };
  if (now > end) return { state: "ended", daysLeft: 0 };
  return { state: "active", daysLeft: Math.ceil((end - now) / 86_400_000) };
}
