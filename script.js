async function generateReport() {
    // 1. Fetch Meanings Data
    const meanings = await fetch('meanings.json').then(res => res.json());

    // 2. Get User Input
    const birthdateInput = document.getElementById('birthdate').value;
    const location = document.getElementById('location').value;
    const gender = document.getElementById('gender').value;

    if (!birthdateInput || !location) {
        alert("Please fill in all fields.");
        return;
    }

    const birthDate = new Date(birthdateInput);
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = birthDate.getFullYear();

    // 3. --- CALCULATIONS ---

    // Function to sum digits until a single digit is reached
    const reduceToSingleDigit = (num) => {
        let sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        return (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) ? reduceToSingleDigit(sum) : sum;
    };
    
    // Function to sum digits once
    const sumDigits = (num) => {
        return num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    };

    // Psychic/Driver Number
    const psychicCompound = sumDigits(day);
    const psychicNumber = reduceToSingleDigit(day);

    // Destiny/Conductor Number
    const fullDateString = `${day}${month}${year}`;
    const destinyCompound = sumDigits(fullDateString);
    const destinyNumber = reduceToSingleDigit(destinyCompound);

    // Present, Repeating, and Missing Numbers
    const allDigits = (day.toString() + month.toString() + year.toString()).split('');
    const presentNumbersSet = new Set(allDigits.map(d => parseInt(d)).filter(d => d !== 0));
    presentNumbersSet.add(destinyNumber); // Add destiny number to the present list
    const presentNumbers = Array.from(presentNumbersSet).sort((a,b) => a-b);
    
    const allPossibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const missingNumbers = allPossibleNumbers.filter(n => !presentNumbersSet.has(n));

    const numberCounts = {};
    allDigits.forEach(digit => {
        const num = parseInt(digit);
        if(num !== 0) numberCounts[num] = (numberCounts[num] || 0) + 1;
    });
    const repeatingNumbers = Object.entries(numberCounts).filter(([_, count]) => count > 1).map(([num, count]) => `${num}(${count}x)`).join(', ');

    // Kua Number Calculation
    const yearSum = reduceToSingleDigit(year);
    let kuaNumber;
    if (gender === 'male') {
        kuaNumber = 11 - yearSum;
    } else {
        kuaNumber = 4 + yearSum;
    }
    kuaNumber = reduceToSingleDigit(kuaNumber);
    if (kuaNumber === 5) {
        kuaNumber = (gender === 'male') ? 2 : 8;
    }
    
    // Static numbers for this example
    const sunSignNumber = 9; // Mars in Scorpio
    const moonSignNumber = 8; // Saturn in Capricorn
    const ascendantNumber = 6; // Venus in Libra

    // Final Missing Numbers (after adding Kua, etc.)
    const finalPresentNumbers = new Set([...presentNumbers, kuaNumber, sunSignNumber, moonSignNumber, ascendantNumber]);
    const finalMissingNumbers = allPossibleNumbers.filter(n => !finalPresentNumbers.has(n));


    // 4. --- REPORT GENERATION ---

    const outputDiv = document.getElementById('reportOutput');

    const formattedDate = birthDate.toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: true
    });

    // Helper to get meanings and format them
    const getMeaning = (type, number) => meanings[type]?.[number] || "Not applicable";
    const getPeopleList = (type, number, compound) => {
        let key = compound && meanings[type][`${compound}/${number}`] ? `${compound}/${number}` : number.toString();
        return meanings[type]?.[key]?.join(', ') || "No famous people found for this number.";
    };

    const psychicIsKarmic = meanings.karmicNumbers.hasOwnProperty(psychicCompound);
    const destinyIsMaster = meanings.masterNumbers.hasOwnProperty(destinyCompound);

    // Combine all weaknesses
    const psychicWeaknesses = [
        getMeaning("singleNumbers", psychicNumber).weakness,
        psychicIsKarmic ? getMeaning("karmicNumbers", psychicCompound).meaning : null,
    ].filter(Boolean).join(' ');

    const destinyWeaknesses = [
        getMeaning("singleNumbers", destinyNumber).weakness,
        destinyIsMaster ? getMeaning("masterNumbers", destinyCompound).weakness : null
    ].filter(Boolean).join(' ');


    outputDiv.innerHTML = `
        <p><b>${formattedDate} in ${location}, is your birth day.</b></p>
        
        <h2>Your Core Numbers</h2>
        <p><span class="highlight">${psychicNumber}</span> is your <b>Psychic/Driver Number</b> from ${day} &rarr; ${psychicCompound} &rarr; ${psychicNumber}</p>
        <p><span class="highlight">${destinyNumber}</span> is your <b>Destiny/Conductor Number</b> from ${day}${month}${year} &rarr; ${destinyCompound} &rarr; ${destinyNumber}</p>
        <p>You have <span class="highlight">${presentNumbers.join(', ')}</span> numbers.</p>
        <p><b>Repeat Numbers:</b> ${repeatingNumbers || 'None'}</p>
        <p><b>So the Missing Numbers are:</b> ${missingNumbers.join(', ')}</p>
        
        <h2>Other important numbers you have:</h2>
        <p><span class="highlight">${kuaNumber}</span> as <b>KUA or Angel number</b> (${gender.charAt(0).toUpperCase() + gender.slice(1)})</p>
        <p><span class="highlight">${sunSignNumber}</span> from Mars as the <b>Sun Sign</b> in Scorpio</p>
        <p><span class="highlight">${moonSignNumber}</span> from Saturn, as the <b>Moon Sign</b> in Capricorn</p>
        <p><span class="highlight">${ascendantNumber}</span> from Venus as the <b>Rising Sun/Ascendant</b> in Libra</p>
        
        <p><b>Still, the Missing Numbers are:</b> <span class="highlight">${finalMissingNumbers.join(', ')}</span></p>

        <hr>
        
        <div class="section-title">${psychicNumber} as Your Psychic/Driver Number</div>
        <p><b>Compound:</b> ${psychicCompound} &rarr; <b>Single:</b> ${psychicNumber}</p>
        <p><b>Element:</b> ${getMeaning("elements", psychicNumber)}</p>
        <p><b>Karmic:</b> ${psychicIsKarmic ? 'Yes' : 'No'}, <b>Master Number:</b> No</p>
        <br>
        <p><b>Compound Number meaning (${psychicCompound}):</b> ${getMeaning("compoundNumbers", psychicCompound)}</p>
        <p><b>Karmic Number Meaning (${psychicCompound}):</b> ${psychicIsKarmic ? getMeaning("karmicNumbers", psychicCompound).meaning : "Not applicable"}</p>
        <p><b>Master Number Meaning (x):</b> Not applicable</p>
        <p><b>Single Number meaning (${psychicNumber}):</b> ${getMeaning("singleNumbers", psychicNumber).meaning}</p>
        <br>
        <p><b>Weakness could be:</b> ${psychicWeaknesses}</p>
        <p><b>People Born on the ${day}th are:</b> ${getPeopleList("psychicPeople", day)}</p>

        <hr>

        <div class="section-title">${destinyNumber} as Your Destiny/Conductor Number</div>
        <p>${day}${month}${year} &rarr; <b>Compound:</b> ${destinyCompound} &rarr; <b>Single:</b> ${destinyNumber}</p>
        <p><b>Element:</b> ${getMeaning("elements", destinyNumber)}</p>
        <p><b>Karmic:</b> No, <b>Master Number:</b> ${destinyIsMaster ? 'Yes' : 'No'}</p>
        <br>
        <p><b>Compound Number meaning (x):</b> Not applicable</p>
        <p><b>Karmic Number Meaning (x):</b> Not applicable</p>
        <p><b>Master Number Meaning (${destinyCompound}):</b> ${destinyIsMaster ? getMeaning("masterNumbers", destinyCompound).meaning : "Not applicable"}</p>
        <p><b>Single Number meaning (${destinyNumber}):</b> ${getMeaning("singleNumbers", destinyNumber).meaning}</p>
        <br>
        <p><b>Weakness could be:</b> ${destinyWeaknesses}</p>
        <p><b>People with Destiny/Conductor Number ${destinyCompound}/${destinyNumber} are:</b> ${getPeopleList("destinyPeople", destinyNumber, destinyCompound)}</p>
    `;
}