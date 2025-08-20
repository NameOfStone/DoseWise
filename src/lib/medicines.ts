import type { OfflineCalculationOutput, CalculationData } from "./types";

const toPersianNumerals = (n: number | string) => {
    const num = String(n);
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.replace(/[0-9]/g, (w) => persian[+w]);
};

const extractNumbers = (text: string) => {
    return text.match(/\d+(\.\d+)?/g)?.map(Number) || [];
}

const calculateDoseGeneric = (inputs: CalculationData, dosePerKgRange: [number, number?]): [number, number?] | null => {
    const { patientWeight } = inputs;
    const minDose = patientWeight * dosePerKgRange[0];
    const maxDose = dosePerKgRange[1] ? patientWeight * dosePerKgRange[1] : undefined;
    return [minDose, maxDose];
}

const calculateVolume = (doseRange: [number, number?], concentration: string): [number, number?] | null => {
    const concentrationNumbers = extractNumbers(concentration);
    if (concentrationNumbers.length < 2) return null;
    const [concValue, concVolume] = concentrationNumbers;
    
    const minVolume = (doseRange[0] * concVolume) / concValue;
    const maxVolume = doseRange[1] ? (doseRange[1] * concVolume) / concValue : undefined;
    
    return [minVolume, maxVolume];
}

const formatRange = (range: [number, number?], unit: string): string => {
    const roundedMin = toPersianNumerals(range[0].toFixed(1).replace('.0', ''));
    if (range[1] !== undefined) {
        const roundedMax = toPersianNumerals(range[1].toFixed(1).replace('.0', ''));
        return `${roundedMin} الی ${roundedMax} ${unit}`;
    }
    return `${roundedMin} ${unit}`;
}

const defaultWarning = "بر اساس اطلاعات ارائه شده، هیچ هشدار بالقوه‌ای یافت نشد.";
const defaultNoWarningResult = { hasWarning: false, warningMessage: defaultWarning };

const medicineCalculators: { [key: string]: (inputs: CalculationData) => OfflineCalculationOutput } = {
  "Acetaminophen": (inputs) => {
    const dosePerKgRange: [number, number] = [10, 15];
    const doseRange = calculateDoseGeneric(inputs, dosePerKgRange);
    if (!doseRange) return { ...defaultNoWarningResult, calculatedDose: "خطا در محاسبه", calculatedVolume: "خطا در محاسبه" };
    
    const volumeRange = calculateVolume(doseRange, inputs.syrupConcentration);
    if (!volumeRange) return { ...defaultNoWarningResult, calculatedDose: formatRange(doseRange, "میلی‌گرم"), calculatedVolume: "خطا در محاسبه" };

    return {
      ...defaultNoWarningResult,
      calculatedDose: formatRange(doseRange, "میلی‌گرم"),
      calculatedVolume: formatRange(volumeRange, "میلی‌لیتر"),
    };
  },
  "Ibuprofen": (inputs) => {
    const dosePerKgRange: [number, number] = [5, 10];
    const doseRange = calculateDoseGeneric(inputs, dosePerKgRange);
    if (!doseRange) return { ...defaultNoWarningResult, calculatedDose: "خطا در محاسبه", calculatedVolume: "خطا در محاسبه" };

    const volumeRange = calculateVolume(doseRange, inputs.syrupConcentration);
    if (!volumeRange) return { ...defaultNoWarningResult, calculatedDose: formatRange(doseRange, "میلی‌گرم"), calculatedVolume: "خطا در محاسبه" };
    
    let warning = defaultNoWarningResult;
    if (inputs.patientWeight < 6) { // Assuming 6 months ~ 6-7 kg
        warning = { hasWarning: true, warningMessage: "مصرف ایبوپروفن در کودکان زیر ۶ ماه توصیه نمی‌شود. با پزشک مشورت کنید." };
    }

    return {
      ...warning,
      calculatedDose: formatRange(doseRange, "میلی‌گرم"),
      calculatedVolume: formatRange(volumeRange, "میلی‌لیتر"),
    };
  },
  "Amoxicillin": (inputs) => {
    const dosePerKgRange: [number, number] = [25, 50]; // Mild to moderate
    const doseRange = calculateDoseGeneric(inputs, dosePerKgRange);
    if (!doseRange) return { ...defaultNoWarningResult, calculatedDose: "خطا در محاسبه", calculatedVolume: "خطا در محاسبه" };

    const volumeRange = calculateVolume(doseRange, inputs.syrupConcentration);
    if (!volumeRange) return { ...defaultNoWarningResult, calculatedDose: formatRange(doseRange, "میلی‌گرم"), calculatedVolume: "خطا در محاسبه" };

    return {
      ...defaultNoWarningResult,
      warningMessage: "دوز آموکسی‌سیلین به شدت عفونت بستگی دارد. این محاسبه بر اساس دوز استاندارد است. برای عفونت‌های شدید ممکن است دوز بالاتری نیاز باشد. همیشه با پزشک مشورت کنید.",
      calculatedDose: formatRange(doseRange, "میلی‌گرم در روز"),
      calculatedVolume: formatRange(volumeRange, "میلی‌لیتر در روز"),
    };
  },
  "Cetirizine": (inputs) => {
     let dose: [number, number?] | null = null;
     if (inputs.patientWeight >= 7 && inputs.patientWeight <= 20) { // Approx 2-5 years
        dose = [2.5];
     } else if (inputs.patientWeight > 20) { // Approx > 6 years
        dose = [5, 10];
     }

     if (!dose) return { 
         hasWarning: true, 
         warningMessage: "ستیریزین برای کودکان زیر دو سال بدون تجویز پزشک توصیه نمی‌شود.",
         calculatedDose: "نامشخص",
         calculatedVolume: "نامشخص"
     };

     const volumeRange = calculateVolume(dose, inputs.syrupConcentration);
     if (!volumeRange) return { ...defaultNoWarningResult, calculatedDose: formatRange(dose, "میلی‌گرم"), calculatedVolume: "خطا در محاسبه" };

     return {
        ...defaultNoWarningResult,
        calculatedDose: formatRange(dose, "میلی‌گرم"),
        calculatedVolume: formatRange(volumeRange, "میلی‌لیتر"),
     };
  }
};

export const calculateOffline = (inputs: CalculationData): OfflineCalculationOutput => {
  const calculator = medicineCalculators[inputs.medicineName];
  if (calculator) {
    return calculator(inputs);
  }
  return {
    hasWarning: true,
    warningMessage: "منطق محاسبه برای این دارو پیاده‌سازی نشده است.",
    calculatedDose: "نامشخص",
    calculatedVolume: "نامشخص",
  };
};

export const medicineLibrary = [
  {
    name: "Acetaminophen",
    guidelines: "۱۰ الی ۱۵ میلی‌گرم به ازای هر کیلوگرم وزن بدن در هر نوبت، هر ۴ الی ۶ ساعت. بیش از ۵ نوبت در ۲۴ ساعت مصرف نشود.",
    concentrations: ["۱۶۰ میلی‌گرم در ۵ میلی‌لیتر"],
  },
  {
    name: "Ibuprofen",
    guidelines: "۵ الی ۱۰ میلی‌گرم به ازای هر کیلوگرم وزن بدن در هر نوبت، هر ۶ الی ۸ ساعت. حداکثر دوز روزانه ۴۰ میلی‌گرم به ازای هر کیلوگرم است.",
    concentrations: ["۱۰۰ میلی‌گرم در ۵ میلی‌لیتر"],
  },
  {
    name: "Amoxicillin",
    guidelines: "عفونت‌های خفیف تا متوسط: ۲۵ الی ۵۰ میلی‌گرم به ازای کیلوگرم در روز در دوزهای منقسم هر ۸ الی ۱۲ ساعت. عفونت‌های شدید: ۸۰ الی ۹۰ میلی‌گرم به ازای کیلوگرم در روز در دوزهای منقسم هر ۸ الی ۱۲ ساعت.",
    concentrations: ["۱۲۵ میلی‌گرم در ۵ میلی‌لیتر", "۲۰۰ میلی‌گرم در ۵ میلی‌لیتر", "۲۵۰ میلی‌گرم در ۵ میلی‌لیتر", "۴۰۰ میلی‌گرم در ۵ میلی‌لیتر"],
  },
  {
    name: "Cetirizine",
    guidelines: "کودکان ۲ الی ۵ سال: ۲.۵ میلی‌گرم یک بار در روز. کودکان بالای ۶ سال و بزرگسالان: ۵ الی ۱۰ میلی‌گرم یک بار در روز.",
    concentrations: ["۵ میلی‌گرم در ۵ میلی‌لیتر"],
  },
];
