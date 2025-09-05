function calculate() {
  const dobInput = document.getElementById("dob").value;
  if (!dobInput) {
    alert("Please enter your date of birth");
    return;
  }

  const dob = new Date(dobInput);
  const day = dob.getDate();
  const month = dob.getMonth() + 1;
  const year = dob.getFullYear();

  // Driver (Psychic) number
  const driverCompound = reduceNumber(day);
  const driverSingle = reduceToSingleDigit(driverCompound);

  // Conductor (Destiny) number
  const conductorCompound = reduceNumber(day + month + year);
  const conductorSingle = reduceToSingleDigit(conductorCompound);

  // Lo Shu Grid
  const allDigits = (day.toString() + month.toString() + year.toString()).split("").map(Number);
  let grid = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  allDigits.forEach(d => { if (grid[d] !== undefined) grid[d]++; });
  const missing = Object.keys(grid).filter(num => grid[num] === 0);

  document.getElementById("result").innerHTML = `
    <h2 class="text-xl font-bold mt-4">Section 1: Core Numbers</h2>
    <p><strong>Driver:</strong> ${driverCompound} → ${driverSingle}</p>
    <p><strong>Conductor:</strong> ${conductorCompound} → ${conductorSingle}</p>
    <p><strong>Missing Numbers:</strong> ${missing.join(", ") || "None"}</p>
  `;

  showInterpretations(driverCompound, driverSingle, conductorCompound, conductorSingle);
}

function reduceNumber(num) {
  return num; // keep compound first, don’t reduce immediately
}

function reduceToSingleDigit(num) {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split("").reduce((a, b) => a + Number(b), 0);
  }
  return num;
}

async function loadMeanings() {
  const response = await fetch("meanings.json");
  return await response.json();
}

async function showInterpretations(driverCompound, driverSingle, conductorCompound, conductorSingle) {
  const meanings = await loadMeanings();
  let output = "";

  // Section 2: Driver
  output += `<h2 class="text-lg font-semibold mt-4">Section 2: Driver</h2>`;
  output += `<p>Compound: ${driverCompound} → Single: ${driverSingle}</p>`;
  if (meanings.compound[driverCompound]) {
    const c = meanings.compound[driverCompound];
    output += `<p><strong>Compound meaning (${driverCompound}):</strong> ${c.text}</p>`;
    if (c.type === "master") output += `<p><em>This is a Master number.</em></p>`;
    if (c.type === "karmic") output += `<p><em>This is a Karmic number.</em></p>`;
  }
  if (meanings.single[driverSingle]) {
    output += `<p><strong>Single meaning (${driverSingle}):</strong> ${meanings.single[driverSingle]}</p>`;
  }

  // Section 3: Conductor
  output += `<h2 class="text-lg font-semibold mt-4">Section 3: Conductor</h2>`;
  output += `<p>Compound: ${conductorCompound} → Single: ${conductorSingle}</p>`;
  if (meanings.compound[conductorCompound]) {
    const c = meanings.compound[conductorCompound];
    output += `<p><strong>Compound meaning (${conductorCompound}):</strong> ${c.text}</p>`;
    if (c.type === "master") output += `<p><em>This is a Master number.</em></p>`;
    if (c.type === "karmic") output += `<p><em>This is a Karmic number.</em></p>`;
  }
  if (meanings.single[conductorSingle]) {
    output += `<p><strong>Single meaning (${conductorSingle}):</strong> ${meanings.single[conductorSingle]}</p>`;
  }

  // Section 4: Combination
  const comboKey = `${driverSingle}-${conductorSingle}`;
  if (meanings.combination[comboKey]) {
    const combo = meanings.combination[comboKey];
    output += `<h2 class="text-lg font-semibold mt-4">Section 4: Combination</h2>`;
    output += `<p>Driver-Conductor: ${comboKey}</p>`;
    output += `<p>Stars: ${"★".repeat(combo.stars)}${"☆".repeat(5 - combo.stars)}</p>`;
    output += `<p>${combo.text}</p>`;
  }

  document.getElementById("result").innerHTML += output;
}