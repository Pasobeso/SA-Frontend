export function localizeRole(role: string) {
  switch (role) {
    case "Patient":
      return "ผู้ป่วย";
    case "Doctor":
      return "แพทย์";
    default:
      return "[ไม่ทราบประเภทผู้ใช้]";
  }
}
