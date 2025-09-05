async function generateReport() {
    // 1. Clear previous errors and report
    document.getElementById('reportOutput').innerHTML = '';
    document.getElementById('date-error').textContent = '';
    document.getElementById('location-error').textContent = '';

    // 2. Get User Input
    const day = parseInt(document.getElementById('day').value);
    const month = parseInt(document.getElementById('month').value);
    const year = parseInt(document.getElementById('year').value);
    const location = document.getElementById('location').value; // Location is now optional
    const gender = document.querySelector('input[name="gender"]:checked').value;
    
    const hour = document.getElementById('hour').value ? parseInt(document.getElementById('hour').value) : null;
    const minute = document.getElementById('minute').value ? parseInt(document.getElementById('minute').value) : null;
    const ampm = hour ? document.querySelector('input[name="ampm"]:checked').value : 'AM';

    // 3. --- VALIDATION ---
    if (!day || !month || !year) {
        document.getElementById('date-error').textContent = 'Full date is required.';
        return;
    }
    const testDate = new Date(year, month - 1, day);
    if (testDate.getFullYear() !== year || testDate.getMonth() + 1 !== month || testDate.getDate() !== day) {
        document.getElementById('date-error').textContent = 'Please enter a valid date.';
        return;
    }

    // 4. Construct Date Object
    let birthDate;
    if (hour && minute !== null) {
        let hour24 = hour;
        if (ampm === 'PM' && hour < 12) hour24 += 12;
        if (ampm === 'AM' && hour === 12) hour24 = 0;
        birthDate = new Date(year, month - 1, day, hour24, minute);
    } else {
        birthDate = new Date(year, month - 1, day);
    }
    
    // 5. Fetch Meanings Data
    const meanings = await fetch('meanings.json').then(res => res.json());

    // 6. --- CALCULATIONS ---
    const reduceToSingleDigit = (num) => {
        let sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        return (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) ? reduceToSingleDigit(sum) : sum;
    };
    const sumDigits = (num) => num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);

    const psychicCompound = sumDigits(day);
    const psychicNumber = reduceToSingleDigit(day);
    const fullDateString = `${day}${month}${year}`;
    const destinyCompound = sumDigits(fullDateString);
    const destinyNumber = reduceToSingleDigit(destinyCompound);
    
    const allDigits = (day.toString() + month.toString() + year.toString()).split('');
    const presentNumbersSet = new Set(allDigits.map(d => parseInt(d)).filter(d => d !== 0));
    presentNumbersSet.add(destinyNumber);
    const presentNumbers = Array.from(presentNumbersSet).sort((a,b) => a-b);
    
    const allPossibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const missingNumbers = allPossibleNumbers.filter(n => !presentNumbersSet.has(n));

    const numberCounts = {};
    allDigits.forEach(digit => {
        const num = parseInt(digit);
        if(num !== 0) numberCounts[num] = (numberCounts[num] || 0) + 1;
    });
    const repeatingNumbers = Object.entries(numberCounts).filter(([_, count]) => count > 1).map(([num, count]) => `${num}(${count}x)`).join(', ');

    let yearForKua = year;
    if (month <= 2 && day < 4) {
        yearForKua = year - 1;
    }
    const yearSum = reduceToSingleDigit(yearForKua);
    let kuaNumber;
    if (gender === 'male') {
        kuaNumber = 11 - yearSum;
    } else {
        kuaNumber = 4 + yearSum;
    }
    kuaNumber = reduceToSingleDigit(kuaNumber);
    if (kuaNumber === 0) kuaNumber = 9;
    if (kuaNumber === 5) kuaNumber = (gender === 'male') ? 2 : 8;
    
    const finalPresentNumbers = new Set([...presentNumbers, kuaNumber]);
    const finalMissingNumbers = allPossibleNumbers.filter(n => !finalPresentNumbers.has(n));

    // 7. --- REPORT GENERATION ---
    const outputDiv = document.getElementById('reportOutput');
    const getMeaning = (type, number) => meanings[type]?.[number] || { meaning: "Not applicable", weakness: "" };
    const getCompoundMeaning = (number) => meanings.compoundNumbers?.[number] || "Not applicable";
    const getPeopleList = (type, key) => meanings[type]?.[key]?.join(', ') || "No famous people found.";

    const psychicIsKarmic = meanings.karmicNumbers.hasOwnProperty(psychicCompound);
    const destinyIsMaster = meanings.masterNumbers.hasOwnProperty(destinyCompound);

    const psychicWeaknesses = [
        getMeaning("singleNumbers", psychicNumber).weakness,
        psychicIsKarmic ? getMeaning("karmicNumbers", psychicCompound).meaning : null,
    ].filter(Boolean).join(' ');

    const destinyWeaknesses = [
        getMeaning("singleNumbers", destinyNumber).weakness,
        destinyIsMaster ? getMeaning("masterNumbers", destinyCompound).weakness : null
    ].filter(Boolean).join(' ');

    const formattedDate = birthDate.toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        ...(hour && { hour: 'numeric', minute: 'numeric', hour12: true })
    });

    outputDiv.innerHTML = `
        <p><b>${formattedDate}${location ? ` in ${location}` : ''}, is your birth day.</b></p>
        
        <h2>Your Core Numbers</h2>
        <p><span class="highlight">${psychicNumber}</span> is your <b>Psychic/Driver Number</b> from ${day} &rarr; ${psychicCompound} &rarr; ${psychicNumber}</p>
        <p><span class="highlight">${destinyNumber}</span> is your <b>Destiny/Conductor Number</b> from ${day}${month}${year} &rarr; ${destinyCompound} &rarr; ${destinyNumber}</p>
        <p>You have <span class="highlight">${presentNumbers.join(', ')}</span> numbers in your chart.</p>
        <p><b>Repeat Numbers:</b> ${repeatingNumbers || 'None'}</p>
        <p><b>Initial Missing Numbers:</b> ${missingNumbers.join(', ')}</p>
        
        <h2>Other Important Numbers</h2>
        <p><span class="highlight">${kuaNumber}</span> as your <b>KUA Number</b>. ${getMeaning("kuaNumbers", kuaNumber).meaning}</p>
        <p><b>Final Missing Numbers are:</b> <span class="highlight">${finalMissingNumbers.join(', ')}</span></p>
        <p><small><i><b>Note:</b> Sun Sign, Moon Sign, and Ascendant numbers require a full astrological chart from a site like astroseek.com and cannot be calculated here.</i></small></p>

        <hr>
        
        <div class="section-title">${psychicNumber} as Your Psychic/Driver Number</div>
        <p><b>Compound:</b> ${psychicCompound} &rarr; <b>Single:</b> ${psychicNumber}</p>
        <p><b>Karmic:</b> ${psychicIsKarmic ? 'Yes' : 'No'}, <b>Master Number:</b> No</p>
        <p><b>Compound Number meaning (${psychicCompound}):</b> ${getCompoundMeaning(psychicCompound)}</p>
        <p><b>Karmic Number Meaning (${psychicCompound}):</b> ${psychicIsKarmic ? getMeaning("karmicNumbers", psychicCompound).meaning : "Not applicable"}</p>
        <p><b>Single Number meaning (${psychicNumber}):</b> ${getMeaning("singleNumbers", psychicNumber).meaning}</p>
        <p><b>Weakness could be:</b> ${psychicWeaknesses}</p>
        <p><b>People Born on the ${day}th:</b> ${getPeopleList("psychicPeople", day)}</p>

        <hr>

        <div class="section-title">${destinyNumber} as Your Destiny/Conductor Number</div>
        <p>${day}${month}${year} &rarr; <b>Compound:</b> ${destinyCompound} &rarr; <b>Single:</b> ${destinyNumber}</p>
        <p><b>Karmic:</b> No, <b>Master Number:</b> ${destinyIsMaster ? 'Yes' : 'No'}</p>
        <p><b>Master Number Meaning (${destinyCompound}):</b> ${destinyIsMaster ? getMeaning("masterNumbers", destinyCompound).meaning : "Not applicable"}</p>
        <p><b>Single Number meaning (${destinyNumber}):</b> ${getMeaning("singleNumbers", destinyNumber).meaning}</p>
        <p><b>Weakness could be:</b> ${destinyWeaknesses}</p>
        <p><b>People with Destiny Number ${destinyIsMaster ? `${destinyCompound}/` : ''}${destinyNumber}:</b> ${getPeopleList("destinyPeople", `${destinyIsMaster ? `${destinyCompound}/` : ''}${destinyNumber}`)}</p>
        
        <div class="disclaimer">
            <p>Interpretations based on the principles of Cheiro's Book of Numbers.</p>
        </div>
    `;
}
