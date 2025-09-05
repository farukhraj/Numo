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

  // Driver (Psychic) number = day reduced
  const driver = reduceToSingleDigit(day);

  // Conductor (Destiny) number = sum of all digits in full DOB
  const allDigits = (day.toString() + month.toString() + year.toString()).split("").map(Number);
  const conductor = reduceToSingleDigit(allDigits.reduce((a, b) => a + b, 0));

  // Lo Shu Grid (1–9 map)
  let grid = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  allDigits.forEach(d => { if (grid[d] !== undefined) grid[d]++; });

  const missing = Object.keys(grid).filter(num => grid[num] === 0);

  document.getElementById("result").innerHTML = `
    <p><strong>Driver (Psychic):</strong> ${driver}</p>
    <p><strong>Conductor (Destiny):</strong> ${conductor}</p>
    <p><strong>Missing Numbers:</strong> ${missing.join(", ") || "None"}</p>
  `;
}

function reduceToSingleDigit(num) {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split("").reduce((a, b) => a + Number(b), 0);
  }
  return num;
}
