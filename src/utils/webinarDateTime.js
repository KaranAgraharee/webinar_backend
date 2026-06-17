export const getWebinarStartDateTime = (webinar) => {
  const start = new Date(webinar.date);

  const match = String(webinar.time).match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
  );

  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();

    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    start.setHours(hours, minutes, 0, 0);
  }

  return start;
};
