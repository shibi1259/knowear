const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function getDeliveryDate(date) {
  const dateObj = new Date(date);
  const day = weekDays[dateObj.getDay()];
  const month = months[dateObj.getMonth()];
  const dayOfMonth = dateObj.getDate();
  const year = dateObj.getFullYear();
  return `${day} ${month} ${dayOfMonth} ${year}`;
}

module.exports = {
    getDeliveryDate
};
