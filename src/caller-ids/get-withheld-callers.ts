/**
 * Sometimes, the originating carrier for a call will pass through one of the following words as "from" caller id
 * https://support.twilio.com/hc/en-us/articles/223179988-Why-am-I-getting-calls-from-these-strange-numbers-
 */
const WITHHELD_NUMBERS = [
  '7378742833', // RESTRICTED
  '2562533', // BLOCKED
  '8656696', // UNKNOWN
  '266696687', // ANONYMOUS
  '86282452253', // UNAVAILABLE
  '464' // EMPTY OR No Caller ID
]

export const getWithheldCallers = () => {
  return WITHHELD_NUMBERS
}
