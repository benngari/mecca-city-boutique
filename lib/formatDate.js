export function formatDateTimeEAT(date) {
  return new Date(date).toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
export function formatDateEAT(date) {
  return new Date(date).toLocaleDateString('en-KE', {
    timeZone: 'Africa/Nairobi',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}