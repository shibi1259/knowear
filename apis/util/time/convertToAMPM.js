function convertToAMPM(timeString) {
    // Validate input format (HH:MM:SS)
    // const regex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    // if (!regex.test(timeString)) {
    //     return false;
    // }

    const [hours, minutes, seconds] = timeString.split(':').map(Number);
   
    // Validate hour, minute, and second ranges
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        return false;
    }

    // Convert to AM/PM format
    let period = 'AM';
    let formattedHours = hours;
    if (hours >= 12) {
        period = 'PM';
        formattedHours = hours === 12 ? 12 : hours - 12;
    }

    // Add leading zero for single-digit minutes and seconds
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    // Construct the formatted time string
    const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`;

    return formattedTime;
}



module.exports = {convertToAMPM}