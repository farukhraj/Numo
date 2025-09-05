// ======= Utility Functions =======

// Reduction chain for a number (Cheiro method)
function getReductionChain(num) {
  let chain = [num];
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = num.toString().split("").reduce((a, b) => a + Number(b), 0);
    chain.push(num);
  }
  return chain; // e.g., [19, 10, 1]
}

// Reduce to single digit (final)
function reduceToSingleDigit(num) {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = num.toString().split("").reduce((a, b) => a + Number(b), 0);
  }
  return num;
}

// Element mapping (Chaldean/Chinese)
function getElement(num) {
  if ([1, 2].includes(num)) return "Wood";
  if ([3, 4].includes(num)) return "Fire";
  if ([5, 6].includes(num)) return "Earth";
  if ([7, 8].includes(num)) return "Metal";
  if (num === 9) return "Water";
  return "Unknown";
}

// Format date nicely
function formatDate(dob) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return dob.toLocaleDateString('en-US', options);
}

// Load meanings.json
async function loadMeanings() {
  const response = await fetch("meanings.json");
  return await response.json();
}

// Count repeating numbers and missing numbers
function analyzeDigits(digits) {
  let counts = {};
  for (let d of digits) counts[d] = (counts[d] || 0) + 1;
  let missing = [];
  for (let i = 1; i <= 9; i++) if (!counts[i]) missing.push(i);
  let repeating = Object.entries(counts).filter(([k,v]) => v > 1).map(([k,v]) => `${k} (${v}x)`);
  return { counts, missing, repeating };
}

// Placeholder for people names
function getPeopleNames(num, count = 10) {
  let names = [];
  for (let i = 1; i <= count; i++) names.push(`Person${i}`);
  return names.join(", ");
}

// ======= Main Calculation =======
async function calculate() {
  const dobInput = document.getElementById("dob").value;
  if (!dobInput) { alert("Please enter your date of birth"); return; }
  
  const dob = new Date(dobInput);
  const day = dob.getDate();
  const month = dob.getMonth() + 1;
  const year = dob.getFullYear();

  // All digits of DOB
  const digitsArray = (day.toString() + month.toString() + year.toString()).split("").map(Number);

  // ===== Core Numbers =====
  const driverChain = getReductionChain(day);
  const driverCompound = driverChain[0];
  const driverSingle = driverChain[driverChain.length - 1];

  const sumAllDigits = digitsArray.reduce((a,b)=>a+b,0);
  const conductorChain = getReductionChain(sumAllDigits);
  const conductorCompound = conductorChain[0];
  const conductorSingle = conductorChain[conductorChain.length-1];

  const { counts, missing, repeating } = analyzeDigits([...digitsArray, conductorSingle]);

  // ===== Other Important Numbers (AstroSeek-style placeholders) =====
  const kuaNumber = reduceToSingleDigit(driverSingle + conductorSingle);
  const sunSignNum = reduceToSingleDigit(conductorSingle);
  const moonSignNum = reduceToSingleDigit(day);
  const risingNum = reduceToSingleDigit(month);

  const meanings = await loadMeanings();

  // ===== HTML Output =====
  let html = "";

  // --- Birth Info ---
  html += `<p>${formatDate(dob)} is your birth day.</p>`;
  html += `<hr>`;
  
  // --- Core Numbers ---
  html += `<h2>Your Core Numbers</h2>`;
  html += `<p>${driverSingle} is your Psychic/Driver Number from ${driverChain.join(" → ")}</p>`;
  html += `<p>${conductorSingle} is your Destiny/Conductor Number from ${digitsArray.join("")} → ${conductorChain.join(" → ")}</p>`;
  html += `<p>You have digits: ${Object.keys(counts).join(", ")} (from core + conductor)</p>`;
  if (repeating.length > 0) html += `<p>Repeat Numbers: ${repeating.join(", ")}</p>`;
  html += `<p>Missing Numbers: ${missing.join(", ")}</p>`;

  // --- Other Important Numbers ---
  html += `<hr><h2>Other important numbers you have:</h2>`;
  html += `<p>${kuaNumber} as KUA/Angel number</p>`;
  html += `<p>${sunSignNum} from Sun Sign</p>`;
  html += `<p>${moonSignNum} from Moon Sign</p>`;
  html += `<p>${risingNum} from Rising Sun/Ascendant</p>`;
  html += `<p>Still, the Missing Numbers are: ${missing.join(", ")}</p>`;
  html += `<hr>`;

  // --- Driver / Psychic Section ---
  html += `<h2>${driverSingle} as Your Psychic/Driver Number</h2>`;
  html += `<p>Compound: ${driverCompound} → Single: ${driverSingle}</p>`;
  html += `<p>Element: ${getElement(driverSingle)}</p>`;
  html += `<p>Karmic: ${[13,14,16,19].includes(driverCompound) ? "Yes":"No"}, Master Number: ${[11,22,33].includes(driverCompound) ? "Yes":"No"}</p>`;
  
  html += `<p>Compound Number meaning (${driverCompound}): ${meanings.compound[driverCompound]?.text || "Not applicable"}</p>`;
  html += `<p>Karmic Number meaning (${driverCompound}): ${meanings.karmic[driverCompound]?.text || "Not applicable"}</p>`;
  html += `<p>Master Number meaning (${driverCompound}): ${meanings.master[driverCompound]?.text || "Not applicable"}</p>`;
  html += `<p>Single Number meaning (${driverSingle}): ${meanings.single[driverSingle] || "Not applicable"}</p>`;
  
  html += `<p>Weakness could be: (Derived from compound, master, karmic, single lessons)</p>`;
  html += `<p>Repeating (${counts[driverSingle] || 1}x) times Your Psychic/Driver Number exploit</p>`;
  html += `<p>People Born in ${driverCompound} are: ${getPeopleNames(driverCompound)}</p>`;
  html += `<hr>`;

  // --- Conductor / Destiny Section ---
  html += `<h2>${conductorSingle} as Your Destiny/Conductor Number</h2>`;
  html += `<p>${digitsArray.join("")} → Compound: ${conductorCompound} → Single: ${conductorSingle}</p>`;
  html += `<p>Element: ${getElement(conductorSingle)}</p>`;
  html += `<p>Karmic: ${[13,14,16,19].includes(conductorCompound) ? "Yes":"No"}, Master Number: ${[11,22,33].includes(conductorCompound) ? "Yes":"No"}</p>`;

  html += `<p>Compound Number meaning (${conductorCompound}): ${meanings.compound[conductorCompound]?.text || "Not applicable"}</p>`;
  html += `<p>Karmic Number meaning (${conductorCompound}): ${meanings.karmic[conductorCompound]?.text || "Not applicable"}</p>`;
  html += `<p>Master Number meaning (${conductorCompound}): ${meanings.master[conductorCompound]?.text || "Not applicable"}</p>`;
  html += `<p>Single Number meaning (${conductorSingle}): ${meanings.single[conductorSingle] || "Not applicable"}</p>`;

  html += `<p>Weakness could be: (Derived from compound, master, karmic, single lessons)</p>`;
  html += `<p>Repeating (${counts[conductorSingle] || 1}x) times Your Destiny/Conductor Number exploit</p>`;
  html += `<p>People have Destiny/Conductor in ${conductorCompound}/${conductorSingle} are: ${getPeopleNames(conductorCompound)}</p>`;
  
  document.getElementById("result").innerHTML = html;
}
