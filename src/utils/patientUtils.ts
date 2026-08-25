export interface PatientAgeDetails {
  birthDateFormatted: string;
  ageYears: number;
  ageMonths: number;
  ageText: string;
  fullInfoText: string;
}

/**
 * Calculates birth date in DD/MM/YYYY and exact age in years and months.
 */
export function getPatientAgeAndBirthDate(birthDateStr?: string): PatientAgeDetails {
  if (!birthDateStr) {
    return {
      birthDateFormatted: 'Não informada',
      ageYears: 0,
      ageMonths: 0,
      ageText: 'Idade não informada',
      fullInfoText: 'Data de nascimento: Não informada • Idade: Não informada'
    };
  }

  let birthDate: Date;
  if (birthDateStr.includes('-')) {
    const parts = birthDateStr.split('-').map(Number);
    birthDate = new Date(parts[0], parts[1] - 1, parts[2] || 1);
  } else if (birthDateStr.includes('/')) {
    const parts = birthDateStr.split('/').map(Number);
    birthDate = new Date(parts[2] || new Date().getFullYear(), parts[1] - 1, parts[0]);
  } else {
    birthDate = new Date(birthDateStr);
  }

  if (isNaN(birthDate.getTime())) {
    return {
      birthDateFormatted: birthDateStr,
      ageYears: 0,
      ageMonths: 0,
      ageText: 'Idade não informada',
      fullInfoText: `Data de nascimento: ${birthDateStr}`
    };
  }

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const day = String(birthDate.getDate()).padStart(2, '0');
  const month = String(birthDate.getMonth() + 1).padStart(2, '0');
  const year = birthDate.getFullYear();
  const birthDateFormatted = `${day}/${month}/${year}`;

  let ageText = '';
  if (years > 0 && months > 0) {
    ageText = `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
  } else if (years > 0) {
    ageText = `${years} ${years === 1 ? 'ano' : 'anos'}`;
  } else if (months > 0) {
    ageText = `${months} ${months === 1 ? 'mês' : 'meses'}`;
  } else {
    ageText = 'Menos de 1 mês';
  }

  return {
    birthDateFormatted,
    ageYears: Math.max(0, years),
    ageMonths: Math.max(0, months),
    ageText,
    fullInfoText: `Data de nascimento: ${birthDateFormatted} • Idade: ${ageText}`
  };
}
