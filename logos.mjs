export const logos = {
  ieee: { src: "/logos/ieee.png", name: "IEEE" },
  students: { src: "/logos/students.png", name: "IEEE Students" },
  "computer-society": { src: "/logos/computer-society.png", name: "IEEE Computer Society" },
  wie: { src: "/logos/wie.png", name: "IEEE Women in Engineering" },
  "region-10": { src: "/logos/region-10.png", name: "IEEE Region 10" },
  epics: { src: "/logos/epics.png", name: "EPICS in IEEE" },
  comsoc: { src: "/logos/comsoc.png", name: "IEEE Communications Society" },
  pes: { src: "/logos/pes.png", name: "IEEE Power & Energy Society" },
  sight: { src: "/logos/sight.png", name: "IEEE SIGHT" },
  humanitarian: { src: "/logos/humanitarian.png", name: "IEEE Humanitarian Technologies" },
  sps: { src: "/logos/sps.jpg", name: "IEEE Signal Processing Society" },
  embs: { src: "/logos/embs.png", name: "IEEE Engineering in Medicine & Biology Society" },
  smc: { src: "/logos/smc.png", name: "IEEE Systems, Man, and Cybernetics Society", dark: true },
  ias: { src: "/logos/ias.jpg", name: "IEEE Industry Applications Society" },
  aps: { src: "/logos/aps.svg", name: "IEEE Antennas and Propagation Society" },
  cas: { src: "/logos/cas.svg", name: "IEEE Circuits and Systems Society" },
  ras: { src: "/logos/ras.jpg", name: "IEEE Robotics and Automation Society" },
  edsoc: { src: "/logos/edsoc.png", name: "IEEE Education Society" },
  kerala: { src: "/logos/kerala.png", name: "IEEE Kerala Section" },
  yp: { src: "/logos/yp.png", name: "IEEE Young Professionals" },
  pels: { src: "/logos/pels.png", name: "IEEE Power Electronics Society" },
  htb: { src: "/logos/htb.png", name: "IEEE Humanitarian Technologies Board" },
  foundation: { src: "/logos/foundation.png", name: "IEEE Foundation" },
  ies: { src: "/logos/ies.png", name: "IEEE Industrial Electronics Society" },
  sensors: { src: "/logos/sensors.png", name: "IEEE Sensors Council" },
  mtts: { src: "/logos/mtts.jpg", name: "IEEE Microwave Theory and Technology Society" },
  grss: { src: "/logos/grss.png", name: "IEEE Geoscience and Remote Sensing Society" },
  eds: { src: "/logos/eds.jpg", name: "IEEE Electron Devices Society" },
  ims: { src: "/logos/ims.png", name: "IEEE Instrumentation and Measurement Society" },
  photonics: { src: "/logos/photonics.png", name: "IEEE Photonics Society", dark: true },
  lm: { src: "/logos/lm.png", name: "IEEE Life Members" },
  cis: { src: "/logos/cis.png", name: "IEEE Computational Intelligence Society" },
  bts: { src: "/logos/bts.png", name: "IEEE Broadcast Technology Society" },
  eps: { src: "/logos/eps.png", name: "IEEE Electronics Packaging Society" },
  ssit: { src: "/logos/ssit.png", name: "IEEE Society on Social Implications of Technology" },
  itsoc: { src: "/logos/itsoc.jpg", name: "IEEE Information Theory Society" },
  tems: { src: "/logos/tems.png", name: "IEEE Technology and Engineering Management Society", dark: true },
  css: { src: "/logos/css.jpg", name: "IEEE Control Systems Society" },
  deis: { src: "/logos/deis.png", name: "IEEE Dielectrics and Electrical Insulation Society" },
  rs: { src: "/logos/rs.jpg", name: "IEEE Reliability Society" },
  sscs: { src: "/logos/sscs.png", name: "IEEE Solid-State Circuits Society" },
  vts: { src: "/logos/vts.svg", name: "IEEE Vehicular Technology Society" },
  aess: { src: "/logos/aess.svg", name: "IEEE Aerospace and Electronic Systems Society" },
  sysc: { src: "/logos/sysc.svg", name: "IEEE Systems Council" }
};

const matchers = [
  [/computer society/i, "computer-society"],
  [/power electronics|\bpels\b/i, "pels"],
  [/women in engineering|\bwie\b/i, "wie"],
  [/region 10|\br10\b/i, "region-10"],
  [/epics/i, "epics"],
  [/communications society|comsoc/i, "comsoc"],
  [/power (&|and) energy|\bpes\b/i, "pes"],
  [/sight/i, "sight"],
  [/humanitarian technologies board|\bhtb\b/i, "htb"],
  [/humanitarian technolog/i, "humanitarian"],
  [/ieee foundation/i, "foundation"],
  [/signal processing|\bsps\b/i, "sps"],
  [/medicine (&|and) biology|\bembs\b/i, "embs"],
  [/systems, man|\bsmc\b/i, "smc"],
  [/industry applications|\bias\b/i, "ias"],
  [/antennas/i, "aps"],
  [/circuits and systems/i, "cas"],
  [/robotics and automation|\bras\b/i, "ras"],
  [/education society/i, "edsoc"],
  [/kerala section|ieee link/i, "kerala"],
  [/young professionals/i, "yp"],
  [/ieee students|\bmga\b/i, "students"],
  [/industrial electronics|\bies\b/i, "ies"],
  [/sensors council/i, "sensors"],
  [/microwave|\bmtt/i, "mtts"],
  [/geoscience|\bgrss\b/i, "grss"],
  [/electron devices|\beds\b/i, "eds"],
  [/instrumentation/i, "ims"],
  [/photonics/i, "photonics"],
  [/life members?\b/i, "lm"],
  [/computational intelligence|\bcis\b/i, "cis"],
  [/broadcast/i, "bts"],
  [/electronics packaging|\beps\b/i, "eps"],
  [/social implications|\bssit\b/i, "ssit"],
  [/information theory/i, "itsoc"],
  [/engineering management|\btems\b/i, "tems"],
  [/control systems/i, "css"],
  [/dielectrics/i, "deis"],
  [/reliability/i, "rs"],
  [/solid-state circuits|\bsscs\b/i, "sscs"],
  [/vehicular/i, "vts"],
  [/aerospace|\baess\b/i, "aess"],
  [/systems council/i, "sysc"],
  [/^ieee( membership)?$/i, "ieee"]
];

export function logoFor(text = "") {
  const match = matchers.find(([pattern]) => pattern.test(text));
  return match ? logos[match[1]] : null;
}

const abbreviations = {
  "IEEE Power Electronics Society": "PELS",
  "IEEE Microwave Theory and Technology Society": "MTT-S",
  "IEEE Information Theory Society": "ITSoc",
  "IEEE Sensors Council": "SC",
  "IEEE Systems Council": "SYSC",
  "Other IEEE programs": "IEEE"
};

export function abbreviationFor(name = "") {
  if (abbreviations[name]) return abbreviations[name];
  const words = name.replace(/^IEEE\s+/, "").split(/[\s,/-]+/).filter((word) => /^[A-Z]/.test(word));
  return words.length > 1 ? words.map((word) => word[0]).join("").slice(0, 5) : (words[0] || "IEEE").slice(0, 5);
}
