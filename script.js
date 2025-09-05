// ======= Utility Functions =======

// Reduction chain (Cheiro)
function getReductionChain(num) {
    let chain = [num];
    while (num > 9 && ![11,22,33].includes(num)) {
        num = num.toString().split("").reduce((a,b)=>a+Number(b),0);
        chain.push(num);
    }
    return chain;
}

// Reduce to single digit
function reduceToSingleDigit(num) {
    while (num > 9 && ![11,22,33].includes(num)) {
        num = num.toString().split("").reduce((a,b)=>a+Number(b),0);
    }
    return num;
}

// Element mapping
function getElement(num) {
    if ([1,2].includes(num)) return "Wood";
    if ([3,4].includes(num)) return "Fire";
    if ([5,6].includes(num)) return "Earth";
    if ([7,8].includes(num)) return "Metal";
    if (num === 9) return "Water";
    return "Unknown";
}

// Format date
function formatDate(dob) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return dob.toLocaleDateString('en-US', options);
}

// Count repeating & missing numbers
function analyzeDigits(digits) {
    let counts = {};
    for (let d of digits) counts[d] = (counts[d] || 0) + 1;
    let missing = [];
    for (let i=1;i<=9;i++) if (!counts[i]) missing.push(i);
    let repeating = Object.entries(counts).filter(([k,v])=>v>1).map(([k,v])=>`${k} (${v}x)`);
    return { counts, missing, repeating };
}

// Placeholder for people names
function getPeopleNames(num,count=10) {
    let names = [];
    for(let i=1;i<=count;i++) names.push(`Person${i}`);
    return names.join(", ");
}

// Load meanings.json dynamically
async function loadMeanings() {
    const response = await fetch("meanings.json");
    return await response.json();
}

// ======= Main Calculation =======
async function calculate() {
    const dobInput = document.getElementById("dob").value;
    const timeInput = document.getElementById("time").value;
    const gender = document.getElementById("gender").value;
    const place = document.getElementById("place").value;

    if(!dobInput || !timeInput || !gender || !place) {
        alert("Please fill all fields");
        return;
    }

    const dob = new Date(dobInput);
    const [hours, minutes] = timeInput.split(":").map(Number);
    dob.setHours(hours, minutes);

    const day = dob.getDate();
    const month = dob.getMonth()+1;
    const year = dob.getFullYear();

    // All digits of DOB
    const digitsArray = (day.toString().padStart(2,'0') + month.toString().padStart(2,'0') + year.toString()).split("").map(Number);

    // Core Numbers
    const driverChain = getReductionChain(day);
    const driverCompound = driverChain[0];
    const driverSingle = driverChain[driverChain.length-1];

    const sumAllDigits = digitsArray.reduce((a,b)=>a+b,0);
    const conductorChain = getReductionChain(sumAllDigits);
    const conductorCompound = conductorChain[0];
    const conductorSingle = conductorChain[conductorChain.length-1];

    const { counts, missing, repeating } = analyzeDigits([...digitsArray, conductorSingle]);

    // Load meanings
    const meanings = await loadMeanings();

    // Build report
    let report = '';
    report += `${formatDate(dob)}, at ${timeInput} in ${place}, is your birth day.\n`;
    report += '_______________________________________________________________________________________\n\n';
    report += `Your Core Numbers\n`;
    report += `${driverSingle} is your Psychic/Driver Number from ${driverChain.join(' → ')}\n`;
    report += `${conductorSingle} is your Destiny/Conductor Number from ${digitsArray.join('')} → ${conductorChain.join(' → ')}\n`;
    report += `You have numbers: ${Object.keys(counts).join(', ')}\n`;
    report += `Repeat Numbers: ${repeating.join(', ')}\n`;
    report += `Missing Numbers: ${missing.join(', ')}\n`;
    report += '__________________________________________________________________________________________\n\n';

    // Driver Number Details
    report += `${driverSingle} as Your Psychic/Driver Number\n`;
    report += `Compound: ${driverCompound} → Single: ${driverSingle}\n`;
    report += `Element: ${getElement(driverSingle)}\n`;
    let driverType = meanings.compound[driverCompound] ? meanings.compound[driverCompound].type : "regular";
    report += `Karmic: ${driverType==='karmic'?'Yes':'No'}, Master Number: ${driverType==='master'?'Yes':'No'}\n`;
    report += `Compound Number meaning (${driverCompound}): ${meanings.compound[driverCompound] ? meanings.compound[driverCompound].text : "Not applicable"}\n`;
    if(driverType==='karmic') report += `Karmic Number Meaning (${driverCompound}): ${meanings.karmic[driverCompound].text}\n`;
    if(driverType==='master') report += `Master Number Meaning (${driverCompound}): ${meanings.master[driverCompound].text}\n`;
    report += `Single Number meaning (${driverSingle}): ${meanings.single[driverSingle]}\n`;
    report += `Weaknesses / Lessons: Not implemented yet\n`;
    report += `People Born in ${driverCompound}: ${getPeopleNames(driverCompound)}\n`;
    report += '__________________________________________________________________________________________\n\n';

    // Conductor Number Details
    report += `${conductorSingle} as Your Destiny/Conductor Number\n`;
    report += `Compound: ${conductorCompound} → Single: ${conductorSingle}\n`;
    report += `Element: ${getElement(conductorSingle)}\n`;
    let conductorType = meanings.compound[conductorCompound] ? meanings.compound[conductorCompound].type : "regular";
    report += `Karmic: ${conductorType==='karmic'?'Yes':'No'}, Master Number: ${conductorType==='master'?'Yes':'No'}\n`;
    report += `Compound Number meaning (${conductorCompound}): ${meanings.compound[conductorCompound] ? meanings.compound[conductorCompound].text : "Not applicable"}\n`;
    if(conductorType==='karmic') report += `Karmic Number Meaning (${conductorCompound}): ${meanings.karmic[conductorCompound].text}\n`;
    if(conductorType==='master') report += `Master Number Meaning (${conductorCompound}): ${meanings.master[conductorCompound].text}\n`;
    report += `Single Number meaning (${conductorSingle}): ${meanings.single[conductorSingle]}\n`;
    report += `Weaknesses / Lessons: Not implemented yet\n`;
    report += `People have Destiny/Conductor in ${conductorCompound}/${conductorSingle}: ${getPeopleNames(conductorCompound)}\n`;
    report += '__________________________________________________________________________________________\n\n';

    document.getElementById("result").textContent = report;
}
